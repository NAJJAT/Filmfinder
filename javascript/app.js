/**
 * Main application file for FilmFinder
 * This file contains the core functionality of the application
 */

// Current state of the application
const state = {
    currentPage: 1,
    totalPages: 0,
    searchQuery: '',
    currentGenre: '',
    currentYear: '',
    currentSortBy: 'popularity.desc',
    isSearchMode: false
};

// Initialize the application
document.addEventListener('DOMContentLoaded', initApp);

/**
 * Initializes the application
 */
async function initApp() {
    try {
        // Initialize event listeners
        setupEventListeners();
        
        // Load genres for filter
        await loadGenres();
        
        // Load years for filter (current year to 1900)
        loadYears();
        
        // Load initial movies
        await loadMovies();
        
        // Display watchlist count
        updateWatchlistCount();
        
    } catch (error) {
        console.error('Error initializing app:', error);
        utils.showError(utils.elements.moviesGrid, 'Er is een fout opgetreden bij het laden van de applicatie. Probeer het later opnieuw.');
    }
}

/**
 * Sets up event listeners for the application
 */
function setupEventListeners() {
    // Search form
    utils.elements.searchButton.addEventListener('click', handleSearch);
    utils.elements.searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    });
    
    // Filters
    utils.elements.genreFilter.addEventListener('change', handleFilterChange);
    utils.elements.yearFilter.addEventListener('change', handleFilterChange);
    utils.elements.sortBy.addEventListener('change', handleFilterChange);
    
    // Tabs
    utils.elements.tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const tab = button.dataset.tab;
            switchTab(tab);
        });
    });
    
    // Modal close
    utils.elements.modalClose.addEventListener('click', closeModal);
    window.addEventListener('click', (e) => {
        if (e.target === utils.elements.modal) {
            closeModal();
        }
    });
    
    // Keyboard events for modal
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && utils.elements.modal.style.display === 'block') {
            closeModal();
        }
    });
}

/**
 * Loads the list of genres from the API
 */
async function loadGenres() {
    try {
        const data = await api.fetchGenres();
        const genreSelect = utils.elements.genreFilter;
        
        // Add genres to select element
        data.genres.forEach(genre => {
            const option = document.createElement('option');
            option.value = genre.id;
            option.textContent = genre.name;
            genreSelect.appendChild(option);
        });
    } catch (error) {
        console.error('Error loading genres:', error);
    }
}

/**
 * Loads years for the year filter (current year to 1900)
 */
function loadYears() {
    const yearSelect = utils.elements.yearFilter;
    const currentYear = new Date().getFullYear();
    
    for (let year = currentYear; year >= 1900; year--) {
        const option = document.createElement('option');
        option.value = year;
        option.textContent = year;
        yearSelect.appendChild(option);
    }
}

/**
 * Loads movies based on current state
 */
async function loadMovies() {
    utils.showLoading(utils.elements.moviesGrid);
    
    try {
        let data;
        
        if (state.isSearchMode && state.searchQuery) {
            // Search mode
            data = await api.searchMovies(state.searchQuery, state.currentPage);
        } else {
            // Discover mode
            data = await api.fetchDiscoverMovies(
                state.currentPage,
                state.currentSortBy,
                state.currentGenre,
                state.currentYear
            );
        }
        
        displayMovies(data);
        
    } catch (error) {
        console.error('Error loading movies:', error);
        utils.showError(utils.elements.moviesGrid, 'Er is een fout opgetreden bij het laden van de films. Probeer het later opnieuw.');
    }
}

/**
 * Displays movies in the grid
 * @param {Object} data - The movie data from the API
 */
