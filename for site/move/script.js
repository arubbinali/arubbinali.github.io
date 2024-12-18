window.onload = function () {
    showPopup();
};

function showPopup() {
    const popup = document.getElementById("popup");
    popup.style.display = "flex"; // Show the popup
    setTimeout(() => {
        popup.style.opacity = "1"; // Fade in
    }, 100); // Slight delay for better animation
}

function closePopup() {
    const popup = document.getElementById('popup');
    popup.style.opacity = "0"; // Start fade-out

    // Wait for the fade-out duration to remove the popup from the DOM
    popup.addEventListener('transitionend', function (e) {
        if (popup.style.opacity === "0") {
            popup.style.display = 'none'; // Hide the popup after the fade-out
        }
    }, { once: true }); // Use { once: true } to ensure the listener is removed after execution
}

// Toggle dark mode functionality
function toggleDarkMode() {
    document.body.classList.toggle('dark-mode'); // Toggle class to enable/disable dark mode
}

// Select all dropdown menu items
const dropdownItems = document.querySelectorAll('.navbar ul li');
const overlay = document.getElementById('screen-overlay');

// Function to show the overlay with fade-in effect
function showOverlay() {
    overlay.style.display = 'block';  // Make the overlay visible
    setTimeout(() => { 
        overlay.style.opacity = '1';  // Gradually increase opacity (fade-in)
        overlay.style.pointerEvents = 'auto';  // Allow interaction with the overlay when visible
    }, 10);  // Small delay to ensure smooth transition
}

// Function to hide the overlay with fade-out effect
function hideOverlay() {
    overlay.style.opacity = '0';  // Start fade-out by reducing opacity
    overlay.style.pointerEvents = 'none';  // Prevent interaction while fading out

    // Once the transition (fade-out) is done, hide the overlay from view
    overlay.addEventListener('transitionend', function () {
        if (overlay.style.opacity === '0') {
            overlay.style.display = 'none';  // Fully hide the overlay after fade-out
        }
    }, { once: true });  // Ensure this runs once after each fade-out
}

// Add event listeners to each dropdown menu item
dropdownItems.forEach(function (menuItem) {
    // On mouse enter (hover), show the overlay
    menuItem.addEventListener('mouseenter', function () {
        showOverlay();
    });

    // On mouse leave (exit), hide the overlay
    menuItem.addEventListener('mouseleave', function () {
        hideOverlay();
    });
});

document.addEventListener("DOMContentLoaded", () => {
    const columns = document.querySelectorAll(".footer-column");

    columns.forEach(column => {
        column.addEventListener("mouseenter", () => {
            column.style.transition = "transform 0.8s cubic-bezier(0.25, 1.25, 0.5, 1)";
            column.style.transform = "scale(1.05)";
        });
        
        column.addEventListener("mouseleave", () => {
            column.style.transition = "transform 0.8s cubic-bezier(0.25, 1.25, 0.5, 1)";
            column.style.transform = "scale(1)";
        });
    });
});

document.addEventListener("DOMContentLoaded", () => {
    const toggleSwitch = document.getElementById("darkModeToggle");

    // Check local storage or set default light mode
    if (localStorage.getItem("darkMode") === "enabled") {
        document.body.classList.add("dark-mode");
        toggleSwitch.checked = true;
    }

    // Event listener for toggle switch
    toggleSwitch.addEventListener("change", () => {
        document.body.classList.toggle("dark-mode");
        if (document.body.classList.contains("dark-mode")) {
        localStorage.setItem("darkMode", "enabled");
        } else {
        localStorage.setItem("darkMode", "disabled");
        }
    });
});

document.addEventListener("DOMContentLoaded", () => {
    const toggleSwitch = document.getElementById("darkModeToggle");
    const modeLabel = document.getElementById("modeLabel");

    // Function to update label with fade effect
    function updateLabel(text) {
        modeLabel.style.opacity = "0"; // Start fade-out
        setTimeout(() => {
            modeLabel.innerHTML = text;
            modeLabel.style.opacity = "1"; // Start fade-in
        }, 200); // Halfway point for smooth transition with the slider
    }

    // Check local storage or set default light mode
    const isDarkMode = localStorage.getItem("darkMode") === "enabled";
    if (isDarkMode) {
        document.body.classList.add("dark-mode");
        toggleSwitch.checked = true;
        updateLabel("&nbsp;DARK&#8202;\u2003🌙");
    } else {
        updateLabel("&#8202;☀️  &nbsp;&nbsp;&nbsp;LIGHT"); // Adjusted spacing for "LIGHT" text
    }

    // Initialize the correct logo based on the mode
    updateLogo(isDarkMode);

    // Event listener for toggle switch
    toggleSwitch.addEventListener("change", () => {
        document.body.classList.toggle("dark-mode");
        const isDarkMode = document.body.classList.contains("dark-mode");

        // Save mode to local storage
        localStorage.setItem("darkMode", isDarkMode ? "enabled" : "disabled");

        // Update the label and logo
        updateLabel(isDarkMode ? "&nbsp;DARK&#8202;\u2003🌙" : "&#8202;☀️  &nbsp;&nbsp;&nbsp;LIGHT");
        updateLogo(isDarkMode);
    }); 
});


