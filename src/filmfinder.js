// Consolidated JavaScript for FilmFinder

// --- Constants 
const API_KEY = "YOUR_TMDB_API_KEY"; // Replace with actual API key
const BASE_URL = "https://api.themoviedb.org/3";
const IMAGE_BASE_URL = "https://image.tmdb.org/t/p/w500";

// --- API Fetch Helper ---
// Fetches data from a TMDB API endpoint with optional query parameters
async function fetchData(endpoint, params = {}) {
    const urlParams = new URLSearchParams({
        api_key: API_KEY,
        language: "nl-NL", 
        ...params
    });
    const url = `${BASE_URL}/${endpoint}?${urlParams}`;

    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Error fetching data:", error);
        // Handle error appropriately in the UI
        return null;
    }
}

// --- API Functions ---
// Retrieves a list of movies using discover endpoint with sorting, genre, and year filters
async function discoverMovies(page = 1, sortBy = "popularity.desc", genre = "", year = "") {
    const params = { page, sort_by: sortBy };
    if (genre) params.with_genres = genre;
    if (year) params.primary_release_year = year;
    return await fetchData("discover/movie", params);
}

// Searches for movies based on a text query
async function searchMovies(query, page = 1) {
    return await fetchData("search/movie", { query, page });
}

// Gets detailed information for a single movie, including cast credits
async function getMovieDetails(movieId) {
    return await fetchData(`movie/${movieId}`, { append_to_response: "credits" }); // Include credits (cast)
}

// Fetches the list of movie genres from the API
async function getGenres() {
    return await fetchData("genre/movie/list");
}

// --- DOM Utilities ---
// Shorthand for document.querySelector
const getElement = (selector) => document.querySelector(selector);
// Shorthand for document.querySelectorAll
const getElements = (selector) => document.querySelectorAll(selector);
// Shorthand for document.getElementById
const getElementById = (id) => document.getElementById(id);

// --- UI Helpers  ---
// Displays a loading spinner inside the given element
function showLoading(gridElement) {
    gridElement.innerHTML = `<div class="loading"><i class="fas fa-spinner fa-spin"></i><p>Films laden...</p></div>`;
}

// Optionally clears the loading spinner from the element
function hideLoading(gridElement) {
    const loadingElement = gridElement.querySelector(".loading");
    if (loadingElement) {
       // Optional: Clear loading indicator if needed, but displayMovies usually overwrites it
    }
}

// Displays an error message in the given element
function displayError(gridElement, message) {
    gridElement.innerHTML = `<div class="error"><p>${message}</p></div>`; // Add styling for .error
}

// --- Element Creation/Manipulation ---
// Creates a movie card element with bookmark button and rating
function createMovieCard(movie, isBookmarked) {
    const card = document.createElement("div");
    card.classList.add("movie-card");
    card.dataset.movieId = movie.id;

    const posterPath = movie.poster_path ? `${IMAGE_BASE_URL}${movie.poster_path}` : "img/placeholder.png"; 
    const bookmarkClass = isBookmarked ? "active" : "";
    const rating = movie.vote_average ? movie.vote_average.toFixed(1) : "N/A";

    card.innerHTML = `
        <img src="${posterPath}" alt="${movie.title}" class="movie-poster">
        <div class="movie-info">
            <h3 class="movie-title">${movie.title}</h3>
            <p class="movie-year">${movie.release_date ? movie.release_date.substring(0, 4) : "Unknown"}</p>
        </div>
        <div class="movie-rating">${rating} <i class="fas fa-star"></i></div>
        <button class="bookmark-btn ${bookmarkClass}" title="Add to Watchlist">
            <i class="fas fa-bookmark"></i>
        </button>
    `;
    return card;
}
// Creates a pagination button with optional active state
function createPageButton(text, page, isActive = false) {
    const button = document.createElement("button");
    button.classList.add("page-btn");
    button.textContent = text;
    button.dataset.page = page;
    if (isActive) {
        button.classList.add("active");
    }
    return button;
}

