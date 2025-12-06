document.addEventListener('DOMContentLoaded', () => {
    const card = document.getElementById('card');
    const content = card.querySelector('.card-content');

    // Select layers (Desktop)
    const layerBg = card.querySelector('.layer.-bg .parallax-layer');
    const layerMid = card.querySelector('.layer.-mid .parallax-layer');
    const layerFg = card.querySelector('.layer.-fg .parallax-layer');

    // Config
    const rotateIntensity = 20; // Max rotation in degrees

    card.addEventListener('mousemove', (e) => {
        // Only run if desktop view is active (check if desktop wrapper is visible)
        if (window.innerWidth <= 768) return;

        const rect = card.getBoundingClientRect();

        // Calculate mouse position relative to card center
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        const rotateX = ((y - centerY) / centerY) * -rotateIntensity;
        const rotateY = ((x - centerX) / centerX) * rotateIntensity;

        // Apply transformation to container
        content.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;

        // Parallax effect unique for each layer
        const moveX = (x - centerX) / 20;
        const moveY = (y - centerY) / 20;

        // Background moves slightly
        if (layerBg) {
            layerBg.style.transform = `scale(1.1) translateX(${moveX * 0.5}px) translateY(${moveY * 0.5}px)`;
        }

        // Mid-ground moves moderately
        if (layerMid) {
            layerMid.style.transform = `scale(1.1) translateZ(25px) translateX(${moveX * 1.0}px) translateY(${moveY * 1.0}px)`;
        }

        // Foreground moves more
        if (layerFg) {
            layerFg.style.transform = `scale(1.1) translateZ(50px) translateX(${moveX * 1.5}px) translateY(${moveY * 1.5}px)`;
        }
    });

    card.addEventListener('mouseleave', () => {
        // Reset transformation on mouse leave
        content.style.transform = 'rotateX(0deg) rotateY(0deg)';

        if (layerBg) layerBg.style.transform = 'scale(1.1)';
        if (layerMid) layerMid.style.transform = 'scale(1.1) translateZ(0px)';
        if (layerFg) layerFg.style.transform = 'scale(1.1) translateZ(0px)';

        // Add smooth transition for reset
        const elements = [content, layerBg, layerMid, layerFg].filter(el => el);

        elements.forEach(el => {
            el.style.transition = 'transform 0.5s ease';
        });

        setTimeout(() => {
            elements.forEach(el => {
                el.style.transition = 'transform 0.1s ease-out';
            });
        }, 500);
    });

    // Add mouse entry transition smoothing
    card.addEventListener('mouseenter', () => {
        const elements = [content, layerBg, layerMid, layerFg].filter(el => el);
        elements.forEach(el => {
            el.style.transition = 'transform 0.1s ease-out';
        });
    });
});
