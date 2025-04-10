
## Projectbeschrijving

FilmFinder is een interactieve single-page webapplicatie die gebruikers in staat stelt om films te ontdekken, te zoeken, te filteren en op te slaan in een persoonlijke watchlist. De applicatie maakt gebruik van The Movie Database API om actuele filminformatie te tonen en biedt een gebruiksvriendelijke interface voor het verkennen van films.

## Functionaliteiten

### Dataverzameling & -weergave
- **API Integratie**: Haalt filmgegevens op van The Movie Database API
- **Visuele Weergave**: Toont films in een aantrekkelijk grid-formaat met posters en basisinformatie
- **Gedetailleerde Informatie**: Biedt uitgebreide details over films, inclusief cast, regisseur, en beoordelingen

### Interactiviteit
- **Zoekfunctie**: Zoek films op titel
- **Filtermogelijkheden**: Filter films op genre, jaar en sorteer op populariteit, beoordeling of releasedatum
- **Tabbladen**: Schakel tussen 'Ontdekken' en 'Mijn Watchlist' tabbladen

### Personalisatie
- **Watchlist**: Sla favoriete films op in een persoonlijke watchlist
- **Persistentie**: Watchlist wordt opgeslagen in localStorage en blijft behouden tussen sessies

## Technische Vereisten Implementatie

### DOM Manipulatie
- **Elementen Selecteren**: Gebruikt `document.getElementById`, `document.querySelector` en `document.querySelectorAll` voor het selecteren van DOM-elementen (zie `utils.js` regel 7-19)
- **Elementen Manipuleren**: Dynamisch aanmaken en wijzigen van elementen zoals filmkaarten en paginering (zie `utils.js` regel 27-60)
- **Events**: Event listeners voor gebruikersinteracties zoals zoeken, filteren en watchlist beheer (zie `app.js` regel 39-76)

### Modern JavaScript
- **Constanten**: Gebruikt `const` voor onveranderlijke waarden (zie `api.js` regel 2-5)
- **Template Literals**: Gebruikt voor het genereren van HTML-strings (zie `utils.js` regel 38-49)
- **Array Methods**: Implementeert `map`, `filter`, `find`, `some` voor datamanipulatie (zie `app.js` regel 283-285)
- **Arrow Functions**: Gebruikt voor callbacks en event handlers (zie `utils.js` regel 93-101)
- **Ternary Operator**: Conditionele logica met ternary operators (zie `utils.js` regel 33-35)
- **Callback Functions**: Gebruikt voor asynchrone operaties (zie `utils.js` regel 93-101)
- **Promises**: Implementeert Promise-gebaseerde API-calls (zie `api.js` regel 19-29)
- **Async/Await**: Gebruikt voor het afhandelen van asynchrone API-verzoeken (zie `api.js` regel 38-48)

### Data & API
- **Fetch**: Gebruikt de Fetch API voor het ophalen van data (zie `api.js` regel 20-28)
- **JSON**: Verwerkt en manipuleert JSON-data van de API (zie `api.js` regel 26)


## Installatie en Gebruik

### Installatie
1. Clone de repository:
   ```
   git clone https://github.com/NAJJAT/Filmfinder.git
   ```
2. Open de map:
   ```
   cd filmfinder
   ```
3. Open `index.html` in een webbrowser

### Gebruik
- **Films Zoeken**: Gebruik het zoekveld bovenaan om films te zoeken op titel
- **Films Filteren**: Gebruik de dropdown-menu's om te filteren op genre, jaar en sortering
- **Film Details Bekijken**: Klik op een filmkaart om gedetailleerde informatie te zien
- **Watchlist Beheren**: Klik op het bookmark-icoon om films toe te voegen aan of te verwijderen uit je watchlist
- **Watchlist Bekijken**: Klik op het "Mijn Watchlist" tabblad om je opgeslagen films te zien

## API Gebruik

Deze applicatie maakt gebruik van The Movie Database API (TMDb) voor het ophalen van filminformatie. De volgende endpoints worden gebruikt:

- `/discover/movie`: Voor het ontdekken van films met filters
- `/search/movie`: Voor het zoeken naar films op titel
- `/movie/{id}`: Voor het ophalen van gedetailleerde informatie over een specifieke film
- `/genre/movie/list`: Voor het ophalen van de lijst met filmgenres


## Technische Uitdagingen en Oplossingen

### Asynchrone Data Verwerking
De applicatie maakt gebruik van async/await voor het afhandelen van asynchrone API-verzoeken, wat de code leesbaarder en onderhoudbaarder maakt dan traditionele callbacks of Promise chains.

### Responsive Design
De applicatie is volledig responsief en past zich aan verschillende schermformaten aan. Dit is bereikt door gebruik te maken van CSS Grid, flexbox en media queries.

### State Management
De applicatie gebruikt een eenvoudig state-object om de huidige toestand bij te houden, zoals de huidige pagina, zoekquery en filters. Dit maakt het gemakkelijker om de gebruikersinterface consistent te houden met de onderliggende data.

## Toekomstige Verbeteringen

- Implementatie van authenticatie voor persoonlijke gebruikersaccounts
- Toevoegen van beoordelingsfunctionaliteit
- Uitbreiding met aanbevelingen op basis van watchlist
- Integratie met streaming diensten om beschikbaarheid te tonen
- Implementatie van geavanceerde zoekfilters

## Credits

- Data afkomstig van [The Movie Database API](https://www.themoviedb.org/documentation/api)
- Iconen van [Font Awesome](https://fontawesome.com/)