// Creates pagination controls based on current page and total pages
function createPagination(currentPage, totalPages) {
    const paginationContainer = getElementById("pagination");
    paginationContainer.innerHTML = ""; // Clear previous pagination

    const maxVisibleButtons = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisibleButtons / 2));
    let endPage = Math.min(totalPages, startPage + maxVisibleButtons - 1);

    if (endPage - startPage + 1 < maxVisibleButtons) {
        startPage = Math.max(1, endPage - maxVisibleButtons + 1);
    }

    // Previous button
    if (currentPage > 1) {
        const prevButton = createPageButton("Vorige", currentPage - 1);
        paginationContainer.appendChild(prevButton);
    }

    // Page number buttons
    for (let i = startPage; i <= endPage; i++) {
        const pageButton = createPageButton(i, i, currentPage === i);
        paginationContainer.appendChild(pageButton);
    }

    // Next button
    if (currentPage < totalPages) {
        const nextButton = createPageButton("Volgende", currentPage + 1);
        paginationContainer.appendChild(nextButton);
    }
}

// --- State Management  ---
let state = {
    currentPage: 1,
    currentTab: "discover", 
    currentSearchQuery: "",
    currentGenre: "",
    currentYear: "",
    currentSortBy: "popularity.desc",
    watchlist: [],
    totalPages: 1,
};

// --- DOM Elements ---
const searchInput = getElementById("search-input");
const searchButton = getElementById("search-button");
const genreFilter = getElementById("genre-filter");
const yearFilter = getElementById("year-filter");
const sortByFilter = getElementById("sort-by");
const tabs = getElements(".tab-btn");
const discoverContent = getElementById("discover-content");
const watchlistContent = getElementById("watchlist-content");
const moviesGrid = getElementById("movies-grid");
const watchlistGrid = getElementById("watchlist-grid");
const paginationContainer = getElementById("pagination");
const modal = getElementById("movie-modal");
const modalBody = getElement(".modal-body");
const closeModalBtn = getElement(".close-modal");
// const loadingIndicator = getElement(".loading"); // Now handled by show/hideLoading
const emptyWatchlistIndicator = getElement(".empty-watchlist");

// --- Watchlist Logic---
// Loads the watchlist from localStorage into the app state
function loadWatchlist() {
    const storedWatchlist = localStorage.getItem("filmFinderWatchlist");
    if (storedWatchlist) {
        state.watchlist = JSON.parse(storedWatchlist);
    }
}

// Saves the current watchlist to localStorage
function saveWatchlist() {
    localStorage.setItem("filmFinderWatchlist", JSON.stringify(state.watchlist));
}

// Toggles a movie in/out of the watchlist and updates the UI/bookmark icon
async function toggleWatchlist(movieId, buttonElement) {
    const movieIndex = state.watchlist.findIndex(item => item.id === movieId);

    if (movieIndex > -1) {
        // Remove from watchlist
        state.watchlist.splice(movieIndex, 1);
        buttonElement.classList.remove("active");
        buttonElement.title = "Add to Watchlist";
    } else {
        // Add to watchlist
        const movieData = await getMovieDetails(movieId); // Fetch details to store
        if (movieData) {
            const watchlistMovie = {
                id: movieData.id,
                title: movieData.title,
                poster_path: movieData.poster_path,
                release_date: movieData.release_date,
                vote_average: movieData.vote_average
            };
            state.watchlist.push(watchlistMovie);
            buttonElement.classList.add("active");
            buttonElement.title = "Remove from Watchlist";
        } else {
            console.error("Could not fetch movie details to add to watchlist");
            return; // Prevent further state changes if fetch failed
        }
    }
    saveWatchlist();
    updateWatchlistTab(); // Update the watchlist tab content and icons
}

// --- Core Logic ---
// Renders a list of movie cards in a grid, or displays a message if empty
function displayMovies(movies, gridElement) {
    gridElement.innerHTML = ""; // Clear previous movies or loading/error state
    if (movies.length === 0) {
        if (gridElement === watchlistGrid) {
             emptyWatchlistIndicator.style.display = "block";
        } else {
            displayError(gridElement, "Geen films gevonden die aan uw criteria voldoen.");
        }
        return;
    }
     if (gridElement === watchlistGrid) {
        emptyWatchlistIndicator.style.display = "none";
     }
    movies.forEach(movie => {
        const isBookmarked = state.watchlist.some(item => item.id === movie.id);
        const movieCard = createMovieCard(movie, isBookmarked);
        gridElement.appendChild(movieCard);
    });
}

