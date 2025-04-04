window.onload = function() {
    let preloadIframe = document.createElement("iframe");
    preloadIframe.src = "for site/move/main.html";
    preloadIframe.style.display = "none";
    document.body.appendChild(preloadIframe);
};

document.addEventListener('DOMContentLoaded', () => {
    // Get the elements
    const introScreen = document.getElementById('intro-screen'); // Updated id
    const mainContentWrapper = document.getElementById('main-content-wrapper'); // Updated id
    
    // Set a delay for when to fade out the intro (this delay should be the length of the intro animations + fade-out time)
    const introDuration = 3000; // 3 seconds based on your animation duration
    const fadeOutDuration = 1000; // 1 second for fade-out effect

    // Wait for the intro to finish, then hide it and show the content
    setTimeout(() => {
        introScreen.style.opacity = 0; // Fade out the intro
        introScreen.style.transition = `opacity ${fadeOutDuration / 1000}s ease-out`;

        // Once intro is faded out, show the content
        setTimeout(() => {
            introScreen.style.display = 'none'; // Remove intro from the DOM
            mainContentWrapper.classList.remove('hidden'); // Show the main content
            mainContentWrapper.classList.add('visible'); // Make sure the content fades in (if necessary)
        }, fadeOutDuration); // After fade-out completes
    }, introDuration); // Wait for intro animations to complete
});

// Ensure the DOM is fully loaded before running the script
document.addEventListener('DOMContentLoaded', function () {
    const scrollArrow = document.getElementById('scrollArrow');  // Get the down arrow element

    // Function to handle scroll behavior and fading of the arrow
    function handleScroll() {
        if (window.scrollY > 10) {
            scrollArrow.style.opacity = 0;  // Fade out
        } else {
            scrollArrow.style.opacity = 0.6;  // Fade in
        }
    }

    // Add scroll event listener to track the scroll position
    window.addEventListener('scroll', handleScroll);

    // Initial check to handle cases when the page is already scrolled
    handleScroll();
});

// Ensure the DOM is fully loaded before running the script
document.addEventListener('DOMContentLoaded', function () {
    const scrollToTop = document.getElementById('scrollToTop');  // Get the scroll-to-top button

    // Function to handle button visibility based on scroll position
    function handleScroll() {
        if (window.scrollY > 100) {
            scrollToTop.classList.add('visible');  // Show button
        } else {
            scrollToTop.classList.remove('visible');  // Hide button
        }
    }

    // Function to handle smooth scroll to top
    function scrollToTopHandler() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    }

    // Add event listener for scroll event to toggle visibility
    window.addEventListener('scroll', handleScroll);

    // Add click event listener to scroll to top
    scrollToTop.addEventListener('click', scrollToTopHandler);

    // Initial check for page load
    handleScroll();
});

document.addEventListener('DOMContentLoaded', function () {
    const introScreen = document.getElementById('intro-screen');
    
    // Function to create particles with random movement
    function createParticles() {
        for (let i = 0; i < 50; i++) {  // Number of particles
            const particle = document.createElement('div');
            particle.classList.add('particle');
            
            // Set random particle size
            const size = Math.random() * 5 + 5;  // Random size between 5px and 10px
            particle.style.width = `${size}px`;
            particle.style.height = `${size}px`;
            
            // Set random initial position within the intro screen
            particle.style.top = `${Math.random() * 100}%`;
            particle.style.left = `${Math.random() * 100}%`;
            
            // Randomize movement distance and duration
            const randomX = Math.random() * 200 - 100;  // Random X movement between -100px and 100px
            const randomY = Math.random() * 200 - 100;  // Random Y movement between -100px and 100px
            const randomDuration = Math.random() * 4 + 4; // Random duration between 4s and 8s
            
            // Set custom CSS properties for each particle
            particle.style.setProperty('--random-x', `${randomX}px`);
            particle.style.setProperty('--random-y', `${randomY}px`);
            particle.style.setProperty('--random-duration', `${randomDuration}s`);
            
            // Append particle to the intro screen
            introScreen.appendChild(particle);
        }
    }
    
    // Initial particle creation
    createParticles();

    // Optionally, keep generating particles continuously
    setInterval(createParticles, 5000);  // You can adjust the interval for more particles over time
});

