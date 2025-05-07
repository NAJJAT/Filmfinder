# FilmFinder


FilmFinder is an interactive single-page web application that allows users to discover, search, filter, and save movies to a personal watchlist. This version has been migrated to the Vite framework for improved development experience and performance.

![FilmFinder Screenshot](public/img/screenshot.png) <!-- Add a screenshot when available -->

## Features

### Movie Discovery & Display
- **API Integration**: Fetches movie data from The Movie Database (TMDb) API
- **Visual Display**: Shows movies in an attractive grid format with posters and basic information
- **Detailed Information**: Provides comprehensive details about movies, including cast, genres, and ratings

### Interactive Features
- **Search**: Search for movies by title
- **Filtering**: Filter movies by genre, year, and sort by popularity, rating, or release date
- **Tabs**: Switch between 'Discover' and 'My Watchlist' tabs
- **Pagination**: Navigate through multiple pages of movie results

### Personalization
- **Watchlist**: Save favorite movies to a personal watchlist
- **Persistence**: Watchlist is stored in localStorage and persists between sessions

## Project Structure

```
filmfinder-vite/
├── public/                  # Static assets
│   └── img/                 # Image files
│       ├── favicon.ico      # Site favicon
│       ├── placeholder.png  # Placeholder for missing movie posters
│       └── placeholder_actor.png # Placeholder for missing actor photos
├── index.html               # Main HTML file
├── style.css                # CSS styles
├── main.js                  # Entry point for Vite
├── filmfinder.js            # Consolidated JavaScript code
├── package.json             # Project dependencies and scripts
└── README.md                # Project documentation (this file)
```

## Technical Implementation

### Vite Framework
This project uses Vite as a build tool and development server, providing:
- Fast development server with hot module replacement
- Optimized production builds
- Native ES module support
- Simple configuration

### Modern JavaScript
- **ES Modules**: Uses ES module imports/exports
- **Async/Await**: Handles asynchronous API requests
- **Template Literals**: Generates HTML strings
- **Arrow Functions**: Used for callbacks and event handlers
- **Modern DOM APIs**: Uses querySelector, addEventListener, etc.
- **Fetch API**: Makes HTTP requests to the TMDb API
- **LocalStorage**: Persists watchlist data between sessions

### Responsive Design
- Fully responsive layout that adapts to different screen sizes
- Mobile-friendly interface with touch support
- CSS variables for consistent theming

## Setup and Installation

### Prerequisites
- Node.js (v14.0.0 or higher)
- npm (v6.0.0 or higher)
- TMDb API key (get one at [https://www.themoviedb.org/documentation/api](https://www.themoviedb.org/documentation/api))

### Installation Steps

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd filmfinder-vite
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure the API key:
   - Open `filmfinder.js`
   - Replace `YOUR_TMDB_API_KEY` with your actual TMDb API key:
     ```javascript
     const API_KEY = "your_actual_api_key_here";
     ```

4. Add required image files:
   - Create placeholder images in the `public/img/` directory:
     - `favicon.ico` - Site favicon
     - `placeholder.png` - Placeholder for missing movie posters
     - `placeholder_actor.png` - Placeholder for missing actor photos

5. Start the development server:
   ```bash
   npm run dev
   ```

6. Open your browser and navigate to:
   ```
   http://localhost:5173
   ```

## Usage

### Discovering Movies
- The home page displays popular movies by default
- Use the search bar to find specific movies by title
- Use the filter dropdowns to refine results by genre, year, and sort order
- Click on a movie card to view detailed information

### Managing Your Watchlist
- Click the bookmark icon on any movie card to add it to your watchlist
- Click the "My Watchlist" tab to view your saved movies
- Click the bookmark icon again to remove a movie from your watchlist

### Viewing Movie Details
- Click on a movie card (anywhere except the bookmark icon) to open the details modal
- The modal displays comprehensive information including:
  - Title and release year
  - Poster image
  - Genres
  - Rating
  - Runtime
  - Overview/description
  - Cast information with photos (when available)

## Building for Production

To create a production build:

```bash
npm run build
```

This will generate optimized files in the `dist` directory that can be deployed to any static hosting service.

To preview the production build locally:

```bash
npm run preview
```

## API Usage

This application uses The Movie Database API (TMDb) to fetch movie information. The following endpoints are used:

- `/discover/movie`: For discovering movies with filters
- `/search/movie`: For searching movies by title
- `/movie/{id}`: For fetching detailed information about a specific movie
- `/genre/movie/list`: For fetching the list of movie genres

For more information about the TMDb API, visit [https://developers.themoviedb.org/3](https://developers.themoviedb.org/3).

## Browser Compatibility

FilmFinder is compatible with all modern browsers:
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## 📚 Sources and Acknowledgements

- 🤖 **ChatGPT** – Voor hulp bij het structureren van code en uitleg over JavaScript, API-gebruik en projectopbouw  
  [https://chatgpt.com/share/681b5621-0140-8009-8194-eaaebb2437f8](https://chatgpt.com/share/681b5621-0140-8009-8194-eaaebb2437f8)

- 📘 **freeCodeCamp** – Artikel over het maken van API-aanroepen in JavaScript  
  [https://www.freecodecamp.org/news/make-api-calls-in-javascript/](https://www.freecodecamp.org/news/make-api-calls-in-javascript/)

- 🎨 **FreeFrontend** – CSS-voorbeelden voor het ontwerpen van movie cards  
  [https://freefrontend.com/css-movie-cards/](https://freefrontend.com/css-movie-cards/)

- 📺 **YouTube Tutorial** – Projectopbouw met de TMDb API in JavaScript  
  [https://www.youtube.com/watch?v=f-2AQEIATZY](https://www.youtube.com/watch?v=f-2AQEIATZY)

- 📺 **YouTube – How to FETCH data from an API using JavaScript** – Uitleg over hoe je gegevens ophaalt uit een API met `fetch()`  
  [https://www.youtube.com/watch?v=37vxWr0WgQk](https://www.youtube.com/watch?v=37vxWr0WgQk)
---

## Credits
- Data provided by [The Movie Database (TMDb)](https://www.themoviedb.org)
- Icons from [Font Awesome](https://fontawesome.com/)
- Original project by Ammar Brian
- Vite migration and consolidation by Manus
#