// Loads movies either by search or discover based on current state, and shows pagination
async function loadMovies() {
    showLoading(moviesGrid);
    paginationContainer.innerHTML = ""; // Clear pagination
    let data;
    if (state.currentSearchQuery) {
        data = await searchMovies(state.currentSearchQuery, state.currentPage);
    } else {
        data = await discoverMovies(state.currentPage, state.currentSortBy, state.currentGenre, state.currentYear);
    }

    hideLoading(moviesGrid); // Hide loading indicator (might be cleared by displayMovies)
    if (data && data.results) {
        displayMovies(data.results, moviesGrid);
        state.totalPages = data.total_pages > 500 ? 500 : data.total_pages; // TMDB API limit
        createPagination(state.currentPage, state.totalPages);
    } else {
        displayError(moviesGrid, "Kon films niet laden.");
    }
}

// Displays the user's saved watchlist (no pagination)
function displayWatchlist() {; 
    displayMovies(state.watchlist, watchlistGrid);
    paginationContainer.innerHTML = "";
}

// Updates the content of the watchlist tab and bookmark icon states
function updateWatchlistTab() {
    if (state.currentTab === "watchlist") {
        displayWatchlist();
    }
    // Update bookmark icons on the currently displayed grid
    const currentGrid = state.currentTab === 'discover' ? moviesGrid : watchlistGrid;
    const cards = currentGrid.querySelectorAll('.movie-card');
    cards.forEach(card => {
        const movieId = parseInt(card.dataset.movieId, 10);
        const button = card.querySelector('.bookmark-btn');
        if (button) {
            const isBookmarked = state.watchlist.some(item => item.id === movieId);
            button.classList.toggle('active', isBookmarked);
            button.title = isBookmarked ? "Remove from Watchlist" : "Add to Watchlist";
        }
    });
}

// Populates the genre and year filter dropdowns from the API and date range
async function populateFilters() {
    // Populate Genres
    const genreData = await getGenres();
    if (genreData && genreData.genres) {
        genreData.genres.forEach(genre => {
            const option = document.createElement("option");
            option.value = genre.id;
            option.textContent = genre.name;
            genreFilter.appendChild(option);
        });
    }

    // Populate Years
    const currentYear = new Date().getFullYear();
    for (let year = currentYear; year >= currentYear - 50; year--) {
        const option = document.createElement("option");
        option.value = year;
        option.textContent = year;
        yearFilter.appendChild(option);
    }
}

// Updates UI tabs (Discover or Watchlist) and toggles content visibility
function updateActiveTab() {
    tabs.forEach(tab => {
        tab.classList.toggle("active", tab.dataset.tab === state.currentTab);
    });
    discoverContent.classList.toggle("active", state.currentTab === "discover");
    watchlistContent.classList.toggle("active", state.currentTab === "watchlist");
}

// --- Modal Logic ---
// Renders detailed info about a selected movie in the modal, including cast
function displayMovieDetails(movie) {
    const posterPath = movie.poster_path ? `${IMAGE_BASE_URL}${movie.poster_path}` : "img/placeholder.png";
    const genres = movie.genres.map(g => g.name).join(", ");
    const cast = movie.credits?.cast.slice(0, 10) || [];

    modalBody.innerHTML = `
        <div class="movie-detail">
            <div class="movie-detail-header">
                <h2 class="movie-detail-title">${movie.title} (${movie.release_date ? movie.release_date.substring(0, 4) : "N/A"})</h2>
            </div>
            <div class="movie-detail-content">
                 <img src="${posterPath}" alt="${movie.title}" class="movie-detail-poster">
                 <div class="movie-detail-info">
                    <p class="movie-detail-meta"><strong>Genres:</strong> ${genres}</p>
                    <p class="movie-detail-meta"><strong>Rating:</strong> ${movie.vote_average ? movie.vote_average.toFixed(1) : "N/A"} <i class="fas fa-star"></i> (${movie.vote_count} stemmen)</p>
                    <p class="movie-detail-meta"><strong>Runtime:</strong> ${movie.runtime ? movie.runtime + " min" : "N/A"}</p>
                    <h3>Overzicht</h3>
                    <p class="movie-detail-overview">${movie.overview || "Geen overzicht beschikbaar."}</p>
                 </div>
            </div>
            ${cast.length > 0 ? `
            <div class="movie-detail-cast">
                <h3>Cast</h3>
                <div class="cast-list">
                    ${cast.map(actor => `
                        <div class="cast-item">
                            <img src="${actor.profile_path ? IMAGE_BASE_URL + actor.profile_path : 'img/placeholder_actor.png'}" alt="${actor.name}" class="cast-photo">
                            <p class="cast-name">${actor.name}</p>
                            <p class="cast-character">${actor.character}</p>
                        </div>
                    `).join("")}
                </div>
            </div>` : ''}
        </div>
    `;
}

