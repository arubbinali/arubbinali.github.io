// Enhanced skill badges with interactive animations
document.addEventListener('DOMContentLoaded', () => {
    const skillBadges = document.querySelectorAll('.skill-badge');
    
    if (skillBadges.length === 0) return;

    // Add special hover effects and animations to each badge
    skillBadges.forEach((badge, index) => {
        // Create glow effect container
        const glowEffect = document.createElement('div');
        glowEffect.className = 'badge-glow-effect';
        badge.appendChild(glowEffect);

        // Create skill icon particle container
        const particleContainer = document.createElement('div');
        particleContainer.className = 'badge-particles';
        badge.appendChild(particleContainer);

        // Get badge color from icon
        const iconEl = badge.querySelector('i');
        let badgeColor = window.getComputedStyle(iconEl).color;

        // Create particle elements
        for (let i = 0; i < 5; i++) {
            const particle = document.createElement('div');
            particle.className = 'badge-particle';
            particle.style.backgroundColor = badgeColor;
            particleContainer.appendChild(particle);
        }

        // Interactive hover animations
        badge.addEventListener('mouseenter', () => {
            // Activate particles
            particleContainer.classList.add('active');
            
            // Trigger glow pulse
            glowEffect.style.backgroundColor = badgeColor;
            glowEffect.classList.add('pulse');
            
            // Ripple effect
            createRippleEffect(badge, badgeColor);
            
            // Slightly change badge text brightness
            badge.style.color = '#ffffff';
            badge.style.fontWeight = '600';

            // Apply unique rotation to each badge
            const rotation = 2 - (index % 2) * 4; // Alternate direction
            badge.style.transform = `translateY(-5px) rotate(${rotation}deg)`;
        });

        badge.addEventListener('mouseleave', () => {
            // Deactivate particles
            particleContainer.classList.remove('active');
            
            // Remove glow pulse
            glowEffect.classList.remove('pulse');
            
            // Reset badge text
            badge.style.color = '';
            badge.style.fontWeight = '';
            
            // Reset rotation and position
            badge.style.transform = '';
        });

        // Make badges float slightly by default
        animateBadgeFloat(badge, index);
    });

    // Create ripple effect when badge is hovered
    function createRippleEffect(element, color) {
        const ripple = document.createElement('div');
        ripple.className = 'badge-ripple';
        
        // Set ripple color based on badge color
        ripple.style.borderColor = color;
        
        element.appendChild(ripple);
        
        // Trigger animation
        setTimeout(() => {
            ripple.style.transform = 'scale(2.5)';
            ripple.style.opacity = '0';
            
            // Clean up after animation
            setTimeout(() => {
                element.removeChild(ripple);
            }, 600);
        }, 10);
    }

    // Subtle floating animation for badges
    function animateBadgeFloat(badge, index) {
        // Unique timing for each badge
        const delay = index * 0.2;
        const duration = 2 + Math.random() * 1;
        
        // Set initial animation
        badge.style.animation = `badgeFloat ${duration}s ease-in-out ${delay}s infinite alternate`;
    }

    // Handle click effects
    skillBadges.forEach(badge => {
        badge.addEventListener('click', (e) => {
            // Add click animation class
            badge.classList.add('badge-click');
            
            // Remove the class after animation completes
            setTimeout(() => {
                badge.classList.remove('badge-click');
            }, 300);
        });
    });
});
