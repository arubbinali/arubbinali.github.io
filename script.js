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
        const centerTextElements = document.querySelectorAll('.center-text, .center-text > *');
        const auraText = document.querySelector('.aura-text');
        centerTextElements.forEach(element => {
            element.style.textShadow = `
                0 0 10px rgba(255, 255, 255, 0.8),
                0 0 20px rgba(255, 255, 255, 0.6),
                0 0 30px rgba(255, 255, 255, 0.4),
                0 0 40px rgba(255, 255, 255, 0.2)`;
        });
        if (auraText) {
            auraText.style.textShadow = `
                0 0 10px rgba(255, 255, 255, 0.8),
                0 0 20px rgba(255, 255, 255, 0.6),
                0 0 30px rgba(255, 255, 255, 0.4),
                0 0 40px rgba(255, 255, 255, 0.2)`;
        }
    });

    button.addEventListener('mouseleave', () => {
        const centerTextElements = document.querySelectorAll('.center-text, .center-text > *');
        const auraText = document.querySelector('.aura-text');
        centerTextElements.forEach(element => {
            element.style.textShadow = 'none';
        });
        if (auraText) {
            auraText.style.textShadow = 'none';
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
    const centerTextElements = document.querySelectorAll('.center-text, .center-text > *');
    
    centerTextElements.forEach(element => {
        const rect = element.getBoundingClientRect();
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
        element.style.textShadow = shadows.join(', ');
    });
});

// Hamburger menu functionality
const hamburgerMenu = document.querySelector('.hamburger-menu');
const hamburgerLines = document.querySelector('.hamburger-lines');
const sideMenu = document.querySelector('.side-menu');
    
if (hamburgerMenu && hamburgerLines) {
    hamburgerLines.addEventListener('click', (e) => {
        e.stopPropagation(); // Prevent event from bubbling up
        hamburgerMenu.classList.toggle('active');
    });

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
        if (!hamburgerMenu.contains(e.target) && hamburgerMenu.classList.contains('active')) {
            hamburgerMenu.classList.remove('active');
        }
    });

    // Prevent menu from closing when clicking inside it
    if (sideMenu) {
        sideMenu.addEventListener('click', (e) => {
            e.stopPropagation();
        });
    }
}

// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyCeE7-jDke4HtDlYqMKRwGb0_IP-zDZKds",
    authDomain: "auraful.firebaseapp.com",
    databaseURL: "https://auraful-default-rtdb.firebaseio.com",
    projectId: "auraful",
    storageBucket: "auraful.firebasestorage.app",
    messagingSenderId: "113641021337",
    appId: "1:113641021337:web:1476970f873cca88de3d08",
    measurementId: "G-4HJCK9D24W"
};

// Initialize Firebase
const app = firebase.initializeApp(firebaseConfig);
const database = firebase.database(app);
const visitorRef = database.ref('visitors');

// Function to update counter display with animation
function updateCounterDisplay(count) {
    const counterElement = document.getElementById('cntr');
    if (!counterElement) return;
    
    const currentCount = parseInt(counterElement.textContent.replace(/,/g, '')) || 0;
    const newCount = count;
    
    // Update the counter with animation
    const digitBoxes = document.querySelectorAll('.digit-box');
    const newCountStr = newCount.toString().padStart(digitBoxes.length, '0');
    
    digitBoxes.forEach((box, index) => {
        const digit = parseInt(newCountStr[index]);
        const digitScroll = box.querySelector('.digit-scroll');
        if (digitScroll) {
            const currentTransform = getComputedStyle(digitScroll).transform;
            const currentY = currentTransform !== 'none' 
                ? parseInt(currentTransform.split(',')[5]) 
                : 0;
            
            digitScroll.style.transform = `translateY(${-digit * 100}%)`;
        }
    });
}

document.addEventListener('DOMContentLoaded', function() {
    // Check if this is a new session
    if (!sessionStorage.getItem('hasVisited')) {
        sessionStorage.setItem('hasVisited', 'true');
        
        // Increment visitor count in Firebase
        visitorRef.transaction((currentCount) => {
            return (currentCount || 0) + 1;
        });
    }
    
    // Listen for real-time updates
    visitorRef.on('value', (snapshot) => {
        const count = snapshot.val() || 0;
        updateCounterDisplay(count);
    });
    
    // Counter display setup
    const counterDisplay = document.querySelector('.counter-display');

    function createDigitBox() {
        const box = document.createElement('div');
        box.className = 'digit-box';
        const scroll = document.createElement('div');
        scroll.className = 'digit-scroll';
        
        // Create digits 0-9
        for (let i = 0; i <= 9; i++) {
            const span = document.createElement('span');
            span.textContent = i;
            scroll.appendChild(span);
        }
        
        box.appendChild(scroll);
        return box;
    }

    function createComma() {
        const comma = document.createElement('span');
        comma.className = 'counter-comma';
        comma.textContent = ',';
        return comma;
    }

    function formatWithCommas(num) {
        return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }

    function updateCounter(value) {
        counterDisplay.innerHTML = '';
        const formattedNumber = formatWithCommas(value.toString());
        const digits = formattedNumber.split('');
        const scrollElements = [];
        
        digits.forEach((char, index) => {
            if (char === ',') {
                counterDisplay.appendChild(createComma());
            } else {
                const box = createDigitBox();
                counterDisplay.appendChild(box);
                const scroll = box.querySelector('.digit-scroll');
                
                // Store scroll element and its target position
                if (scroll) {
                    scrollElements.push({
                        element: scroll,
                        targetPos: -parseInt(char) * 20
                    });
                }
            }
        });

        // Animate all digits at once
        requestAnimationFrame(() => {
            scrollElements.forEach(({element, targetPos}) => {
                element.style.transform = `translateY(${targetPos}px)`;
            });
        });
    }

    // Initial counter setup with animation
    setTimeout(() => {
        updateCounter(0);
    }, 500);

    // Listen for storage changes (other tabs)
    window.addEventListener('storage', (e) => {
        if (e.key === 'visitorCount') {
            const newCount = parseInt(e.newValue);
            if (!isNaN(newCount) && newCount !== 0) {
                updateCounter(newCount);
            }
        }
    });

    // Update display
    document.getElementById('cntr').textContent = 0;
});