function displayMovies(data) {
    const moviesGrid = utils.elements.moviesGrid;
    moviesGrid.innerHTML = '';
    
    if (data.results.length === 0) {
        moviesGrid.innerHTML = `
            <div class="empty-results">
                <i class="fas fa-film"></i>
                <p>Geen films gevonden. Probeer andere zoektermen of filters.</p>
            </div>
        `;
        utils.elements.pagination.innerHTML = '';
        return;
    }
    
    // Update state
    state.totalPages = data.total_pages;
    
    // Create movie cards
    data.results.forEach(movie => {
        const isInWatchlist = utils.isInWatchlist(movie.id);
        const movieCard = utils.createMovieCard(movie, isInWatchlist);
        moviesGrid.appendChild(movieCard);
    });
    
    // Create pagination
    utils.createPagination(state.currentPage, state.totalPages, (page) => {
        state.currentPage = page;
        loadMovies();
        // Scroll to top when changing page
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}

/**
 * Displays the watchlist
 */
function displayWatchlist() {
    const watchlistGrid = utils.elements.watchlistGrid;
    const watchlist = utils.getWatchlist();
    
    watchlistGrid.innerHTML = '';
    
    if (watchlist.length === 0) {
        watchlistGrid.innerHTML = `
            <div class="empty-watchlist">
                <i class="fas fa-film"></i>
                <p>Je watchlist is leeg. Voeg films toe door op het bookmark icoon te klikken.</p>
            </div>
        `;
        return;
    }
    
    // Create movie cards for watchlist
    watchlist.forEach(movie => {
        const movieCard = utils.createMovieCard(movie, true);
        watchlistGrid.appendChild(movieCard);
    });
}

/**
 * Updates the watchlist count in the tab button
 */
function updateWatchlistCount() {
    const watchlist = utils.getWatchlist();
    const watchlistTab = document.querySelector('[data-tab="watchlist"]');
    
    if (watchlist.length > 0) {
        watchlistTab.textContent = `Mijn Watchlist (${watchlist.length})`;
    } else {
        watchlistTab.textContent = 'Mijn Watchlist';
    }
}

/**
 * Handles search form submission
 */
function handleSearch() {
    const query = utils.elements.searchInput.value.trim();
    
    if (query) {
        state.searchQuery = query;
        state.isSearchMode = true;
        state.currentPage = 1;
        loadMovies();
        
        // Switch to discover tab if not already active
        switchTab('discover');
    }
}

/**
 * Handles filter changes
 */
function handleFilterChange() {
    state.currentGenre = utils.elements.genreFilter.value;
    state.currentYear = utils.elements.yearFilter.value;
    state.currentSortBy = utils.elements.sortBy.value;
    state.currentPage = 1;
    state.isSearchMode = false; // Reset search mode when filters change
    
    // Clear search input
    utils.elements.searchInput.value = '';
    state.searchQuery = '';
    
    loadMovies();
}

/**
 * Switches between tabs
 * @param {string} tabName - The name of the tab to switch to
 */
function switchTab(tabName) {
    // Update tab buttons
    utils.elements.tabButtons.forEach(button => {
        if (button.dataset.tab === tabName) {
            button.classList.add('active');
        } else {
            button.classList.remove('active');
        }
    });
    
    // Update tab content
    utils.elements.tabContents.forEach(content => {
        if (content.id === `${tabName}-content`) {
            content.classList.add('active');
            
            // Load content based on tab
            if (tabName === 'watchlist') {
                displayWatchlist();
            }
        } else {
            content.classList.remove('active');
        }
    });
}

/**
 * Opens the movie details modal
 * @param {number} movieId - The ID of the movie to display
 */
async function openMovieDetails(movieId) {
    try {
        utils.elements.modalBody.innerHTML = `
            <div class="loading">
                <i class="fas fa-spinner fa-spin"></i>
                <p>Film details laden...</p>
            </div>
        `;
        
        utils.elements.modal.style.display = 'block';
        document.body.style.overflow = 'hidden'; // Prevent scrolling when modal is open
        
        const movie = await api.fetchMovieDetails(movieId);
        displayMovieDetails(movie);
        
    } catch (error) {
        console.error('Error loading movie details:', error);
        utils.elements.modalBody.innerHTML = `
            <div class="error">
                <i class="fas fa-exclamation-circle"></i>
                <p>Er is een fout opgetreden bij het laden van de filmdetails. Probeer het later opnieuw.</p>
            </div>
        `;
    }
}

/**
 * Displays movie details in the modal
 * @param {Object} movie - The movie data
 */
function displayMovieDetails(movie) {
    const isInWatchlist = utils.isInWatchlist(movie.id);
    const posterPath = movie.poster_path 
        ? api.IMG_URL + movie.poster_path 
        : 'img/no-poster.jpg';
    const backdropPath = movie.backdrop_path 
        ? api.BACKDROP_URL + movie.backdrop_path 
        : '';
    
    // Format genres
    const genres = movie.genres.map(genre => genre.name).join(', ');
    
    // Get director
    const director = movie.credits.crew.find(person => person.job === 'Director');
    const directorName = director ? director.name : 'Onbekend';
    
    // Get cast (limit to 10)
    const cast = movie.credits.cast.slice(0, 10);
    
    // Create HTML for movie details
    let html = `
        <div class="movie-detail">
            <div class="movie-detail-header">
                <div>
                    <h2 class="movie-detail-title">${movie.title}</h2>
                    <div class="movie-detail-meta">
                        <span>${utils.formatDate(movie.release_date)}</span>
                        <span>•</span>
                        <span>${utils.formatRuntime(movie.runtime)}</span>
                        <span>•</span>
                        <span>${genres}</span>
                    </div>
                </div>
                <button class="bookmark-btn ${isInWatchlist ? 'active' : ''}" id="detail-bookmark">
                    <i class="fas ${isInWatchlist ? 'fa-bookmark' : 'fa-bookmark-o'}"></i>
                    ${isInWatchlist ? 'In watchlist' : 'Toevoegen aan watchlist'}
                </button>
            </div>
            
            <div class="movie-detail-content">
                <img src="${posterPath}" alt="${movie.title}" class="movie-detail-poster">
                
                <div class="movie-detail-info">
                    <div class="movie-detail-rating">
                        <span class="rating-value">${movie.vote_average.toFixed(1)}</span>/10
                        <span class="rating-count">(${movie.vote_count} stemmen)</span>
                    </div>
                    
                    <div class="movie-detail-tagline">${movie.tagline || ''}</div>
                    
                    <h3>Overzicht</h3>
                    <p class="movie-detail-overview">${movie.overview || 'Geen beschrijving beschikbaar.'}</p>
                    
                    <div class="movie-detail-extra">
                        <p><strong>Regisseur:</strong> ${directorName}</p>
                        <p><strong>Originele titel:</strong> ${movie.original_title}</p>
                        <p><strong>Taal:</strong> ${movie.original_language.toUpperCase()}</p>
                        <p><strong>Budget:</strong> ${movie.budget ? `€${movie.budget.toLocaleString()}` : 'Onbekend'}</p>
                        <p><strong>Opbrengst:</strong> ${movie.revenue ? `€${movie.revenue.toLocaleString()}` : 'Onbekend'}</p>
                    </div>
                    
                    <div class="movie-detail-cast">
                        <h3>Cast</h3>
                        <div class="cast-list">
    `;
    
    // Add cast members
    cast.forEach(person => {
        const profilePath = person.profile_path 
            ? `https://image.tmdb.org/t/p/w185${person.profile_path}` 
            : 'img/no-profile.jpg';
        
        html += `
            <div class="cast-item">
                <img src="${profilePath}" alt="${person.name}" class="cast-photo">
                <div class="cast-name">${person.name}</div>
                <div class="cast-character">${person.character}</div>
            </div>
        `;
    });
    
    html += `
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    utils.elements.modalBody.innerHTML = html;
    
    // Add event listener to bookmark button
    const bookmarkBtn = document.getElementById('detail-bookmark');
    bookmarkBtn.addEventListener('click', () => {
        toggleWatchlist(movie);
        bookmarkBtn.classList.toggle('active');
        const icon = bookmarkBtn.querySelector('i');
        icon.classList.toggle('fa-bookmark-o');
        icon.classList.toggle('fa-bookmark');
        bookmarkBtn.textContent = bookmarkBtn.classList.contains('active') 
            ? 'In watchlist' 
            : 'Toevoegen aan watchlist';
    });
}

/**
 * Closes the movie details modal
 */
function closeModal() {
    utils.elements.modal.style.display = 'none';
    document.body.style.overflow = ''; // Restore scrolling
}

/**
 * Toggles a movie in the watchlist
 * @param {Object} movie - The movie to toggle
 */
function toggleWatchlist(movie) {
    utils.toggleWatchlist(movie);
    updateWatchlistCount();
}
