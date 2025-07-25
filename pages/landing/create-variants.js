// Create A/B test variants for landing pages
const fs = require('fs');
const path = require('path');

// Variant B configurations - different headlines, CTAs, and colors
const variantBConfigs = {
    '6-week-challenge-harrogate': {
        headline: 'Join 150+ Harrogate Locals Who\'ve Transformed',
        subheadline: 'Proven 6-week programme with 100% money-back guarantee',
        ctaText: 'Start Your Transformation',
        formHeadline: 'Claim Your Free Consultation',
        formCtaText: 'Yes! I Want To Transform',
        heroClass: 'hero-transformation variant-b'
    },
    '6-week-challenge-york': {
        headline: 'York\'s #1 Body Transformation Programme',
        subheadline: 'Lose 1-2 stone in 6 weeks or your money back',
        ctaText: 'Get My Free Consultation',
        formHeadline: 'Limited Spaces Available',
        formCtaText: 'Secure My Spot Now',
        heroClass: 'hero-transformation variant-b'
    },
    'men-over-40-york': {
        headline: 'Finally, Fitness That Works for Men Over 40',
        subheadline: 'No intimidation, just results',
        ctaText: 'Book My Assessment',
        formHeadline: 'Get Back in Shape at 40+',
        formCtaText: 'Start My Journey',
        heroClass: 'hero-men-40 variant-b'
    },
    'summer-transformation-harrogate': {
        headline: 'Summer Body Countdown: 6 Weeks',
        subheadline: 'Look and feel amazing this summer',
        ctaText: 'Get Summer Ready',
        formHeadline: 'Summer Is Coming - Are You Ready?',
        formCtaText: 'Make This My Summer',
        heroClass: 'hero-summer variant-b'
    }
};

// Create variant B versions
Object.keys(variantBConfigs).forEach(baseName => {
    const originalPath = path.join(__dirname, `${baseName}.html`);
    const variantPath = path.join(__dirname, `${baseName}-b.html`);
    
    if (fs.existsSync(originalPath)) {
        let content = fs.readFileSync(originalPath, 'utf8');
        const config = variantBConfigs[baseName];
        
        // Replace variant
        content = content.replace('data-variant="control"', 'data-variant="variant-b"');
        content = content.replace('{{variant}}', 'variant-b');
        
        // Replace content with variant B versions
        Object.keys(config).forEach(key => {
            // Use more specific replacements to avoid replacing the wrong content
            if (key === 'headline') {
                content = content.replace(/<h1 class="hero-headline">.*?<\/h1>/s, 
                    `<h1 class="hero-headline">${config[key]}</h1>`);
            } else if (key === 'subheadline') {
                content = content.replace(/<p class="hero-subheadline">.*?<\/p>/s, 
                    `<p class="hero-subheadline">${config[key]}</p>`);
            } else if (key === 'ctaText') {
                content = content.replace(/class="btn btn-primary btn-large">.*?</g, 
                    `class="btn btn-primary btn-large">${config[key]}<`);
            } else if (key === 'heroClass') {
                content = content.replace(/class="hero[^"]*"/, `class="${config[key]}"`);
            }
        });
        
        // Write variant B file
        fs.writeFileSync(variantPath, content);
        console.log(`✅ Created variant B: ${baseName}-b.html`);
    }
});

console.log('\n✅ All variant B pages created!');

// Create a test routing configuration for Vercel
const vercelRoutes = {
    "rewrites": [
        {
            "source": "/lp/:test/:location",
            "destination": "/api/ab-test"
        }
    ]
};

// Update vercel.json with A/B test routes
const vercelConfigPath = path.join(__dirname, '..', '..', 'vercel.json');
let vercelConfig = {};

if (fs.existsSync(vercelConfigPath)) {
    vercelConfig = JSON.parse(fs.readFileSync(vercelConfigPath, 'utf8'));
}

// Merge rewrites
vercelConfig.rewrites = [
    ...(vercelConfig.rewrites || []),
    ...vercelRoutes.rewrites
];

fs.writeFileSync(vercelConfigPath, JSON.stringify(vercelConfig, null, 2));
console.log('✅ Updated vercel.json with A/B test routes');

console.log('\nA/B Test URLs:');
console.log('- /lp/6-week-challenge/harrogate');
console.log('- /lp/6-week-challenge/york');
console.log('- /lp/men-over-40/york');
console.log('- /lp/summer-transformation/harrogate');