// Opens the modal and loads movie details
async function openModal(movieId) {
    modalBody.innerHTML = `<div class="loading"><i class="fas fa-spinner fa-spin"></i><p>Details laden...</p></div>`;
    modal.style.display = "block";
    document.body.style.overflow = "hidden";

    const movieDetails = await getMovieDetails(movieId);

    if (movieDetails) {
        displayMovieDetails(movieDetails);
    } else {
        modalBody.innerHTML = `<p>Kon film details niet laden.</p>`;
    }
}

// Closes the modal and clears its content
function closeModal() {
    modal.style.display = "none";
    modalBody.innerHTML = "";
    document.body.style.overflow = "auto";
}

// --- Event Handlers ---
// Handles movie search input and triggers a new movie load
function handleSearch() {
    state.currentSearchQuery = searchInput.value.trim();
    state.currentPage = 1;
    state.currentTab = "discover";
    updateActiveTab();
    loadMovies();
}

// Handles filter dropdown changes and updates the movie results
function handleFilterChange() {
    state.currentGenre = genreFilter.value;
    state.currentYear = yearFilter.value;
    state.currentSortBy = sortByFilter.value;
    state.currentPage = 1;
    state.currentSearchQuery = "";
    searchInput.value = "";
    state.currentTab = "discover";
    updateActiveTab();
    loadMovies();
}

// Handles switching between Discover and Watchlist tabs
function handleTabSwitch(tabName) {
    if (state.currentTab === tabName) return;
    state.currentTab = tabName;
    state.currentPage = 1;
    updateActiveTab();

    if (tabName === "discover") {
        loadMovies();
    } else {
        displayWatchlist();
    }
}

// Handles pagination button clicks and loads the selected page
function handlePaginationClick(event) {
    const button = event.target.closest(".page-btn");
    if (button && button.dataset.page) {
        const newPage = parseInt(button.dataset.page, 10);
        if (newPage !== state.currentPage) {
            state.currentPage = newPage;
            if (state.currentTab === "discover") {
                loadMovies();
            }
        }
    }
}

// Handles clicks on movie cards (either bookmarking or opening modal)
function handleMovieCardInteraction(event) {
    const card = event.target.closest(".movie-card");
    if (!card) return;

    const movieId = parseInt(card.dataset.movieId, 10);

    if (event.target.closest(".bookmark-btn")) {
        toggleWatchlist(movieId, event.target.closest(".bookmark-btn"));
    } else {
        openModal(movieId);
    }
}

// --- Event Listeners Setup ---
// Sets up all UI event listeners for search, filters, tabs, modal, and movie cards
function setupEventListeners() {
    searchButton.addEventListener("click", handleSearch);
    searchInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter") {
            handleSearch();
        }
    });

    genreFilter.addEventListener("change", handleFilterChange);
    yearFilter.addEventListener("change", handleFilterChange);
    sortByFilter.addEventListener("change", handleFilterChange);

    tabs.forEach(tab => {
        tab.addEventListener("click", () => handleTabSwitch(tab.dataset.tab));
    });

    paginationContainer.addEventListener("click", handlePaginationClick);

    closeModalBtn.addEventListener("click", closeModal);
    modal.addEventListener("click", (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });

    moviesGrid.addEventListener("click", handleMovieCardInteraction);
    watchlistGrid.addEventListener("click", handleMovieCardInteraction);
}


// This function will be called from main.js
// Initializes the app: loads data, sets up UI, and shows initial results
function initializeApp() {
    console.log("Initializing FilmFinder (Consolidated)...");
    loadWatchlist();
    populateFilters();
    setupEventListeners();
    loadMovies(); // Load initial discover movies
    updateWatchlistTab(); // Initial update for watchlist tab
}

// Export the initializer function for main.js
export { initializeApp };

