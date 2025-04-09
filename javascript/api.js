// API Configuration
const API_KEY = 'api_key=3fd2be6f0c70a2a598f084ddfb75487c'; // This is a public test key for TMDb
const BASE_URL = 'https://api.themoviedb.org/3';
const IMG_URL = 'https://image.tmdb.org/t/p/w500';
const BACKDROP_URL = 'https://image.tmdb.org/t/p/original';

// API Endpoints
const API_ENDPOINTS = {
    DISCOVER: `${BASE_URL}/discover/movie?${API_KEY}&language=nl-NL&sort_by=popularity.desc`,
    SEARCH: `${BASE_URL}/search/movie?${API_KEY}&language=nl-NL&query=`,
    MOVIE_DETAILS: `${BASE_URL}/movie/`,
    GENRES: `${BASE_URL}/genre/movie/list?${API_KEY}&language=nl-NL`,
};

/**
 * Fetches data from the specified URL
 * @param {string} url - The URL to fetch data from
 * @returns {Promise} - A promise that resolves to the JSON data
 */
async function fetchData(url) {
    try {
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error('Error fetching data:', error);
        throw error;
    }
}

/**
 * Fetches popular movies for the discover page
 * @param {number} page - The page number to fetch
 * @param {string} sortBy - The sort parameter
 * @param {number} genreId - The genre ID to filter by
 * @param {number} year - The year to filter by
 * @returns {Promise} - A promise that resolves to the movie data
 */
async function fetchDiscoverMovies(page = 1, sortBy = 'popularity.desc', genreId = '', year = '') {
    let url = `${API_ENDPOINTS.DISCOVER}&page=${page}&sort_by=${sortBy}`;
    
    if (genreId) {
        url += `&with_genres=${genreId}`;
    }
    
    if (year) {
        url += `&primary_release_year=${year}`;
    }
    
    return fetchData(url);
}

/**
 * Searches for movies based on the query
 * @param {string} query - The search query
 * @param {number} page - The page number to fetch
 * @returns {Promise} - A promise that resolves to the search results
 */
async function searchMovies(query, page = 1) {
    const url = `${API_ENDPOINTS.SEARCH}&page=${page}&query=${encodeURIComponent(query)}`;
    return fetchData(url);
}

/**
 * Fetches detailed information about a specific movie
 * @param {number} movieId - The ID of the movie
 * @returns {Promise} - A promise that resolves to the movie details
 */
async function fetchMovieDetails(movieId) {
    const url = `${API_ENDPOINTS.MOVIE_DETAILS}${movieId}?${API_KEY}&language=nl-NL&append_to_response=credits,videos`;
    return fetchData(url);
}

/**
 * Fetches the list of movie genres
 * @returns {Promise} - A promise that resolves to the genre list
 */
async function fetchGenres() {
    return fetchData(API_ENDPOINTS.GENRES);
}

// Export the API functions
const api = {
    fetchDiscoverMovies,
    searchMovies,
    fetchMovieDetails,
    fetchGenres,
    IMG_URL,
    BACKDROP_URL
};
