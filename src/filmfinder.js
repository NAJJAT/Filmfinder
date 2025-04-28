// Consolidated JavaScript for FilmFinder

// --- Constants (from api.js) ---
const API_KEY = "YOUR_TMDB_API_KEY"; // Replace with actual API key
const BASE_URL = "https://api.themoviedb.org/3";
const IMAGE_BASE_URL = "https://image.tmdb.org/t/p/w500";

// --- API Fetch Helper (from api.js) ---
async function fetchData(endpoint, params = {}) {
    const urlParams = new URLSearchParams({
        api_key: API_KEY,
        language: "nl-NL", // Assuming Dutch based on index.html
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

// --- API Functions (from api.js) ---
async function discoverMovies(page = 1, sortBy = "popularity.desc", genre = "", year = "") {
    const params = { page, sort_by: sortBy };
    if (genre) params.with_genres = genre;
    if (year) params.primary_release_year = year;
    return await fetchData("discover/movie", params);
}

async function searchMovies(query, page = 1) {
    return await fetchData("search/movie", { query, page });
}

async function getMovieDetails(movieId) {
    return await fetchData(`movie/${movieId}`, { append_to_response: "credits" }); // Include credits (cast)
}

async function getGenres() {
    return await fetchData("genre/movie/list");
}

// --- DOM Utilities (from utils.js) ---
const getElement = (selector) => document.querySelector(selector);
const getElements = (selector) => document.querySelectorAll(selector);
const getElementById = (id) => document.getElementById(id);

// --- UI Helpers (from app.js & utils.js) ---
function showLoading(gridElement) {
    gridElement.innerHTML = `<div class="loading"><i class="fas fa-spinner fa-spin"></i><p>Films laden...</p></div>`;
}

function hideLoading(gridElement) {
    const loadingElement = gridElement.querySelector(".loading");
    if (loadingElement) {
       // Optional: Clear loading indicator if needed, but displayMovies usually overwrites it
    }
}

function displayError(gridElement, message) {
    gridElement.innerHTML = `<div class="error"><p>${message}</p></div>`; // Add styling for .error
}

// --- Element Creation/Manipulation (from utils.js) ---
function createMovieCard(movie, isBookmarked) {
    const card = document.createElement("div");
    card.classList.add("movie-card");
    card.dataset.movieId = movie.id;

    const posterPath = movie.poster_path ? `${IMAGE_BASE_URL}${movie.poster_path}` : "img/placeholder.png"; // Placeholder image needed
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

// --- State Management (from app.js) ---
let state = {
    currentPage: 1,
    currentTab: "discover", // "discover" or "watchlist"
    currentSearchQuery: "",
    currentGenre: "",
    currentYear: "",
    currentSortBy: "popularity.desc",
    watchlist: [],
    totalPages: 1,
};

// --- DOM Elements (from app.js) ---
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

// --- Watchlist Logic (from app.js) ---
function loadWatchlist() {
    const storedWatchlist = localStorage.getItem("filmFinderWatchlist");
    if (storedWatchlist) {
        state.watchlist = JSON.parse(storedWatchlist);
    }
}

function saveWatchlist() {
    localStorage.setItem("filmFinderWatchlist", JSON.stringify(state.watchlist));
}

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

// --- Core Logic (from app.js) ---
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

function displayWatchlist() {
    // hideLoading(watchlistGrid); // Not needed if displayMovies handles empty state
    displayMovies(state.watchlist, watchlistGrid);
    paginationContainer.innerHTML = ""; // No pagination for watchlist
}

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

function updateActiveTab() {
    tabs.forEach(tab => {
        tab.classList.toggle("active", tab.dataset.tab === state.currentTab);
    });
    discoverContent.classList.toggle("active", state.currentTab === "discover");
    watchlistContent.classList.toggle("active", state.currentTab === "watchlist");
}

// --- Modal Logic (from app.js) ---
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

function closeModal() {
    modal.style.display = "none";
    modalBody.innerHTML = "";
    document.body.style.overflow = "auto";
}

// --- Event Handlers (from app.js) ---
function handleSearch() {
    state.currentSearchQuery = searchInput.value.trim();
    state.currentPage = 1;
    state.currentTab = "discover";
    updateActiveTab();
    loadMovies();
}

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

// --- Event Listeners Setup (from app.js) ---
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

// --- Initialization (from app.js) ---
// This function will be called from main.js
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

