// Fix JavaScript errors on Atlas Fitness pages

// Fix 1: Safely handle the window.top redefinition
(function() {
    // Check if window.top is already defined and not configurable
    const descriptor = Object.getOwnPropertyDescriptor(window, 'top');
    if (descriptor && !descriptor.configurable) {
        console.log('[Fix] window.top is already defined and cannot be redefined');
        return;
    }
    
    // Only try to override if it's configurable
    try {
        Object.defineProperty(window, 'top', {
            get: function() {
                return window;
            },
            set: function() {
                return window;
            },
            configurable: true
        });
    } catch (e) {
        console.log('[Fix] Could not override window.top:', e);
    }
})();

// Fix 2: Safely handle null elements
document.addEventListener('DOMContentLoaded', function() {
    // Fix for back button
    const backButton = document.getElementById('back-to-selection');
    if (backButton) {
        // Remove any existing listeners first
        const newBackButton = backButton.cloneNode(true);
        backButton.parentNode.replaceChild(newBackButton, backButton);
        
        // Add the listener safely
        newBackButton.addEventListener('click', function() {
            const locationSelection = document.getElementById('location-selection');
            const formContainer = document.getElementById('form-container');
            const locationForms = document.querySelectorAll('.location-form');
            
            if (locationSelection) {
                locationSelection.style.display = 'block';
            }
            if (formContainer) {
                formContainer.classList.add('hidden');
            }
            locationForms.forEach(form => form.classList.remove('active'));
        });
    }
});

// Fix 3: Handle placeholder image error
window.addEventListener('error', function(e) {
    if (e.target.tagName === 'IMG' && e.target.src.includes('placeholder.com')) {
        // Replace with a local fallback or remove the preload
        e.target.style.display = 'none';
        console.log('[Fix] Placeholder image failed to load, hiding element');
    }
}, true);

// Fix 4: Prevent form iframe issues
(function() {
    // Override the problematic iframe code
    const iframes = document.querySelectorAll('iframe');
    iframes.forEach(function(iframe) {
        try {
            // Prevent navigation issues
            iframe.setAttribute('sandbox', 'allow-forms allow-scripts allow-same-origin allow-popups');
        } catch (e) {
            console.log('[Fix] Could not modify iframe:', e);
        }
    });
})();

console.log('[Fix] Error fixes applied');