// Function to switch logos based on mode with fade effect
function updateLogo(isDarkMode) {
    const navbarLogo = document.getElementById('navbar-logo');
    const footerLogo = document.getElementById('footer-logo');
    const logoSrc = isDarkMode ? 'download.png' : 'logo.png';

    // Fade out both logos
    navbarLogo.style.transition = "opacity 0.5s"; // CSS transition for smooth fade
    footerLogo.style.transition = "opacity 0.5s";
    navbarLogo.style.opacity = 0;
    footerLogo.style.opacity = 0;

    // After fade-out completes, change the logo and fade back in
    setTimeout(() => {
        navbarLogo.src = logoSrc;
        footerLogo.src = logoSrc;

        // Fade in both logos
        navbarLogo.style.opacity = 1;
        footerLogo.style.opacity = 1;
    }, 500); // Delay for fade-out transition
}

function toggleDetails(element) {
        const details = element.nextElementSibling;
        if (details.classList.contains("open")) {
            details.classList.remove("open");
            element.querySelector('.event-toggle').textContent = "+"; // Change back to plus symbol
        } else {
            details.classList.add("open");
            element.querySelector('.event-toggle').textContent = "−"; // Change to minus symbol
        }
    }



// JavaScript to handle modal opening and closing
document.querySelectorAll('.sidebar-image').forEach(image => {
    image.addEventListener('click', function() {
        // Get the modal elements
        const modal = document.querySelector('.modal');
        const modalOverlay = document.querySelector('.modal-overlay');
        const modalImage = modal.querySelector('img');
        const modalHeader = modal.querySelector('.modal-header');

        // Set the image and title in the modal
        modalImage.src = this.src;
        modalHeader.textContent = this.alt; // Use the alt text as title

        // Show the modal and overlay with smooth transitions
        modal.classList.add('visible');
        modalOverlay.classList.add('visible');
    });
});

// Close modal when clicking on overlay
document.querySelector('.modal-overlay').addEventListener('click', function() {
    const modal = document.querySelector('.modal');
    const modalOverlay = document.querySelector('.modal-overlay');

    // Hide modal and overlay with smooth transitions
    modal.classList.remove('visible');
    modalOverlay.classList.remove('visible');
});


document.addEventListener("DOMContentLoaded", () => {
    const counters = document.querySelectorAll(".number");
    const speed = 200; // Adjust this for faster/slower animation

    const animateCounters = () => {
        counters.forEach(counter => {
            const target = +counter.getAttribute("data-target");
            const updateCount = () => {
                const current = +counter.innerText;
                const increment = target / speed;

                if (current < target) {
                    counter.innerText = Math.ceil(current + increment);
                    setTimeout(updateCount, 10);
                } else {
                    counter.innerText = target;
                }
            };
            updateCount();
        });
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateCounters();
                observer.unobserve(entry.target); // Stop observing once animated
            }
        });
    }, { threshold: 0.5 });

    observer.observe(document.querySelector(".count"));
});


let currentIndex = 0; // The index of the first image of the 3 visible slides
const slides = document.querySelectorAll(".gallery-slide");
const slider = document.getElementById("gallery-slider");
const totalSlides = slides.length;
let slideInterval;  // Variable to hold the interval ID

// Function to start the 5-second auto-slide interval
function startAutoSlide() {
    slideInterval = setInterval(nextSlide, 5000);
}

// Clear the current interval before starting a new one
function resetAutoSlide() {
    clearInterval(slideInterval);  // Clear any existing interval
    startAutoSlide();  // Restart the interval
}

// Function to move to the next set of slides
function nextSlide() {
    if (currentIndex >= totalSlides - 3) {
        // If we're at the last group, reset to the first group
        currentIndex = 0;
    } else {
        currentIndex++;
    }
    updateSliderPosition();
    checkArrowVisibility();
}

// Function to move to the previous set of slides
function prevSlide() {
    if (currentIndex <= 0) {
        // If we're at the first group, reset to the last group
        currentIndex = totalSlides - 3;
    } else {
        currentIndex--;
    }
    updateSliderPosition();
    checkArrowVisibility();
}

// Update the slider position based on the current index
function updateSliderPosition() {
    slider.style.transform = `translateX(-${currentIndex * (100 / 3)}%)`; // Slide by 1/3 of the container's width
}

// Disable buttons when reaching the ends
function checkArrowVisibility() {
    const prevButton = document.querySelector('.prev-btn');
    const nextButton = document.querySelector('.next-btn');
    
    if (currentIndex === 0) {
        prevButton.disabled = true;  // Disable previous button
        prevButton.style.opacity = 0.5; // Make it grey
    } else {
        prevButton.disabled = false; // Enable previous button
        prevButton.style.opacity = 1; // Make it normal
    }

    if (currentIndex === totalSlides - 3) {
        nextButton.disabled = true;  // Disable next button
        nextButton.style.opacity = 0.5; // Make it grey
    } else {
        nextButton.disabled = false; // Enable next button
        nextButton.style.opacity = 1; // Make it normal
    }
}

