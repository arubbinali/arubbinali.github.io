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

    // Create popup element
    const popup = document.createElement('div');
    popup.className = 'nav-popup';
    document.body.appendChild(popup);
    
    // Track the current hover state
    let popupTimeout;
    let isHovering = false;

    navLinks.forEach(link => {
        link.addEventListener('mouseover', (e) => {
            isHovering = true;
            // Clear any existing timeout to prevent flickering
            clearTimeout(popupTimeout);
            
            // Set text content for popup
            popup.textContent = link.getAttribute('data-hover');
            
            // Position the popup next to the hovered link
            const rect = link.getBoundingClientRect();
            popup.style.left = `${rect.right + 15}px`;
            popup.style.top = `${rect.top + (rect.height/2)}px`;
            
            // Show the popup with a slight delay for smoother experience
            popupTimeout = setTimeout(() => {
                if (isHovering) {
                    popup.classList.add('visible');
                }
            }, 50);
            
            // Legacy support for the old hover text
            hoverText.textContent = link.getAttribute('data-hover');
            hoverText.style.opacity = '0';
        });

        link.addEventListener('mouseout', () => {
            isHovering = false;
            
            // Add a small delay before hiding to prevent flickering
            clearTimeout(popupTimeout);
            popupTimeout = setTimeout(() => {
                if (!isHovering) {
                    popup.classList.remove('visible');
                }
            }, 100);
            
            // Reset the existing hover text
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

    let initialMiniHeightPx = 0; // ADDED: Variable to store initial height in pixels

    // Helper function for fade-in effect instead of typing effect
    function fadeInEffect(element, htmlContent) {
        // Set the content immediately
        element.innerHTML = htmlContent;
        
        // Apply fade-in effect
        element.style.opacity = '0';
        element.style.transition = 'opacity 0.4s ease-in';
        
        // Force a reflow to ensure the transition works
        void element.offsetWidth;
        
        // Fade in
        element.style.opacity = '1';
        
        // Scroll to bottom
        const terminalOutput = document.getElementById('terminal-output');
        if (terminalOutput) {
            terminalOutput.scrollTop = terminalOutput.scrollHeight;
        }
        
        // Adjust terminal height after content is displayed
        adjustTerminalHeight();
    }

    // Function to process terminal commands
    function processTerminalCommand(command) {
        const outputPara = document.createElement('p');
        let minimize = false;
        let clearScreen = false; // Flag for clear command
        let outputText = ''; // Store text to be displayed
        
        // Parse command and arguments
        const commandParts = command.trim().split(/\s+/);
        const primaryCommand = commandParts[0].toLowerCase();
        const args = commandParts.slice(1);

        switch (primaryCommand) {
            case 'help':
                outputText = `<div class="terminal-widget">
<h3>📋 Available Commands</h3>
┌──────────────────────────────┐
│ <span class="cmd-help">help</span>             -Show this help message
│ <span class="cmd-help">projects</span>         -Show detailed project info
│ <span class="cmd-help">certifs</span>          -Show my certifications
│ <span class="cmd-help">sources</span>          -Show learning resources
│ <span class="cmd-help">about</span>            -Show info about me
│ <span class="cmd-help">time</span>             -Show current date and time
│ <span class="cmd-help">whoami</span>           -Show who you are
│ <span class="cmd-help">clear</span>            -Clear the terminal screen
└──────────────────────────────┘
<p>Try typing <span class="cmd-help">help [command]</span> for more info on a specific command.</p>
</div>`;
                break;

            case 'ls':
                let projectList = '';
                
                if (args.length === 0 || args[0] === 'all') {
                    projectList = `<div class="terminal-widget">
<h3>📂 Projects</h3>
<ul>`;
                    
                    const projectSections = document.querySelectorAll('.main-content');
                    projectSections.forEach(section => {
                        const titleElement = section.querySelector('h2');
                        const imageElement = section.querySelector('.main-image');
                        if (titleElement && imageElement && imageElement.dataset.url) {
                            projectList += `<li><a href="${imageElement.dataset.url}" target="_blank">${titleElement.textContent.trim()}</a></li>`;
                        } else if (titleElement) {
                            projectList += `<li>${titleElement.textContent.trim()}</li>`;
                        }
                    });
                    
                    projectList += `</ul>
<h3>📄 Pages</h3>
<ul>
    <li><a href="Projects.html" target="_blank">Projects</a></li>
    <li><a href="Docs.html" target="_blank">Docs</a></li>
    <li><a href="Certifications.html" target="_blank">Certifications</a></li>
    <li><a href="LearningSources.html" target="_blank">Learning Sources</a></li>
    <li><a href="About.html" target="_blank">About</a></li>
</ul>
</div>`;
                } else if (args[0] === 'projects') {
                    projectList = `<div class="terminal-widget">
<h3>📂 Projects</h3>
<ul>`;
                    
                    const projectSections = document.querySelectorAll('.main-content');
                    projectSections.forEach(section => {
                        const titleElement = section.querySelector('h2');
                        const imageElement = section.querySelector('.main-image');
                        if (titleElement && imageElement && imageElement.dataset.url) {
                            projectList += `<li><a href="${imageElement.dataset.url}" target="_blank">${titleElement.textContent.trim()}</a></li>`;
                        } else if (titleElement) {
                            projectList += `<li>${titleElement.textContent.trim()}</li>`;
                        }
                    });
                    
                    projectList += `</ul></div>`;
                } else if (args[0] === 'pages') {
                    projectList = `<div class="terminal-widget">
<h3>📄 Pages</h3>
<ul>
    <li><a href="Projects.html" target="_blank">Projects</a></li>
    <li><a href="Docs.html" target="_blank">Docs</a></li>
    <li><a href="Certifications.html" target="_blank">Certifications</a></li>
    <li><a href="LearningSources.html" target="_blank">Learning Sources</a></li>
    <li><a href="About.html" target="_blank">About</a></li>
</ul>
</div>`;
                } else {
                    projectList = `<div class="terminal-widget">
<h3>ℹ️ Usage</h3>
<p>Usage: ls [option]</p>
<p>Available options:</p>
<ul>
    <li>all (default): List all projects and pages</li>
    <li>projects: List only projects</li>
    <li>pages: List only pages</li>
</ul>
</div>`;
                }
                
                outputText = projectList || 'No data found.';
                break;

            case 'about':
                outputText = `<div class="terminal-widget">
<h3>👨‍💻 About Me</h3>
<p>I'm Arub, a developer with a passion for creating digital experiences that are both functional and beautiful.</p>
<p>My skills include:</p>
<ul>
    <li>Web Development (HTML, CSS, JavaScript)</li>
    <li>Python Programming</li>
    <li>SQL and Database Management</li>
    <li>GUI Development</li>
</ul>
<p>For more details, type <span class="cmd-highlight">contact</span> or visit the <a href="About.html" target="_blank">About page</a>.</p>
</div>`;
                break;

            case 'projects':
                outputText = `<div class="terminal-widget">
<h3>🚀 Projects</h3>
<ul>
    <li><strong>School Site</strong> - School website revamp using HTML, CSS, and JavaScript</li>
    <li><strong>Islamic Inheritance Calculator</strong> - Terminal-based graphical calculator in Python</li>
    <li><strong>Mathematical & Utility GUI Software</strong> - Prototype GUI with various modules in Python</li>
    <li><strong>MySQL Query Executor & Visualizer</strong> - Graphical SQL tool with table schema viewer</li>
    <li><strong>Khan Academy Js Projects</strong> - Collection of JavaScript mini-projects</li>
    <li><strong>Digital Portfolio</strong> - This website showcasing projects and skills</li>
</ul>
<p>For more details, visit the <a href="Projects.html" target="_blank">Projects page</a>.</p>
</div>`;
                break;
                
            case 'docs':
                outputText = `<div class="terminal-widget">
<h3>📚 Documentation</h3>
<p>Visit the <a href="Docs.html" target="_blank">Docs page</a> to view all documentation for my projects.</p>
<p>Documentation includes code snippets, explanations, and technical details about implementation.</p>
</div>`;
                break;
                
            case 'certifications':
            case 'certifs':
                outputText = `<div class="terminal-widget">
<h3>🏆 Certifications</h3>
<ul>
    <li><strong>PCAP™</strong> - Certified Associate Python Programmer (August 2024)</li>
    <li><strong>PCEP™</strong> - Certified Entry-Level Python Programmer (July 2023)</li>
</ul>
<p>For more details, visit the <a href="Certifications.html" target="_blank">Certifications page</a>.</p>
</div>`;
                break;
                
            case 'learning':
            case 'sources':
                outputText = `<div class="terminal-widget">
<h3>📖 Learning Sources</h3>
<p>Visit the <a href="LearningSources.html" target="_blank">Learning Sources page</a> to view resources I've used to learn programming.</p>
<p>These include online platforms, tutorials, courses, and documentation.</p>
</div>`;
                break;

            case 'contact':
                const mailLink = document.querySelector('.nav-content a[href="#"][data-hover*="@"]');
                const discordLink = document.querySelector('.nav-content a[href="#"][data-hover*="arub"]');
                
                outputText = `<div class="terminal-widget">
<h3>📬 Contact Information</h3>
<ul>`;
                
                if (mailLink) outputText += `<li>📧 Email: <a href="mailto:${mailLink.dataset.hover}">${mailLink.dataset.hover}</a></li>`;
                if (discordLink) outputText += `<li>💬 Discord: ${discordLink.dataset.hover}</li>`;
                
                outputText += `</ul>
<h3>💻 Profiles</h3>
<ul>
    <li><a href="https://github.com/arubbinali/" target="_blank">GitHub</a></li>
    <li><a href="https://www.linkedin.com/in/arubbinali/" target="_blank">LinkedIn</a></li>
    <li><a href="https://leetcode.com/u/arubbinali/" target="_blank">Leetcode</a></li>
    <li><a href="https://www.khanacademy.org/profile/mbinali06" target="_blank">Khan Academy</a></li>
</ul>
</div>`;
                break;
                
            case 'echo':
                if (args.length > 0) {
                    outputText = `<div class="terminal-widget">
<h3>🔊 Echo</h3>
<p>${args.join(' ')}</p>
</div>`;
                } else {
                    outputText = `<div class="terminal-widget">
<h3>ℹ️ Usage</h3>
<p>Usage: echo [text] - displays the provided text</p>
</div>`;
                }
                break;
                
            case 'time':
                const now = new Date();
                const options = { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                    timeZoneName: 'short'
                };
                outputText = `<div class="terminal-widget">
<h3>⏰ Current Date & Time</h3>
<p>${now.toLocaleDateString('en-US', options)}</p>
</div>`;
                break;
                
            case 'whoami':
                outputText = `<div class="terminal-widget">
<h3>👤 You Are</h3>
<p>A visitor exploring Arub's digital portfolio.</p>
<p>Your current status: Curious Explorer</p>
<p>Access level: Public Viewer</p>
</div>`;
                break;
                
            case 'visitors':
                // Use a fixed, incrementing visitor count instead of random number
                outputText = `<div class="terminal-widget">
<h3>👥 Visitor Statistics</h3>
<p>Total visitors to date: <span class="visitor-count" id="visitor-counter">Loading...</span></p>
<p>Thank you for being one of them!</p>
</div>`;

                // Set a timeout to update the visitor count after outputting
                setTimeout(() => {
                    // Get stored count or default to base number
                    let baseCount = 1254; // Start with a reasonable base count
                    const storedCount = localStorage.getItem('visitorBaseCount');
                    if (storedCount) {
                        baseCount = parseInt(storedCount, 10);
                    }
                    
                    // Add small random increment (1-3) to simulate real visitor growth
                    const increment = Math.floor(Math.random() * 3) + 1;
                    const newCount = baseCount + increment;
                    
                    // Store the new count for persistence
                    localStorage.setItem('visitorBaseCount', newCount.toString());
                    
                    // Update the display
                    const counterElement = document.getElementById('visitor-counter');
                    if (counterElement) {
                        counterElement.textContent = newCount.toLocaleString();
                    }
                }, 300);
                break;
                
            case 'clear':
                // Clear terminal output
                terminalOutput.innerHTML = '';
                
                // Add a confirmation message with fade-in effect
                const clearPara = document.createElement('p');
                fadeInEffect(clearPara, '<span style="color: #6A9955;">Terminal cleared.</span>');
                terminalOutput.appendChild(clearPara);
                
                // Set a timeout to show welcome message after clearing
                setTimeout(() => {
                    // Create welcome message with fade-in effect
                    const welcomeMsg = document.createElement('p');
                    const welcomeContent = `<div class="terminal-widget">
<h3>👋 Welcome to Arub's Portfolio Terminal</h3>
<p>Type <span class="cmd-instruction">help</span> to see available commands.</p>
</div>`;
                    fadeInEffect(welcomeMsg, welcomeContent);
                    terminalOutput.appendChild(welcomeMsg);
                }, 700); // Show welcome message after a short delay
                
                // Set flag so we don't add the command to history
                clearScreen = true;
                
                // Reset scroll position
                terminalOutput.scrollTop = 0;
                
                // Adjust height for mini mode
                if (terminalElement.classList.contains('config-mini')) {
                    terminalElement.style.height = `${initialMiniHeightPx}px`;
                }
                break;
                
            default:
                if (command.trim() === '') {
                    outputText = ''; // No output for empty command
                } else {
                    outputText = `<div class="terminal-widget">
<h3>ℹ️ Command Not Found</h3>
<p>Command not found: ${command}</p>
<p>Type <span class="cmd-help">help</span> for available commands.</p>
</div>`;
                }
        }
        
        if (minimize) {
            // Minimize the terminal
            if (terminalElement) {
                terminalElement.classList.remove('visible');
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
            // Clear the text regardless of mode
            terminalOutput.innerHTML = '';
            const clearPara = document.createElement('p');
            clearPara.innerHTML = '&nbsp;';
            terminalOutput.appendChild(clearPara);
            terminalOutput.scrollTop = 0;

            // MODIFIED: Smoothly reset height IF in mini mode by setting the style
            if (terminalElement.classList.contains('config-mini')) {
                terminalElement.style.height = `${initialMiniHeightPx}px`;
            }
        } else {
            // Append the paragraph element and display it with fade-in effect
            terminalOutput.appendChild(outputPara);
            fadeInEffect(outputPara, outputText);
        }
    }

    // Function to auto-adjust terminal height
    function adjustTerminalHeight() {
        // Only adjust height if the terminal is configured as mini and is visible
        if (!terminalElement.classList.contains('config-mini') || !terminalElement.classList.contains('visible')) return;

        const terminalHeader = document.getElementById('terminal-header');
        const scrollHeight = terminalOutput.scrollHeight; // Full content height of output
        const inputHeight = terminalElement.querySelector('#terminal-input-line').offsetHeight;
        const headerHeight = (terminalHeader && window.getComputedStyle(terminalHeader).display !== 'none') ? terminalHeader.offsetHeight : 0;
        const paddingAndBorders = 20; // Estimate for internal padding/borders

        // Calculate height needed for the content within the terminal
        const contentHeight = scrollHeight + inputHeight + headerHeight + paddingAndBorders;

        // Use the stored initial height as the minimum base height
        const baseMiniHeight = initialMiniHeightPx > 0 ? initialMiniHeightPx : 250; // Fallback if initial not set yet

        // Get max-height from CSS (or fallback)
        const maxHeightStyle = window.getComputedStyle(terminalElement).maxHeight;
        let maxHeight = window.innerHeight * 0.8; // Fallback default (80vh)
        try {
            if (maxHeightStyle && maxHeightStyle !== 'none') {
                if (maxHeightStyle.endsWith('px')) {
                    maxHeight = parseInt(maxHeightStyle, 10);
                } else if (maxHeightStyle.endsWith('vh')) {
                     maxHeight = window.innerHeight * (parseInt(maxHeightStyle) / 100);
                }
                 // Add more robust parsing if needed for calc etc.
            }
        } catch(e) { console.error("Could not parse maxHeight:", e); }

        // Determine target height: max of minimum and content, capped by max.
        let targetHeight = Math.max(baseMiniHeight, contentHeight);
        targetHeight = Math.min(targetHeight, maxHeight);

        // Directly set the target height. The CSS transition will handle the animation.
        terminalElement.style.height = `${targetHeight}px`;

        // Ensure scroll to bottom after potential height change
        // Use a small timeout to allow the height transition to start
        setTimeout(() => {
             terminalOutput.scrollTop = terminalOutput.scrollHeight;
        }, 50);
    }

    if (terminalIcon && terminalElement && screenDimmer && fullscreenIcon) {
        // Toggle Terminal Icon (Open Mini / Close Mini / Close Fullscreen)
        terminalIcon.addEventListener('click', () => {
            if (terminalElement.classList.contains('visible')) {
                // --- Close Currently Visible Terminal (Mini or Fullscreen) ---
                const wasFullscreen = terminalElement.classList.contains('config-fullscreen');
                terminalElement.classList.remove('visible');
                screenDimmer.classList.remove('visible'); // Hide dimmer
                terminalIcon.classList.remove('close-mode');
                terminalIcon.title = 'Open Terminal';
                fullscreenIcon.classList.add('hidden'); // Hide fullscreen button when closing

                // MODIFIED: Delay removing config class until after opacity transition
                const transitionDuration = 400; // Match CSS transition duration in ms
                setTimeout(() => {
                   // Now remove the class after fade out
                   if (wasFullscreen) {
                       terminalElement.classList.remove('config-fullscreen');
                   } else {
                       terminalElement.classList.remove('config-mini');
                   }
                   // Reset potential inline height from adjustTerminalHeight (important for mini)
                   terminalElement.style.height = ''; 
                }, transitionDuration);

            } else {
                // --- Open Mini (Set config then Fade In) ---
                terminalElement.classList.remove('config-fullscreen'); // Ensure fullscreen is off
                terminalElement.classList.add('config-mini');
                // Calculate and store initial height in pixels
                initialMiniHeightPx = window.innerHeight * 0.3; 
                terminalElement.style.height = `${initialMiniHeightPx}px`; // MODIFIED: Set initial height in pixels
                terminalIcon.classList.add('close-mode');
                terminalIcon.title = 'Close Terminal';
                // MODIFIED: Show fullscreen button ONLY when opening mini terminal
                fullscreenIcon.classList.remove('hidden');
                fullscreenIcon.classList.remove('active-fullscreen'); // Ensure it's not red
                screenDimmer.classList.add('visible'); // Show dimmer

                // Allow config to apply, then fade in
                requestAnimationFrame(() => { 
                    terminalElement.classList.add('visible');
                    terminalInput.focus();
                    // Initial adjust might still be needed if 30vh isn't enough for default text
                    setTimeout(adjustTerminalHeight, 50); 
                });
            }
        });

        // Toggle Fullscreen Icon (Switch between Mini and Fullscreen)
        fullscreenIcon.addEventListener('click', () => {
            // Only act if a terminal is currently configured and visible
            if (!terminalElement.classList.contains('visible')) return;

            // MODIFIED: Separate logic for expand vs shrink
            if (terminalElement.classList.contains('config-mini')) {
                // --- Expand: Mini to Fullscreen (Uses CSS Transition) ---
                terminalElement.style.height = ''; // Clear dynamic height
                terminalElement.classList.remove('config-mini');
                terminalElement.classList.add('config-fullscreen');
                fullscreenIcon.classList.add('active-fullscreen'); 
                
            } else if (terminalElement.classList.contains('config-fullscreen')) {
                // --- Shrink: Fullscreen to Mini (Smooth Transition) ---
                
                // Apply a smooth transition for all properties
                terminalElement.style.transition = 'all 0.5s cubic-bezier(0.19, 1, 0.22, 1)';
                
                // Remove fullscreen class and add mini class immediately
                terminalElement.classList.remove('config-fullscreen');
                terminalElement.classList.add('config-mini');
                
                // Update fullscreen icon state
                fullscreenIcon.classList.remove('active-fullscreen');
                
                // Set the height based on stored mini height or default
                const targetHeight = initialMiniHeightPx > 0 ? initialMiniHeightPx : 200;
                terminalElement.style.height = `${targetHeight}px`;
                
                // Adjust terminal height after transition completes
                setTimeout(() => {
                    adjustTerminalHeight();
                }, 500);
            }
            
            // Refocus input after transition/animation could have started
            setTimeout(() => terminalInput.focus(), 50);
        });
    }

    if (terminalInput && terminalOutput && terminalElement) {
         // ... keydown listener remains the same ...
         terminalInput.addEventListener('keydown', function(e) {
            if (e.key === 'Enter') {
                const command = terminalInput.value.trim();
                if (command) {
                    const commandPara = document.createElement('p');
                    commandPara.innerHTML = `<span class="user-command">> ${command}</span>`;
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
            // Only refocus if the terminal is visible
            if (e.target !== terminalInput && terminalElement.classList.contains('visible')) {
                // Avoid refocusing if clicking on scrollbar area
                if (e.offsetX >= terminalOutput.clientWidth) {
                    return;
                }
                terminalInput.focus();
            }
        });
    }
    // --- Interactive Terminal Logic END ---

    // Function to handle clicking outside the terminal
    function handleClickOutside(event) {
        // Don't process if terminal isn't visible
        if (!terminalElement || !terminalElement.classList.contains('visible')) {
            return;
        }
        
        // Check if click was outside terminal AND not on fullscreen button
        if (terminalElement && !terminalElement.contains(event.target) && 
            fullscreenIcon && !fullscreenIcon.contains(event.target) && 
            terminalIcon && !terminalIcon.contains(event.target)) {
            
            // If in fullscreen mode, exit to mini terminal
            if (terminalElement.classList.contains('config-fullscreen')) {
                fullscreenIcon.click();
            } else {
                // If in mini mode, close the terminal completely
                terminalIcon.click();
            }
        }
    }

    // Add click outside event listener to document
    document.addEventListener('click', handleClickOutside);
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

// Add custom CSS styles for the terminal output
const terminalStyle = document.createElement('style');
terminalStyle.textContent = `
    /* Command highlighting for standard commands */
    .cmd-highlight {
        color: #569cd6;
        font-weight: bold;
    }
    
    /* Special aqua highlighting for help command */
    .cmd-help {
        color: #00ffff; /* Aqua color */
        font-weight: bold;
    }
    
    /* Instruction command highlighting */
    .cmd-instruction {
        color: #00ff00; /* Sharp green color */
        font-weight: bold;
    }
    
    /* User command styling */
    .user-command {
        color: #8BC34A; /* Light green color */
        font-weight: bold;
    }
    
    /* Error text styling */
    .error-text {
        color: #f14c4c;
    }
    
    /* Success text styling */
    .success-text {
        color: #6A9955;
    }
    
    /* Terminal widget styling */
    .terminal-widget {
        background: linear-gradient(135deg, rgba(40, 44, 52, 0.7), rgba(30, 34, 42, 0.8));
        border-radius: 8px;
        padding: 15px;
        margin-bottom: 12px;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.15);
        border-left: 3px solid #61afef;
    }
    
    /* Widget headers */
    .terminal-widget h3 {
        color: #e6c07b;
        margin-top: 0;
        margin-bottom: 12px;
        font-size: 1.1rem;
        font-weight: 500;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        padding-bottom: 6px;
    }
    
    /* Lists in terminal widgets */
    .terminal-widget ul {
        padding-left: 20px;
        margin: 8px 0;
    }
    
    .terminal-widget li {
        margin-bottom: 4px;
        position: relative;
    }
    
    .terminal-widget li::before {
        content: '•';
        color: #61afef;
        position: absolute;
        left: -15px;
    }
    
    /* Links in terminal */
    #terminal-output a {
        color: #61afef;
        text-decoration: none;
        border-bottom: 1px dotted rgba(97, 175, 239, 0.5);
        transition: color 0.2s, border-color 0.2s;
    }
    
    #terminal-output a:hover {
        color: #98c9f5;
        border-bottom-color: rgba(152, 201, 245, 0.8);
    }
    
    /* Visitor count styling */
    .visitor-count {
        color: #98c379;
        font-weight: bold;
    }
    
    /* Command line styling */
    .command-line {
        margin: 6px 0;
        color: #cccccc;
    }
    
    .prompt {
        color: #6A9955;
        margin-right: 5px;
    }
    
    .entered-command {
        color: #8BC34A; /* Light green color */
    }
`;
document.head.appendChild(terminalStyle);
