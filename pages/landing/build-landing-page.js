// Landing Page Builder - Generates landing pages from template
const fs = require('fs');
const path = require('path');

class LandingPageBuilder {
    constructor() {
        this.templatePath = path.join(__dirname, 'templates', 'base-template.html');
        this.outputDir = __dirname;
    }

    async buildPage(config) {
        try {
            // Read template
            const template = fs.readFileSync(this.templatePath, 'utf8');
            
            // Replace placeholders
            let html = template;
            
            // Replace all config values
            Object.keys(config).forEach(key => {
                const regex = new RegExp(`{{${key}}}`, 'g');
                html = html.replace(regex, config[key] || '');
            });
            
            // Generate filename
            const filename = config.filename || `${config.campaign}-${config.location}.html`;
            const outputPath = path.join(this.outputDir, filename);
            
            // Write file
            fs.writeFileSync(outputPath, html);
            
            console.log(`✅ Created landing page: ${filename}`);
            
            return outputPath;
        } catch (error) {
            console.error('Error building landing page:', error);
            throw error;
        }
    }
}

// Landing page configurations
const landingPages = [
    {
        // 6 Week Challenge - Harrogate
        filename: '6-week-challenge-harrogate.html',
        title: '6 Week Body Transformation Challenge - Harrogate',
        description: 'Join our proven 6-week transformation programme in Harrogate. Lose 1-2 stone with expert coaching, nutrition support, and a money-back guarantee.',
        ogImage: '/images/transformations/harrogate-group.jpg',
        campaign: '6-week-challenge',
        variant: 'control',
        location: 'harrogate',
        locationName: 'Harrogate',
        heroImage: '/images/gym-photos/harrogate-hero.jpg',
        heroClass: 'hero-transformation',
        headline: 'Transform Your Body in 6 Weeks',
        subheadline: 'Join 150+ Harrogate locals who\'ve lost 1-2 stone with our proven programme',
        trustBadges: `
            <span class="trust-badge">✓ 100% Money-Back Guarantee</span>
            <span class="trust-badge">✓ No Gym Intimidation</span>
            <span class="trust-badge">✓ Expert Nutrition Support</span>
        `,
        ctaText: 'Book Your Free Consultation',
        clientCount: '150',
        content: `
            <section class="benefits-section">
                <div class="container">
                    <h2>What You Get in Our 6-Week Programme</h2>
                    <div class="benefits-grid">
                        <div class="benefit">
                            <h3>Personal Training</h3>
                            <p>3-4 coached sessions per week in small groups (max 6 people)</p>
                        </div>
                        <div class="benefit">
                            <h3>Nutrition Coaching</h3>
                            <p>Simple meal plans that fit your lifestyle - no extreme diets</p>
                        </div>
                        <div class="benefit">
                            <h3>24/7 Support</h3>
                            <p>WhatsApp support group with coaches and other members</p>
                        </div>
                        <div class="benefit">
                            <h3>Progress Tracking</h3>
                            <p>Weekly check-ins, measurements, and photos to track your results</p>
                        </div>
                    </div>
                </div>
            </section>
        `,
        formHeadline: 'Ready to Start Your Transformation?',
        formSubheadline: 'Book your free consultation today (no obligation)',
        formCtaText: 'Get Started Now',
        analytics: `
            <!-- Google Analytics 4 -->
            <script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
            <script>
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', 'G-XXXXXXXXXX');
            </script>
            
            <!-- Facebook Pixel -->
            <script>
                !function(f,b,e,v,n,t,s)
                {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
                n.callMethod.apply(n,arguments):n.queue.push(arguments)};
                if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
                n.queue=[];t=b.createElement(e);t.async=!0;
                t.src=v;s=b.getElementsByTagName(e)[0];
                s.parentNode.insertBefore(t,s)}(window, document,'script',
                'https://connect.facebook.net/en_US/fbevents.js');
                fbq('init', '1325695844113066');
                fbq('track', 'PageView');
            </script>
        `
    },
    {
        // 6 Week Challenge - York
        filename: '6-week-challenge-york.html',
        title: '6 Week Body Transformation Challenge - York',
        description: 'Join our proven 6-week transformation programme in York. Lose 1-2 stone with expert coaching, nutrition support, and a money-back guarantee.',
        ogImage: '/images/transformations/york-group.jpg',
        campaign: '6-week-challenge',
        variant: 'control',
        location: 'york',
        locationName: 'York',
        heroImage: '/images/gym-photos/york-hero.jpg',
        heroClass: 'hero-transformation',
        headline: 'Drop 1-2 Stone in 6 Weeks',
        subheadline: 'Join York\'s most supportive fitness community',
        trustBadges: `
            <span class="trust-badge">✓ 100% Money-Back Guarantee</span>
            <span class="trust-badge">✓ Beginners Welcome</span>
            <span class="trust-badge">✓ Proven Results</span>
        `,
        ctaText: 'Book Your Free Consultation',
        clientCount: '200',
        content: `
            <section class="transformation-section">
                <div class="container">
                    <h2>Real Results from Real People</h2>
                    <div class="transformations-grid">
                        <img src="/images/client-portraits/transformation-1.jpg" alt="Client transformation">
                        <img src="/images/client-portraits/transformation-2.jpg" alt="Client transformation">
                        <img src="/images/client-portraits/transformation-3.jpg" alt="Client transformation">
                    </div>
                </div>
            </section>
        `,
        formHeadline: 'Start Your 6-Week Transformation',
        formSubheadline: 'Limited spaces available - book your free consultation now',
        formCtaText: 'Reserve Your Spot',
        analytics: `<!-- Analytics code here -->`
    },
    {
        // Men Over 40 - York
        filename: 'men-over-40-york.html',
        title: 'Fitness for Men Over 40 - York',
        description: 'Specialized fitness programme for men over 40 in York. Build strength, lose weight, and feel younger with age-appropriate training.',
        ogImage: '/images/transformations/men-over-40.jpg',
        campaign: 'men-over-40',
        variant: 'control',
        location: 'york',
        locationName: 'York',
        heroImage: '/images/gym-photos/men-training.jpg',
        heroClass: 'hero-men-40',
        headline: 'Fitness Designed for Men Over 40',
        subheadline: 'Build strength, lose weight, and feel 10 years younger',
        trustBadges: `
            <span class="trust-badge">✓ Age-Appropriate Training</span>
            <span class="trust-badge">✓ Joint-Friendly Exercises</span>
            <span class="trust-badge">✓ No Previous Experience Needed</span>
        `,
        ctaText: 'Book Your Free Assessment',
        clientCount: '80',
        content: `
            <section class="why-us-section">
                <div class="container">
                    <h2>Why Men Over 40 Choose Atlas Fitness</h2>
                    <ul class="benefits-list">
                        <li>Training designed specifically for your age and fitness level</li>
                        <li>Focus on functional strength and mobility</li>
                        <li>Small groups with men at similar life stages</li>
                        <li>Flexible scheduling around work and family</li>
                        <li>Nutrition advice that works with real life</li>
                    </ul>
                </div>
            </section>
        `,
        formHeadline: 'Ready to Feel Stronger?',
        formSubheadline: 'Book your free fitness assessment (no pressure to join)',
        formCtaText: 'Get Your Free Assessment',
        analytics: `<!-- Analytics code here -->`
    },
    {
        // Summer Transformation - Harrogate
        filename: 'summer-transformation-harrogate.html',
        title: 'Summer Body Transformation - Harrogate',
        description: 'Get summer ready with our 6-week transformation programme in Harrogate. Lose weight, tone up, and feel confident.',
        ogImage: '/images/transformations/summer-ready.jpg',
        campaign: 'summer-transformation',
        variant: 'control',
        location: 'harrogate',
        locationName: 'Harrogate',
        heroImage: '/images/gym-photos/summer-training.jpg',
        heroClass: 'hero-summer',
        headline: 'Get Your Summer Body in 6 Weeks',
        subheadline: 'Feel confident and strong this summer',
        trustBadges: `
            <span class="trust-badge">✓ Visible Results in 6 Weeks</span>
            <span class="trust-badge">✓ Fun, Supportive Environment</span>
            <span class="trust-badge">✓ Nutrition Support Included</span>
        `,
        ctaText: 'Start Your Transformation',
        clientCount: '150',
        content: `
            <section class="summer-ready-section">
                <div class="container">
                    <h2>Be Summer Ready in Just 6 Weeks</h2>
                    <div class="timeline">
                        <div class="timeline-item">
                            <h3>Week 1-2</h3>
                            <p>Build healthy habits and see initial results</p>
                        </div>
                        <div class="timeline-item">
                            <h3>Week 3-4</h3>
                            <p>Notice increased energy and strength</p>
                        </div>
                        <div class="timeline-item">
                            <h3>Week 5-6</h3>
                            <p>See visible transformation and feel amazing</p>
                        </div>
                    </div>
                </div>
            </section>
        `,
        formHeadline: 'Summer Starts Now',
        formSubheadline: 'Limited spaces - secure your spot today',
        formCtaText: 'Book My Consultation',
        analytics: `<!-- Analytics code here -->`
    }
];

// Build all landing pages
const builder = new LandingPageBuilder();

landingPages.forEach(config => {
    builder.buildPage(config);
});

console.log('\n✅ All landing pages created successfully!');
console.log('Next steps:');
console.log('1. Add your Google Analytics ID');
console.log('2. Add your Facebook Pixel ID');
console.log('3. Upload hero images and transformation photos');
console.log('4. Test all pages locally');
console.log('5. Deploy to Vercel');