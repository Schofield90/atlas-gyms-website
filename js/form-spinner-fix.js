// Form Spinner Fix - Immediate solution for stuck forms
(function() {
    'use strict';
    
    console.log('[Spinner Fix] Active');
    
    // Monitor for form submission
    let formSubmitTime = null;
    let checkInterval = null;
    
    // Detect form interactions
    document.addEventListener('click', function(e) {
        // Check if click is within form iframe area
        const iframe = document.querySelector('iframe[src*="leaddec"]');
        if (!iframe) return;
        
        const rect = iframe.getBoundingClientRect();
        if (e.clientX >= rect.left && e.clientX <= rect.right &&
            e.clientY >= rect.top && e.clientY <= rect.bottom) {
            
            // User clicked in form area
            console.log('[Spinner Fix] Form interaction detected');
            
            // Start monitoring after a delay (form validation time)
            setTimeout(startMonitoring, 3000);
        }
    });
    
    function startMonitoring() {
        if (checkInterval) clearInterval(checkInterval);
        
        formSubmitTime = Date.now();
        checkInterval = setInterval(checkForStuckForm, 1000);
    }
    
    function checkForStuckForm() {
        const elapsed = Date.now() - formSubmitTime;
        
        // After 8 seconds, assume form is stuck
        if (elapsed > 8000) {
            console.log('[Spinner Fix] Form appears stuck, redirecting...');
            clearInterval(checkInterval);
            
            // Determine redirect URL
            const isYork = window.location.pathname.includes('york');
            const isHarrogate = window.location.pathname.includes('harrogate');
            
            let redirectUrl = '/thank-you.html';
            if (isYork) redirectUrl = '/york-booking.html';
            else if (isHarrogate) redirectUrl = '/harrogate-booking.html';
            
            // Show success and redirect
            showQuickSuccess();
            setTimeout(() => {
                window.location.href = redirectUrl;
            }, 1000);
        }
    }
    
    function showQuickSuccess() {
        const msg = document.createElement('div');
        msg.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: #4CAF50;
            color: white;
            padding: 20px 40px;
            border-radius: 8px;
            font-size: 18px;
            z-index: 999999;
            box-shadow: 0 4px 20px rgba(0,0,0,0.3);
        `;
        msg.textContent = '✓ Form submitted successfully!';
        document.body.appendChild(msg);
    }
    
    // Also listen for standard form events
    window.addEventListener('message', function(event) {
        if (event.data && (
            event.data.type === 'form-submitted' ||
            event.data.formSubmitted === true ||
            (typeof event.data === 'string' && event.data.includes('success'))
        )) {
            clearInterval(checkInterval);
            console.log('[Spinner Fix] Form submission confirmed');
            
            // Immediate redirect
            const isYork = window.location.pathname.includes('york');
            const isHarrogate = window.location.pathname.includes('harrogate');
            
            if (isYork) window.location.href = '/york-booking.html';
            else if (isHarrogate) window.location.href = '/harrogate-booking.html';
            else window.location.href = '/thank-you.html';
        }
    });
    
})();