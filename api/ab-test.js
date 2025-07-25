// A/B Testing Edge Function for Vercel
export const config = {
    runtime: 'edge',
};

// Test configurations
const AB_TESTS = {
    '6-week-challenge': {
        name: '6 Week Challenge Landing Page',
        variants: [
            {
                id: 'control',
                weight: 50,
                file: '6-week-challenge-{{location}}.html'
            },
            {
                id: 'variant-b',
                weight: 50,
                file: '6-week-challenge-{{location}}-b.html'
            }
        ]
    },
    'men-over-40': {
        name: 'Men Over 40 Landing Page',
        variants: [
            {
                id: 'control',
                weight: 50,
                file: 'men-over-40-{{location}}.html'
            },
            {
                id: 'variant-b',
                weight: 50,
                file: 'men-over-40-{{location}}-b.html'
            }
        ]
    }
};

export default async function handler(request) {
    const url = new URL(request.url);
    const pathname = url.pathname;
    
    // Extract test name and location from path
    // Expected format: /lp/[test-name]/[location]
    const pathParts = pathname.split('/').filter(Boolean);
    
    if (pathParts.length < 3 || pathParts[0] !== 'lp') {
        return new Response('Not Found', { status: 404 });
    }
    
    const testName = pathParts[1];
    const location = pathParts[2];
    
    // Get test configuration
    const test = AB_TESTS[testName];
    if (!test) {
        return new Response('Test not found', { status: 404 });
    }
    
    // Get or set variant
    const cookieName = `ab_test_${testName}`;
    const cookies = parseCookies(request.headers.get('cookie') || '');
    let variant = cookies[cookieName];
    
    // If no variant assigned, select one based on weights
    if (!variant || !test.variants.find(v => v.id === variant)) {
        variant = selectVariant(test.variants);
    }
    
    // Get the variant configuration
    const variantConfig = test.variants.find(v => v.id === variant);
    if (!variantConfig) {
        return new Response('Variant not found', { status: 404 });
    }
    
    // Construct the file path
    const fileName = variantConfig.file.replace('{{location}}', location);
    const filePath = `/pages/landing/${fileName}`;
    
    // Fetch the landing page
    const pageUrl = new URL(filePath, request.url);
    const pageResponse = await fetch(pageUrl);
    
    if (!pageResponse.ok) {
        return new Response('Landing page not found', { status: 404 });
    }
    
    // Get the page content
    let pageContent = await pageResponse.text();
    
    // Inject variant information
    pageContent = pageContent.replace('data-variant="control"', `data-variant="${variant}"`);
    pageContent = pageContent.replace('{{variant}}', variant);
    
    // Add tracking script
    const trackingScript = `
    <script>
        // A/B Test Tracking
        (function() {
            const testName = '${testName}';
            const variant = '${variant}';
            const location = '${location}';
            
            // Track test exposure
            if (window.leadTracker) {
                window.leadTracker.trackEvent('ab_test_exposure', {
                    test_name: testName,
                    variant: variant,
                    location: location
                });
            }
            
            // Store in session for attribution
            sessionStorage.setItem('ab_test_' + testName, variant);
        })();
    </script>
    `;
    
    // Inject tracking before </head>
    pageContent = pageContent.replace('</head>', trackingScript + '</head>');
    
    // Create response with variant cookie
    const response = new Response(pageContent, {
        status: 200,
        headers: {
            'Content-Type': 'text/html',
            'Cache-Control': 'no-cache',
            'Set-Cookie': `${cookieName}=${variant}; Path=/; Max-Age=2592000; SameSite=Lax`
        }
    });
    
    return response;
}

function parseCookies(cookieString) {
    const cookies = {};
    cookieString.split(';').forEach(cookie => {
        const [name, value] = cookie.trim().split('=');
        if (name && value) {
            cookies[name] = value;
        }
    });
    return cookies;
}

function selectVariant(variants) {
    const totalWeight = variants.reduce((sum, v) => sum + v.weight, 0);
    const random = Math.random() * totalWeight;
    
    let accumulator = 0;
    for (const variant of variants) {
        accumulator += variant.weight;
        if (random < accumulator) {
            return variant.id;
        }
    }
    
    return variants[0].id; // Fallback
}