// Auto-swiping every 5 seconds, initially started
startAutoSlide();

// Restart the 5-second interval when a user clicks on prev or next buttons
document.querySelector('.prev-btn').addEventListener('click', () => {
    prevSlide();
    resetAutoSlide();  // Reset the auto-slide interval after a user action
});

document.querySelector('.next-btn').addEventListener('click', () => {
    nextSlide();
    resetAutoSlide();  // Reset the auto-slide interval after a user action
});


let cambridgeCurrentIndex = 0; // The index of the first image of the 3 visible slides
const cambridgeSlides = document.querySelectorAll(".cambridge-awards-slide");
const cambridgeSlider = document.getElementById("cambridge-awards-slider");
const cambridgeTotalSlides = cambridgeSlides.length;
let cambridgeSlideInterval;  // Variable to hold the interval ID

// Function to start the 5-second auto-slide interval
function startCambridgeAutoSlide() {
    cambridgeSlideInterval = setInterval(nextCambridgeSlide, 5000);
}

// Clear the current interval before starting a new one
function resetCambridgeAutoSlide() {
    clearInterval(cambridgeSlideInterval);  // Clear any existing interval
    startCambridgeAutoSlide();  // Restart the interval
}

// Function to move to the next set of slides
function nextCambridgeSlide() {
    if (cambridgeCurrentIndex >= cambridgeTotalSlides - 3) {
        // If we're at the last group, reset to the first group
        cambridgeCurrentIndex = 0;
    } else {
        cambridgeCurrentIndex++;
    }
    updateCambridgeSliderPosition();
}

// Function to move to the previous set of slides
function prevCambridgeSlide() {
    if (cambridgeCurrentIndex <= 0) {
        // If we're at the first group, reset to the last group
        cambridgeCurrentIndex = cambridgeTotalSlides - 3;
    } else {
        cambridgeCurrentIndex--;
    }
    updateCambridgeSliderPosition();
}

// Update the slider position based on the current index
function updateCambridgeSliderPosition() {
    cambridgeSlider.style.transform = `translateX(-${cambridgeCurrentIndex * (100 / 3)}%)`; // Slide by 1/3 of the container's width
}

// Auto-swiping every 5 seconds, initially started
startCambridgeAutoSlide();

// Restart the 5-second interval when a user clicks on prev or next buttons
document.querySelector('.prev-btn').addEventListener('click', () => {
    prevCambridgeSlide();
    resetCambridgeAutoSlide();  // Reset the auto-slide interval after a user action
});

document.querySelector('.next-btn').addEventListener('click', () => {
    nextCambridgeSlide();
    resetCambridgeAutoSlide();  // Reset the auto-slide interval after a user action
});


// Load the YouTube IFrame API
function onYouTubeIframeAPIReady() {
    new YT.Player('youtube-player', {
        videoId: 'G9MisnIFkTo', // Video ID for the desired video
        playerVars: {
            autoplay: 1,
            mute: 1,
            loop: 1,
            playlist: 'omzJXmRa0TM', // Ensures looping by adding the same video to the playlist
            controls: 0, // Hides player controls
            showinfo: 0, // Disables video info
            rel: 0, // Prevents showing related videos at the end
            modestbranding: 1, // Minimizes YouTube branding
        },
        events: {
            'onReady': function(event) {
                event.target.setPlaybackQuality('1080'); // Suggest 1440p quality
                event.target.playVideo();
            }
        }
    });
}

// Include the IFrame API script dynamically
var tag = document.createElement('script');
tag.src = "https://www.youtube.com/iframe_api";
var firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

function noScroll(event) {
    event.preventDefault(); // Prevents the default behavior of the button click
}

document.addEventListener("DOMContentLoaded", function() {
    const schoolFeatures = document.querySelector('.school-features');

    function handleScroll() {
        const rect = schoolFeatures.getBoundingClientRect();
        const windowHeight = window.innerHeight;

        if (rect.top <= windowHeight - 50) { // Trigger when 50px in view
            schoolFeatures.classList.add('show');
            window.removeEventListener('scroll', handleScroll); // Trigger only once
        }
    }

    window.addEventListener('scroll', handleScroll);
});


document.addEventListener("DOMContentLoaded", function() {
    const gallery = document.querySelector(".gallery");

    function checkGalleryVisibility() {
        const rect = gallery.getBoundingClientRect();
        const windowHeight = window.innerHeight || document.documentElement.clientHeight;

        if (rect.top <= windowHeight) {
            gallery.classList.add("show");
            window.removeEventListener("scroll", checkGalleryVisibility);
        }
    }

    window.addEventListener("scroll", checkGalleryVisibility);
    checkGalleryVisibility(); // Initial check in case the gallery is already in view
});