// JavaScript to handle the hover text and main image click functionality
document.addEventListener("DOMContentLoaded", () => {
    // Dynamic hover text for nav links
    const navLinks = document.querySelectorAll('.nav-content a');
    const hoverText = document.querySelector('.hover-text');

    navLinks.forEach(link => {
        link.addEventListener('mouseover', () => {
            hoverText.textContent = link.getAttribute('data-hover');
            hoverText.style.opacity = '1';
        });

        link.addEventListener('mouseout', () => {
            hoverText.style.opacity = '0';
        });
    });

    // --- Interactive Terminal Logic START ---
    const terminalOutput = document.getElementById('terminal-output');
    const terminalInput = document.getElementById('terminal-input');
    const terminalElement = document.getElementById('terminal');
    const terminalIcon = document.getElementById('terminal-icon'); // Get the icon
    const screenDimmer = document.getElementById('screen-dimmer'); // Get the dimmer
    const fullscreenIcon = document.getElementById('fullscreen-icon'); // Get fullscreen icon

    // Helper function for typewriter effect
    function typewriterEffect(element, htmlString, speed, callback) {
        element.innerHTML = ''; // Clear the element first
        const terminalOutput = document.getElementById('terminal-output'); // Need access for scrolling
        let i = 0;
        let currentHTML = '';
        let inTag = false;
        let tagBuffer = '';

        function type() {
            if (i < htmlString.length) {
                const char = htmlString[i];

                if (char === '<') {
                    inTag = true;
                    tagBuffer = char;
                } else if (char === '>') {
                    inTag = false;
                    tagBuffer += char;
                    currentHTML += tagBuffer; // Add the complete tag at once
                    element.innerHTML = currentHTML;
                    tagBuffer = '';
                } else if (inTag) {
                    tagBuffer += char;
                } else {
                    // Handle explicit newlines used in string construction
                    if (char === '\\n') {
                        currentHTML += '<br>';
                    } else {
                        currentHTML += char;
                    }
                    element.innerHTML = currentHTML;
                }

                i++;
                // Auto-scroll
                if (terminalOutput) {
                    terminalOutput.scrollTop = terminalOutput.scrollHeight;
                }
                setTimeout(type, speed); // Continue typing
            } else {
                // Typing finished
                if (callback) {
                    callback();
                }
            }
        }

        type(); // Start the typing process
    }

    // Function to auto-adjust terminal height (Reverted Logic)
    function adjustTerminalHeight() {
        // Only adjust height if the terminal is open and NOT fullscreen
        if (!terminalElement.classList.contains('open') || terminalElement.classList.contains('fullscreen')) return;

        const currentHeight = terminalElement.offsetHeight;
        const scrollHeight = terminalOutput.scrollHeight;
        const clientHeight = terminalOutput.clientHeight; // Visible height of the output area
        const inputHeight = terminalElement.querySelector('#terminal-input-line').offsetHeight;
        const padding = 20; // Approximate padding/borders etc.
        
        // Calculate the height needed to display all content
        const contentHeight = scrollHeight + inputHeight + padding;
        
        // Determine the base height from CSS (.open state)
        // Temporarily remove inline style to measure CSS default
        const originalInlineHeight = terminalElement.style.height;
        terminalElement.style.height = ''; 
        const baseOpenHeight = terminalElement.offsetHeight;
        terminalElement.style.height = originalInlineHeight; // Restore original inline height or let it be recalculated

        // Get max-height from CSS
        const maxHeightStyle = window.getComputedStyle(terminalElement).maxHeight;
        let maxHeight = window.innerHeight - (window.innerHeight * 0.1) - 20; // Adjusted for 10vh top
         if (maxHeightStyle && maxHeightStyle.endsWith('px')) {
            maxHeight = parseInt(maxHeightStyle, 10);
        } else if (maxHeightStyle && maxHeightStyle.includes('vh')) {
             try {
                let vhValue = maxHeightStyle.match(/(\d+)vh/);
                let pxValue = maxHeightStyle.match(/(\d+)px/);
                if (vhValue) {
                   maxHeight = window.innerHeight * (parseInt(vhValue[1])/100);
                   if (pxValue) {
                      maxHeight -= parseInt(pxValue[1]);
                   }
                }
             } catch(e) { /* Use fallback */ }
        }
        
        // Determine the target height: max of base and content, capped by max.
        const targetHeight = Math.min(Math.max(baseOpenHeight, contentHeight), maxHeight);

        // --- Modification START ---
        // Only increase height if the target height is greater than the current height.
        // Don't shrink automatically unless 'clear' was used (handled in processTerminalCommand).
        if (targetHeight > currentHeight) {
            terminalElement.style.height = `${targetHeight}px`;
        }
        // --- Modification END ---
        
        // Always scroll to bottom after potential adjustment
        terminalOutput.scrollTop = terminalOutput.scrollHeight;
    }

    // Function to process terminal commands
    function processTerminalCommand(command) {
        const outputPara = document.createElement('p');
        const typingSpeed = 15; // Milliseconds per character
        let minimize = false;
        let clearScreen = false; // Flag for clear command
        let outputText = ''; // Store text to be typed

        switch (command.toLowerCase()) {
            case 'help':
                outputText = 'Available commands:\n                   - help: Show this help message\n                   - ls: List projects\n                   - contact: Show contact information\n                   - clear: Clear the terminal screen\n                   - exit: Minimize the terminal';
                break;
            case 'ls':
                const projectSections = document.querySelectorAll('.main-content');
                let projectList = 'Projects:\n';
                projectSections.forEach(section => {
                    const titleElement = section.querySelector('h2');
                    const imageElement = section.querySelector('.main-image');
                    if (titleElement && imageElement && imageElement.dataset.url) {
                        projectList += `- ${titleElement.textContent.trim()} (<a href="${imageElement.dataset.url}" target="_blank" style="color: #0f0; text-decoration: underline;">link</a>)\n`;
                    } else if (titleElement) {
                        projectList += `- ${titleElement.textContent.trim()} (no link found)\n`;
                    }
                });
                outputText = projectList || 'No projects found.';
                break;
            case 'contact':
                const mailLink = document.querySelector('.nav-content a[href="#"][data-hover*="@"]');
                const discordLink = document.querySelector('.nav-content a[href="#"][data-hover*="arub"]');
                let contactInfo = 'Contact Info:\n';
                if (mailLink) contactInfo += `- Mail: ${mailLink.dataset.hover}\n`;
                if (discordLink) contactInfo += `- Discord: ${discordLink.dataset.hover}`;
                outputText = contactInfo;
                break;
            case 'clear':
                terminalOutput.innerHTML = ''; // Clear immediately
                outputPara.textContent = 'Terminal cleared.'; // Message to potentially type (optional, or just leave blank)
                terminalOutput.appendChild(outputPara); // Add the cleared message instantly
                clearScreen = true; // Set the flag
                break;
            case 'exit':
                 minimize = true;
                 break;
            default:
                outputText = `Command not found: ${command}. Type 'help' for available commands.`;
        }
        
        if (minimize) {
            // Minimize the terminal
            if (terminalElement) {
                terminalElement.classList.remove('open', 'fullscreen');
                terminalElement.style.height = '';
                terminalElement.style.width = ''; // Reset width too
                terminalElement.style.top = '';
                terminalElement.style.left = '';
                terminalElement.style.transform = '';
                // Hide dimmer and reset icon
                if (screenDimmer) screenDimmer.classList.add('hidden');
                if (fullscreenIcon) fullscreenIcon.classList.add('hidden'); // Hide fullscreen icon too
                if (terminalIcon) {
                    terminalIcon.classList.remove('close-mode');
                    terminalIcon.title = 'Open Terminal';
                }
            }
        } else if (clearScreen) {
             // Reset height smoothly back to the default open height defined in CSS
             terminalElement.style.height = ''; // Remove inline style, CSS rule #terminal.open takes over
             // Scroll to top after clearing
             terminalOutput.scrollTop = 0;
             // Optional: Re-run adjustTerminalHeight after a delay if the base message could exceed 250px
             // setTimeout(adjustTerminalHeight, 60); 
        } else {
            // Append the paragraph element and start the typewriter effect
            terminalOutput.appendChild(outputPara);
            typewriterEffect(outputPara, outputText, typingSpeed, () => {
                // Adjust height after typing finishes
                setTimeout(adjustTerminalHeight, 50); 
            });
        }
    }

    if (terminalIcon && terminalElement && screenDimmer && fullscreenIcon) { 
         terminalIcon.addEventListener('click', () => { // Reverted click listener
             if (terminalElement.classList.contains('fullscreen')) {
                 // --- Exit Fullscreen Mode --- 
                 terminalElement.classList.remove('fullscreen');
                 terminalElement.style.height = ''; // Allow CSS to control height again
                 terminalElement.style.width = ''; 
                 terminalElement.style.top = '';
                 terminalElement.style.left = '';
                 terminalElement.style.transform = '';
                 fullscreenIcon.classList.remove('hidden'); // Show fullscreen button again
                 terminalInput.focus(); // Refocus
                 setTimeout(adjustTerminalHeight, 50); // Adjust height if needed
             } else if (terminalElement.classList.contains('open')) {
                 // --- Close Small Terminal --- 
                 terminalElement.classList.remove('open');
                 screenDimmer.classList.add('hidden'); 
                 terminalIcon.classList.remove('close-mode');
                 terminalIcon.title = 'Open Terminal';
                 fullscreenIcon.classList.add('hidden'); // Hide fullscreen button
                 terminalElement.style.height = ''; // Reset inline height
             } else {
                 // --- Open Small Terminal --- 
                 terminalElement.classList.add('open');
                 screenDimmer.classList.remove('hidden');
                 terminalIcon.classList.add('close-mode');
                 terminalIcon.title = 'Close Terminal';
                 fullscreenIcon.classList.remove('hidden'); // Show fullscreen button
                 terminalInput.focus();
                 terminalElement.style.height = ''; 
                 setTimeout(adjustTerminalHeight, 50); 
             }
         });

         fullscreenIcon.addEventListener('click', () => {
             if (terminalElement.classList.contains('open') && !terminalElement.classList.contains('fullscreen')) {
                 terminalElement.classList.add('fullscreen');
                 fullscreenIcon.classList.add('hidden'); // Hide button in fullscreen
                 // Explicitly clear height/width set by adjustTerminalHeight for small mode
                 terminalElement.style.height = '';
                 terminalElement.style.width = ''; 
                 terminalInput.focus(); // Refocus
             }
         });
    }

    if (terminalInput && terminalOutput && terminalElement) {
         // ... keydown listener remains the same ...
         terminalInput.addEventListener('keydown', function(e) {
            if (e.key === 'Enter') {
                const command = terminalInput.value.trim();
                if (command) {
                    const commandPara = document.createElement('p');
                    commandPara.textContent = `> ${command}`;
                    terminalOutput.appendChild(commandPara);
                    terminalOutput.scrollTop = terminalOutput.scrollHeight;
                    processTerminalCommand(command);
                    terminalInput.value = '';
                }
                e.preventDefault();
            }
        });

        // ... click listener to refocus remains the same ...
        terminalElement.addEventListener('click', (e) => {
            // Only refocus if the terminal is open and not in fullscreen (where the click might be intended for content)
            if (e.target !== terminalInput && terminalElement.classList.contains('open') && !terminalElement.classList.contains('fullscreen')) {
                // Avoid refocusing if clicking on scrollbar area
                if (e.offsetX >= terminalOutput.clientWidth) { 
                    return; 
                }
                terminalInput.focus();
            }
        });
    }
    // --- Interactive Terminal Logic END ---

});

