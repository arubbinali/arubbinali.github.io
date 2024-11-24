const chatContainer = document.getElementById('chatContainer');
const chatMessages = document.getElementById('chatMessages');
const userInput = document.getElementById('userInput');
const searchInput = document.getElementById('searchInput');
const searchResults = document.getElementById('searchResults');
let isChatOpen = false;

// Website sections for search
const websiteSections = [
    {
        title: "Home",
        description: "Main page of PISJ-ES",
        url: "https://pisjes.edu.sa"
    },
    {
        title: "Admission",
        description: "Information about admission process and requirements",
        url: "https://pisjes.edu.sa/admission"
    },
    {
        title: "Fee Structure",
        description: "Information about school fees and payment",
        url: "https://pisjes.edu.sa/fee-structure"
    },
    {
        title: "Contact",
        description: "Get in touch with PISJ-ES",
        url: "https://pisjes.edu.sa/contact"
    },
    {
        title: "Facilities",
        description: "School facilities and infrastructure",
        url: "https://pisjes.edu.sa/facilities"
    },
    {
        title: "Downloads",
        description: "Important forms and documents",
        url: "https://pisjes.edu.sa/downloads"
    },
    {
        title: "Gallery",
        description: "Photos and videos of school events and activities",
        url: "https://pisjes.edu.sa/gallery"
    }
];

// Toggle chat window
function toggleChat() {
    isChatOpen = !isChatOpen;
    chatContainer.classList.toggle('show');
    if (isChatOpen) {
        userInput.focus();
    }
}

// Handle Enter key press
function handleKeyPress(event) {
    if (event.key === 'Enter') {
        sendMessage();
    }
}

