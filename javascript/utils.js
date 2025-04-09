/**
 * Utility functions for the FilmFinder application
 */

// DOM Elements
const elements = {
    searchInput: document.getElementById('search-input'),
    searchButton: document.getElementById('search-button'),
    genreFilter: document.getElementById('genre-filter'),
    yearFilter: document.getElementById('year-filter'),
    sortBy: document.getElementById('sort-by'),
    moviesGrid: document.getElementById('movies-grid'),
    watchlistGrid: document.getElementById('watchlist-grid'),
    pagination: document.getElementById('pagination'),
    tabButtons: document.querySelectorAll('.tab-btn'),
    tabContents: document.querySelectorAll('.tab-content'),
    modal: document.getElementById('movie-modal'),
    modalClose: document.querySelector('.close-modal'),
    modalBody: document.querySelector('.modal-body')
};

/**
 * Creates a movie card element
 * @param {Object} movie - The movie data
 * @param {boolean} isInWatchlist - Whether the movie is in the watchlist
 * @returns {HTMLElement} - The movie card element
 */
function createMovieCard(movie, isInWatchlist = false) {
    const card = document.createElement('div');
    card.classList.add('movie-card');
    card.dataset.id = movie.id;
    
    const posterPath = movie.poster_path 
        ? api.IMG_URL + movie.poster_path 
        : 'img/no-poster.jpg';
    
    const releaseYear = movie.release_date 
        ? new Date(movie.release_date).getFullYear() 
        : 'Onbekend jaar';
    
    const rating = movie.vote_average 
        ? movie.vote_average.toFixed(1) 
        : 'NR';
    
    card.innerHTML = `
        <img src="${posterPath}" alt="${movie.title}" class="movie-poster">
        <button class="bookmark-btn ${isInWatchlist ? 'active' : ''}">
            <i class="fas ${isInWatchlist ? 'fa-bookmark' : 'fa-bookmark-o'}"></i>
        </button>
        <div class="movie-rating">${rating}</div>
        <div class="movie-info">
            <h3 class="movie-title">${movie.title}</h3>
            <p class="movie-year">${releaseYear}</p>
        </div>
    `;
    
    // Add event listeners
    card.addEventListener('click', (e) => {
        // Prevent opening modal when clicking bookmark button
        if (!e.target.closest('.bookmark-btn')) {
            openMovieDetails(movie.id);
        }
    });
    
    const bookmarkBtn = card.querySelector('.bookmark-btn');
    bookmarkBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleWatchlist(movie);
        bookmarkBtn.classList.toggle('active');
        const icon = bookmarkBtn.querySelector('i');
        icon.classList.toggle('fa-bookmark-o');
        icon.classList.toggle('fa-bookmark');
    });
    
    return card;
}

/**
 * Creates pagination buttons
 * @param {number} currentPage - The current page
 * @param {number} totalPages - The total number of pages
 * @param {Function} callback - The callback function to execute when a page button is clicked
 */
function createPagination(currentPage, totalPages, callback) {
    elements.pagination.innerHTML = '';
    
    // Limit total pages to 500 (API limit)
    totalPages = Math.min(totalPages, 500);
    
    // Previous button
    if (currentPage > 1) {
        const prevBtn = document.createElement('button');
        prevBtn.classList.add('page-btn');
        prevBtn.innerHTML = '&laquo;';
        prevBtn.addEventListener('click', () => callback(currentPage - 1));
        elements.pagination.appendChild(prevBtn);
    }
    
    // Calculate page range to display
    let startPage = Math.max(1, currentPage - 2);
    let endPage = Math.min(totalPages, startPage + 4);
    
    // Adjust start page if end page is at max
    if (endPage === totalPages) {
        startPage = Math.max(1, endPage - 4);
    }
    
    // Page buttons
    for (let i = startPage; i <= endPage; i++) {
        const pageBtn = document.createElement('button');
        pageBtn.classList.add('page-btn');
        if (i === currentPage) {
            pageBtn.classList.add('active');
        }
        pageBtn.textContent = i;
        pageBtn.addEventListener('click', () => {
            if (i !== currentPage) {
                callback(i);
            }
        });
        elements.pagination.appendChild(pageBtn);
    }
    
    // Next button
    if (currentPage < totalPages) {
        const nextBtn = document.createElement('button');
        nextBtn.classList.add('page-btn');
        nextBtn.innerHTML = '&raquo;';
        nextBtn.addEventListener('click', () => callback(currentPage + 1));
        elements.pagination.appendChild(nextBtn);
    }
}

/**
 * Displays a loading indicator
 * @param {HTMLElement} container - The container to display the loading indicator in
 */
function showLoading(container) {
    container.innerHTML = `
        <div class="loading">
            <i class="fas fa-spinner fa-spin"></i>
            <p>Films laden...</p>
        </div>
    `;
}

/**
 * Displays an error message
 * @param {HTMLElement} container - The container to display the error message in
 * @param {string} message - The error message to display
 */
function showError(container, message) {
    container.innerHTML = `
        <div class="error">
            <i class="fas fa-exclamation-circle"></i>
            <p>${message}</p>
        </div>
    `;
}

/**
 * Formats a date string to a readable format
 * @param {string} dateStr - The date string in YYYY-MM-DD format
 * @returns {string} - The formatted date string
 */
function formatDate(dateStr) {
    if (!dateStr) return 'Onbekende datum';
    
    const date = new Date(dateStr);
    return date.toLocaleDateString('nl-NL', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });
}

/**
 * Formats runtime minutes to hours and minutes
 * @param {number} minutes - The runtime in minutes
 * @returns {string} - The formatted runtime string
 */
function formatRuntime(minutes) {
    if (!minutes) return 'Onbekende duur';
    
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    
    if (hours === 0) {
        return `${mins} minuten`;
    } else if (mins === 0) {
        return `${hours} uur`;
    } else {
        return `${hours} uur ${mins} minuten`;
    }
}

/**
 * Gets the watchlist from local storage
 * @returns {Array} - The watchlist array
 */
function getWatchlist() {
    const watchlist = localStorage.getItem('watchlist');
    return watchlist ? JSON.parse(watchlist) : [];
}

/**
 * Saves the watchlist to local storage
 * @param {Array} watchlist - The watchlist array to save
 */
function saveWatchlist(watchlist) {
    localStorage.setItem('watchlist', JSON.stringify(watchlist));
}

/**
 * Checks if a movie is in the watchlist
 * @param {number} movieId - The ID of the movie to check
 * @returns {boolean} - Whether the movie is in the watchlist
 */
function isInWatchlist(movieId) {
    const watchlist = getWatchlist();
    return watchlist.some(movie => movie.id === movieId);
}

/**
 * Toggles a movie in the watchlist
 * @param {Object} movie - The movie to toggle
 */
function toggleWatchlist(movie) {
    const watchlist = getWatchlist();
    const index = watchlist.findIndex(item => item.id === movie.id);
    
    if (index === -1) {
        // Add to watchlist
        watchlist.push(movie);
    } else {
        // Remove from watchlist
        watchlist.splice(index, 1);
    }
    
    saveWatchlist(watchlist);
    
    // Update watchlist tab if it's active
    if (document.querySelector('[data-tab="watchlist"]').classList.contains('active')) {
        displayWatchlist();
    }
}

// Export utility functions
const utils = {
    elements,
    createMovieCard,
    createPagination,
    showLoading,
    showError,
    formatDate,
    formatRuntime,
    getWatchlist,
    saveWatchlist,
    isInWatchlist,
    toggleWatchlist
};
