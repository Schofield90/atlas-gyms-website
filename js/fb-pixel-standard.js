<!-- Facebook Pixel Code -->
<script>
console.log('[FB Pixel] Starting standard Facebook Pixel implementation');

!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');

fbq('init', '1513024026124107');
fbq('track', 'PageView');

console.log('[FB Pixel] Standard implementation complete');

// Additional tracking
document.addEventListener('DOMContentLoaded', function() {
    console.log('[FB Pixel] DOM loaded, setting up additional tracking');
    
    // Track form interactions
    document.addEventListener('focusin', function(e) {
        if (e.target.matches('form input, form select, form textarea')) {
            const form = e.target.closest('form');
            if (form && !form.dataset.fbTracked) {
                form.dataset.fbTracked = 'true';
                fbq('track', 'InitiateCheckout', {
                    value: 50.00,
                    currency: 'GBP'
                });
            }
        }
    });
    
    // Track form submissions
    document.addEventListener('submit', function(e) {
        if (e.target.matches('form')) {
            fbq('track', 'Lead', {
                value: 50.00,
                currency: 'GBP'
            });
        }
    });
});
</script>
<noscript>
<img height="1" width="1" style="display:none"
src="https://www.facebook.com/tr?id=1513024026124107&ev=PageView&noscript=1"/>
</noscript>
<!-- End Facebook Pixel Code -->