// Image click redirection
document.querySelectorAll('.main-image').forEach(image => {
        image.addEventListener('click', () => {
            const url = image.dataset.url; // Fetch the URL from the data attribute
            if (url) {
                window.location.href = url; // Redirect to the URL
            }
        });
    });


    function noScroll(event) {
    event.preventDefault(); // Prevents the default behavior of the button click
}

// Function to check if the device is mobile
function isMobile() {
    return window.innerWidth <= 1000 || /Mobi|Android|iPhone|iPad|iPod|BlackBerry|Windows Phone/i.test(navigator.userAgent);
}

// Check on page load
window.onload = function() {
    if (isMobile()) {
        // If it's mobile, hide content and show mobile message
        document.getElementById('mobile-message').style.display = 'flex';
        document.getElementById('content').style.display = 'none';
    } else {
        // If it's not mobile (i.e., laptop/PC), hide the mobile message
        document.getElementById('mobile-message').style.display = 'none';
        document.getElementById('content').style.display = 'block';
    }
};

// Re-check when the window is resized
window.onresize = function() {
    if (isMobile()) {
        document.getElementById('mobile-message').style.display = 'flex';
        document.getElementById('content').style.display = 'none';
    } else {
        document.getElementById('mobile-message').style.display = 'none';
        document.getElementById('content').style.display = 'block';
    }
};

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
        this.opacity = 100;
        this.maxOpacity = Math.random() * 0.5 + 0.2;
        this.fadeSpeed = Math.random() * 0.02 + 0.005;
        this.size = Math.floor(Math.random() * 5) + 1;
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

// Modal functionality
document.querySelectorAll('.see-more-btn').forEach(button => {
    button.addEventListener('click', function() {
        const modal = document.getElementById('codeModal');
        const container = this.closest('.code-snippet-container');
        const code = container.querySelector('code').textContent;
        const modalCode = modal.querySelector('.modal-code');
        
        // Set code content
        modalCode.textContent = code;
        
        // Show modal
        modal.style.display = 'block';
        
        // Highlight code
        Prism.highlightElement(modalCode);
    });
});

// Close modal when clicking the close button or outside
document.querySelector('.close-modal').addEventListener('click', () => {
    document.getElementById('codeModal').style.display = 'none';
});

window.addEventListener('click', (event) => {
    const modal = document.getElementById('codeModal');
    if (event.target === modal) {
        modal.style.display = 'none';
    }
});


