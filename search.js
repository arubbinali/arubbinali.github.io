// Page content for searching
const pageContent = {
    'index.html': {
        title: 'Home',
        content: document.querySelector('main')?.textContent || ''
    },
    'Projects.html': {
        title: 'Projects',
        content: 'Showcase of My Projects'
    },
    'Docs.html': {
        title: 'Docs',
        content: 'Licensed Code and Notes for My Projects & Certifications'
    },
    'New.html': {
        title: 'New',
        content: 'Soon, chill for now big dog'
    },
    'About.html': {
        title: 'About',
        content: 'Learn more about me'
    }
};

// Search functionality
document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('searchInput');
    const searchButton = document.getElementById('searchButton');
    const searchResults = document.getElementById('searchResults');
    let searchTimeout;

    function performSearch(query) {
        // Clear previous results
        searchResults.innerHTML = '';
        
        if (!query.trim()) {
            searchResults.classList.remove('active');
            return;
        }

        // Add clicked effect to search button
        searchButton.classList.add('clicked');
        setTimeout(() => {
            searchButton.classList.remove('clicked');
        }, 300);

        const results = [];
        const searchTerm = query.toLowerCase();

        for (const [page, content] of Object.entries(pageContent)) {
            if (content.title.toLowerCase().includes(searchTerm) || 
                content.content.toLowerCase().includes(searchTerm)) {
                
                // Find the context where the search term appears
                const contextIndex = content.content.toLowerCase().indexOf(searchTerm);
                let context = '';
                
                if (contextIndex !== -1) {
                    const start = Math.max(0, contextIndex - 30);
                    const end = Math.min(content.content.length, contextIndex + 30);
                    context = content.content.slice(start, end);
                    if (start > 0) context = '...' + context;
                    if (end < content.content.length) context += '...';
                }

                results.push({
                    page,
                    title: content.title,
                    context
                });
            }
        }
        
        if (results.length > 0) {
            results.forEach(result => {
                const resultElement = document.createElement('div');
                resultElement.className = 'search-result-item';
                resultElement.innerHTML = `
                    <div class="result-title">${result.title}</div>
                    ${result.context ? `<div class="result-context">${result.context}</div>` : ''}
                `;
                resultElement.addEventListener('click', () => {
                    window.location.href = result.page;
                });
                searchResults.appendChild(resultElement);
            });
        } else {
            searchResults.innerHTML = '<div class="no-results">No results found</div>';
        }

        // Show results
        requestAnimationFrame(() => {
            searchResults.classList.add('active');
        });
    }

    // Event listeners
    searchInput.addEventListener('input', (e) => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            if (e.target.value.trim()) {
                performSearch(e.target.value);
            } else {
                searchResults.classList.remove('active');
            }
        }, 300);
    });

    searchButton.addEventListener('click', () => {
        if (searchInput.value.trim()) {
            performSearch(searchInput.value);
        }
    });

    // Close results when clicking outside
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.search-container')) {
            searchResults.classList.remove('active');
        }
    });

    // Enter key support
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && searchInput.value.trim()) {
            performSearch(searchInput.value);
        }
    });
});
