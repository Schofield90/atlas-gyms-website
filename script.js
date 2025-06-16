// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Add scroll effect to navbar
window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 100) {
        navbar.style.backgroundColor = 'rgba(0, 0, 0, 0.95)';
    } else {
        navbar.style.backgroundColor = '#000';
    }
});

// CTA button click handlers
document.querySelectorAll('.main-cta, .contact-cta, .cta-button').forEach(button => {
    button.addEventListener('click', function(e) {
        e.preventDefault();
        // Add your form or booking logic here
        alert('Ready to start your transformation? Contact us at info@atlas-gyms.co.uk or call us to book your free consultation!');
    });
});