// Add a message to the chat
function addMessage(message, isUser) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${isUser ? 'user-message' : 'bot-message'}`;
    if (isUser) {
        messageDiv.textContent = message;
    }
    chatMessages.appendChild(messageDiv);
    
    // Smooth scroll to the new message
    setTimeout(() => {
        messageDiv.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }, 100);
    
    if (!isUser) {
        streamResponse(messageDiv, message);
    }
}

// Stream the response with a typing effect
function streamResponse(element, message) {
    let index = 0;
    element.textContent = '▋'; // Initial cursor
    
    function typeNextCharacter() {
        if (index < message.length) {
            element.textContent = message.substring(0, index + 1) + '▋';
            index++;
            const delay = Math.random() * 50 + 20; // Random delay between 20-70ms
            setTimeout(typeNextCharacter, delay);
            // Scroll while typing
            element.scrollIntoView({ behavior: 'smooth', block: 'end' });
        } else {
            element.textContent = message; // Remove cursor at the end
            // Final scroll
            element.scrollIntoView({ behavior: 'smooth', block: 'end' });
        }
    }
    
    setTimeout(typeNextCharacter, 200); // Initial delay before starting to type
}

// Simple bot responses
function getBotResponse(message) {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
        return "Welcome to Pakistan International School Jeddah - English Section! How can I assist you today?";
    } else if (lowerMessage.includes('bye')) {
        return "Thank you for chatting with PISJ-ES Assistant. Have a great day!";
    } else if (lowerMessage.includes('help')) {
        return "I can help you with information about PISJ-ES, including admission procedures, school timings, contact details, and general inquiries.";
    } else if (lowerMessage.includes('contact')) {
        return "You can contact PISJ-ES at:\nPhone: +966-12-6750247, +966-12-6750248\nEmail: info@pisjes.edu.sa\nLocation: Al-Rehab District, Jeddah, Saudi Arabia";
    } else if (lowerMessage.includes('schedule') || lowerMessage.includes('timing')) {
        return "School hours are:\nSunday to Thursday\nKG: 7:30 AM - 1:00 PM\nGrade 1-12: 7:30 AM - 2:00 PM";
    } else if (lowerMessage.includes('website')) {
        return "You can visit our school website at: https://pisjes.edu.sa/";
    } else if (lowerMessage.includes('admission') || lowerMessage.includes('enroll')) {
        return "For admission inquiries, please visit our admission page at https://pisjes.edu.sa/admission or contact our admission office at +966-12-6750247.";
    } else if (lowerMessage.includes('fee') || lowerMessage.includes('payment')) {
        return "You can find our fee structure and payment details at https://pisjes.edu.sa/fee-structure";
    } else if (lowerMessage.includes('download') || lowerMessage.includes('form')) {
        return "You can download important forms and documents from https://pisjes.edu.sa/downloads";
    } else if (lowerMessage.includes('location') || lowerMessage.includes('address')) {
        return "PISJ-ES is located in Al-Rehab District, Jeddah, Saudi Arabia. You can find detailed directions on our website.";
    } else if (lowerMessage.includes('facilities')) {
        return "To learn about our school facilities, visit https://pisjes.edu.sa/facilities";
    } else if (lowerMessage.includes('gallery') || lowerMessage.includes('photos') || lowerMessage.includes('pictures')) {
        return "View our school's photos and videos in the gallery at https://pisjes.edu.sa/gallery";
    } else {
        return "I'm not sure about that specific query. Please try asking about our contact information, school timings, admission process, or visit our website at https://pisjes.edu.sa/ for more details.";
    }
}

// Send message
function sendMessage() {
    const message = userInput.value.trim();
    if (message === '') return;

    // Add user message
    addMessage(message, true);
    userInput.value = '';

    // Add bot response after a short delay
    setTimeout(() => {
        const response = getBotResponse(message);
        addMessage(response, false);
    }, 500);
}

let selectedResultIndex = -1;

// Handle search input
searchInput.addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase();
    selectedResultIndex = -1; // Reset selection when input changes
    
    if (query.length < 2) {
        searchResults.innerHTML = '';
        searchResults.classList.remove('show');
        return;
    }

    const filteredResults = websiteSections.filter(section =>
        section.title.toLowerCase().includes(query) ||
        section.description.toLowerCase().includes(query)
    );

    if (filteredResults.length > 0) {
        displaySearchResults(filteredResults);
    } else {
        searchResults.innerHTML = '<div class="search-result-item"><p>No results found</p></div>';
        searchResults.classList.add('show');
    }
});

// Handle keyboard navigation
searchInput.addEventListener('keydown', (e) => {
    const results = searchResults.querySelectorAll('.search-result-item');
    const maxIndex = results.length - 1;

    switch(e.key) {
        case 'ArrowDown':
            e.preventDefault();
            if (searchResults.classList.contains('show')) {
                selectedResultIndex = Math.min(selectedResultIndex + 1, maxIndex);
                updateSelectedResult(results);
            }
            break;

        case 'ArrowUp':
            e.preventDefault();
            if (searchResults.classList.contains('show')) {
                selectedResultIndex = Math.max(selectedResultIndex - 1, 0);
                updateSelectedResult(results);
            }
            break;

        case 'Enter':
            e.preventDefault();
            if (selectedResultIndex >= 0 && results[selectedResultIndex]) {
                const url = results[selectedResultIndex].getAttribute('data-url');
                if (url) {
                    window.open(url, '_blank');
                    searchResults.classList.remove('show');
                    searchInput.value = '';
                    selectedResultIndex = -1;
                } else {
                    handleSearch(); // Fallback to regular search if no result is selected
                }
            } else {
                handleSearch();
            }
            break;

        case 'Escape':
            searchResults.classList.remove('show');
            selectedResultIndex = -1;
            break;
    }
});

// Update the selected result visual feedback
function updateSelectedResult(results) {
    results.forEach((result, index) => {
        if (index === selectedResultIndex) {
            result.classList.add('selected');
            result.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
        } else {
            result.classList.remove('selected');
        }
    });
}

// Display search results
function displaySearchResults(results) {
    searchResults.innerHTML = results.map((result, index) => `
        <div class="search-result-item" data-url="${result.url}" onclick="window.open('${result.url}', '_blank')">
            <h4>${result.title}</h4>
            <p>${result.description}</p>
        </div>
    `).join('');
    searchResults.classList.add('show');
}

// Handle search button click
function handleSearch() {
    const query = searchInput.value.trim();
    if (query) {
        window.open(`https://pisjes.edu.sa?s=${encodeURIComponent(query)}`, '_blank');
    }
}

// Close search results when clicking outside
document.addEventListener('click', (e) => {
    if (!e.target.closest('.search-container')) {
        searchResults.classList.remove('show');
    }
});
