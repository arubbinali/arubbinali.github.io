// Matrix Digital Rain Animation
const canvas = document.getElementById('particleCanvas');
const ctx = canvas.getContext('2d');

// Set canvas size
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// Matrix character class
class MatrixChar {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.reset();
    }

    reset() {
        this.speed = Math.random() * 2 + 1;
        this.value = String.fromCharCode(
            Math.random() > 0.5 
                ? Math.floor(Math.random() * 10) + 48  // Numbers
                : Math.floor(Math.random() * 26) + 65  // Letters
        );
        this.opacity = 0;
        this.maxOpacity = Math.random() * 0.5 + 0.2;
        this.fadeSpeed = Math.random() * 0.02 + 0.005;
        this.size = Math.floor(Math.random() * 16) + 10;
    }

    update() {
        this.y += this.speed;
        
        // Fade in
        if (this.opacity < this.maxOpacity) {
            this.opacity += this.fadeSpeed;
        }

        // Reset when off screen
        if (this.y > canvas.height + 50) {
            this.y = -20;
            this.x = Math.random() * canvas.width;
            this.reset();
        }
    }

    draw() {
        ctx.font = `${this.size}px monospace`;
        ctx.fillStyle = `rgba(255, 255, 255, ${this.opacity})`;
        ctx.fillText(this.value, this.x, this.y);
    }
}

// Create matrix characters
const columns = Math.floor(canvas.width / 20);
const matrixChars = [];

for (let i = 0; i < columns * 2; i++) {
    const x = Math.random() * canvas.width;
    const y = Math.random() * canvas.height;
    matrixChars.push(new MatrixChar(x, y));
}

// Animation loop
function animate() {
    ctx.fillStyle = 'rgba(10, 10, 10, 0.1)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    matrixChars.forEach(char => {
        char.update();
        char.draw();
    });

    requestAnimationFrame(animate);
}

// Start animation
animate();

// Handle button hover states and text glow
document.querySelectorAll('.void-button').forEach(button => {
    button.addEventListener('mouseenter', () => {
        const text = document.querySelector('.center-text');
        if (text) {
            text.style.textShadow = `
                0 0 10px rgba(255, 255, 255, 0.8),
                0 0 20px rgba(255, 255, 255, 0.6),
                0 0 30px rgba(255, 255, 255, 0.4),
                0 0 40px rgba(255, 255, 255, 0.2)`;
        }
    });

    button.addEventListener('mouseleave', () => {
        const text = document.querySelector('.center-text');
        if (text) {
            text.style.textShadow = 'none';
        }
    });
});

// Existing scroll handling code
const navbar = document.querySelector('.navbar');
const sections = document.querySelectorAll('.info-section');

function updateScrollEffects(scrollPos) {
    navbar.style.backgroundColor = `rgba(10, 10, 10, ${Math.min(0.95, 0.8 + scrollPos / 1000)})`;
    
    sections.forEach((section, index) => {
        const rect = section.getBoundingClientRect();
        const isInView = rect.top <= window.innerHeight * 0.8;
        
        if (isInView && !section.classList.contains('animated')) {
            section.style.animationDelay = `${index * 0.2}s`;
            section.classList.add('animated');
        }
    });
}

let ticking = false;
window.addEventListener('scroll', () => {
    if (!ticking) {
        window.requestAnimationFrame(() => {
            updateScrollEffects(window.pageYOffset);
            ticking = false;
        });
        ticking = true;
    }
});

// Dynamic shadow based on cursor
document.addEventListener('mousemove', (e) => {
    const centerText = document.querySelector('.center-text');
    const rect = centerText.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    // Calculate angle between cursor and text center
    const dx = e.clientX - centerX;
    const dy = e.clientY - centerY;
    
    // Calculate shadow offset (opposite to cursor direction)
    const shadowX = -dx / 15;
    const shadowY = -dy / 15;
    
    // Create connected shadow effect with fade
    let shadows = [];
    const steps = 15;
    
    for(let i = 0; i <= steps; i++) {
        const stepX = (shadowX * i) / steps;
        const stepY = (shadowY * i) / steps;
        // Calculate opacity that starts at 0.95 and fades to 0.1
        const opacity = 0.95 - (i / steps) * 0.85;
        shadows.push(`${stepX}px ${stepY}px 0 rgba(0, 0, 0, ${opacity})`);
    }
    
    // Update shadow
    centerText.style.textShadow = shadows.join(', ');
});

document.querySelectorAll('.void-button').forEach(button => {
    button.addEventListener('mouseenter', () => {
        const text = document.querySelector('.center-text');
        if (text) {
            text.style.textShadow = 'none'; // No glow effect
        }
    });

    button.addEventListener('mouseleave', () => {
        const text = document.querySelector('.center-text');
        if (text) {
            text.style.textShadow = 'none'; // Ensure no glow remains
        }
    });
});
