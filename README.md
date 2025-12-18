# Chandraवाणी - Web Radio Player

A modern, responsive web-based radio player application that allows users to browse and play live internet radio stations from around the world using the Radio Browser API.

![Chandraवाणी](https://img.shields.io/badge/Version-1.0.0-blue) ![License](https://img.shields.io/badge/License-MIT-green) ![HTML5](https://img.shields.io/badge/HTML5-E34F26?logo=html5&logoColor=white) ![CSS3](https://img.shields.io/badge/CSS3-1572B6?logo=css3&logoColor=white) ![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?logo=javascript&logoColor=black)

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Getting Started](#-getting-started)
- [API Documentation](#-api-documentation)
- [Project Structure](#-project-structure)
- [Usage Guide](#-usage-guide)
- [API Endpoints Explained](#-api-endpoints-explained)
- [Contributing](#-contributing)
- [License](#-license)

## ✨ Features

- **🌍 Global Radio Access**: Browse and listen to thousands of radio stations from around the world
- **🔍 Advanced Search**: Search stations by name, genre, country, and language
- **🎵 Mood-Based Filtering**: Quick access to stations based on your mood (Chill, Workout, Focus, Party, Ambient, Sleep)
- **🏆 Top Stations**: Discover the most popular stations based on click count
- **🎨 Modern UI**: Beautiful dark theme with smooth animations and responsive design
- **📱 Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices
- **🔄 Auto-Fallback**: Automatic failover to backup API endpoints for reliability
- **🎯 Smart Pagination**: Efficient client-side pagination for smooth browsing
- **🌐 Country Flags**: Visual country selection with flag icons
- **🏷️ Genre Tags**: Browse stations by popular genre tags

## 🛠️ Tech Stack

- **HTML5**: Semantic markup and structure
- **CSS3**: Custom styling with Tailwind CSS (via CDN)
- **JavaScript (Vanilla)**: No frameworks, pure JavaScript for optimal performance
- **Radio Browser API**: Free, open-source API for internet radio stations
- **Heroicons**: Modern icon library
- **Flag Icons CSS**: Country flag icons for visual filtering

## 🚀 Getting Started

### Prerequisites

- A modern web browser (Chrome, Firefox, Safari, Edge)
- Internet connection (for API calls and CDN resources)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/chandravaani-radio-player.git
   cd chandravaani-radio-player
   ```

2. **Open the application**
   - Simply open `index.html` in your web browser
   - Or use a local development server:
     ```bash
     # Using Python 3
     python -m http.server 8000
     
     # Using Node.js (http-server)
     npx http-server
     
     # Using PHP
     php -S localhost:8000
     ```
   - Then navigate to `http://localhost:8000` in your browser

3. **No build process required!**
   - This is a pure client-side application
   - All dependencies are loaded via CDN
   - No npm install or build steps needed

## 📚 API Documentation

### Radio Browser API Overview

Chandraवाणी uses the [Radio Browser API](https://api.radio-browser.info/), a free and open-source API that provides access to a comprehensive database of internet radio stations.

**Base URLs (with automatic failover):**
- Primary: `https://de1.api.radio-browser.info/json`
- Backup 1: `https://nl1.api.radio-browser.info/json`
- Backup 2: `https://de2.api.radio-browser.info/json`

The application automatically switches to backup endpoints if the primary endpoint fails, ensuring maximum reliability.

### API Endpoints Used

#### 1. **Search Stations**
```
GET /stations/search
```

**Purpose**: Search for radio stations based on various criteria.

**Query Parameters:**
- `name` (string, optional): Search by station name
- `tagList` (string, optional): Comma-separated list of tags/genres
- `country` (string, optional): Filter by country name
- `language` (string, optional): Filter by language
- `hidebroken` (boolean, default: true): Exclude broken stations
- `limit` (number, default: 1000): Maximum number of results

**Example Request:**
```javascript
GET https://de1.api.radio-browser.info/json/stations/search?name=rock&country=United States&limit=50
```

**Response Format:**
```json
[
  {
    "stationuuid": "unique-id",
    "name": "Station Name",
    "url": "http://stream.url",
    "url_resolved": "http://resolved.stream.url",
    "homepage": "https://station-website.com",
    "favicon": "https://station-favicon.png",
    "tags": "rock,pop,music",
    "country": "United States",
    "countrycode": "US",
    "iso_3166_1": "US",
    "state": "California",
    "language": "english",
    "languagecodes": "en",
    "votes": 1234,
    "lastchangetime": "2024-01-01T00:00:00Z",
    "codec": "MP3",
    "bitrate": 128,
    "hls": 0,
    "lastcheckok": 1,
    "lastchecktime": "2024-01-01T00:00:00Z",
    "clickcount": 5678,
    "clicktrend": 12
  }
]
```

#### 2. **Get Popular Stations**
```
GET /stations/topclick/{limit}
```

**Purpose**: Retrieve the most popular stations based on click count.

**Path Parameters:**
- `limit` (number, required): Number of stations to return (e.g., 8, 20, 50)

**Example Request:**
```javascript
GET https://de1.api.radio-browser.info/json/stations/topclick/8
```

**Response Format:** Same as search stations endpoint.

#### 3. **Get All Stations**
```
GET /stations
```

**Purpose**: Retrieve stations with optional filtering and sorting.

**Query Parameters:**
- `order` (string, optional): Sort field (e.g., "clickcount", "name", "votes")
- `reverse` (boolean, optional): Reverse sort order
- `limit` (number, optional): Maximum results
- `hidebroken` (boolean, default: true): Exclude broken stations

**Example Request:**
```javascript
GET https://de1.api.radio-browser.info/json/stations?order=clickcount&reverse=true&limit=1000
```

#### 4. **Get Countries**
```
GET /countries
```

**Purpose**: Retrieve list of countries with station counts.

**Query Parameters:**
- `order` (string, optional): Sort field (e.g., "stationcount", "name")
- `reverse` (boolean, optional): Reverse sort order
- `limit` (number, optional): Maximum results

**Example Request:**
```javascript
GET https://de1.api.radio-browser.info/json/countries?order=stationcount&reverse=true&limit=5000
```

**Response Format:**
```json
[
  {
    "name": "United States",
    "stationcount": 12345,
    "iso_3166_1": "US"
  }
]
```

#### 5. **Get Tags (Genres)**
```
GET /tags
```

**Purpose**: Retrieve list of available tags/genres with station counts.

**Query Parameters:**
- `order` (string, optional): Sort field (e.g., "stationcount", "name")
- `reverse` (boolean, optional): Reverse sort order
- `limit` (number, optional): Maximum results

**Example Request:**
```javascript
GET https://de1.api.radio-browser.info/json/tags?order=stationcount&reverse=true&limit=100
```

**Response Format:**
```json
[
  {
    "name": "rock",
    "stationcount": 5678
  }
]
```

#### 6. **Get Languages**
```
GET /languages
```

**Purpose**: Retrieve list of languages with station counts.

**Query Parameters:**
- `order` (string, optional): Sort field (e.g., "stationcount", "name")
- `reverse` (boolean, optional): Reverse sort order
- `limit` (number, optional): Maximum results

**Example Request:**
```javascript
GET https://de1.api.radio-browser.info/json/languages?order=stationcount&reverse=true&limit=1000
```

**Response Format:**
```json
[
  {
    "name": "english",
    "stationcount": 23456
  }
]
```

### API Response Fields Explained

| Field | Type | Description |
|-------|------|-------------|
| `stationuuid` | string | Unique identifier for the station |
| `name` | string | Station name |
| `url` | string | Original stream URL |
| `url_resolved` | string | Resolved/working stream URL (preferred) |
| `homepage` | string | Station's website URL |
| `favicon` | string | Station logo/favicon URL |
| `tags` | string | Comma-separated genre tags |
| `country` | string | Country name |
| `countrycode` | string | Two-letter country code |
| `iso_3166_1` | string | ISO 3166-1 alpha-2 country code |
| `state` | string | State/region (if applicable) |
| `language` | string | Primary language |
| `languagecodes` | string | Language codes |
| `votes` | number | Number of votes/ratings |
| `clickcount` | number | Total number of clicks/listens |
| `clicktrend` | number | Recent click trend |
| `bitrate` | number | Audio bitrate in kbps |
| `codec` | string | Audio codec (MP3, AAC, etc.) |
| `hls` | number | HLS stream indicator (0 or 1) |
| `lastcheckok` | number | Last check status (0 or 1) |
| `lastchecktime` | string | ISO 8601 timestamp of last check |
| `lastchangetime` | string | ISO 8601 timestamp of last change |

### Error Handling

The application implements robust error handling:

1. **Automatic Failover**: If the primary API endpoint fails, it automatically tries backup endpoints
2. **Timeout Protection**: 15-second timeout for API requests
3. **User-Friendly Messages**: Clear error messages displayed to users
4. **Graceful Degradation**: Application continues to function even if some API calls fail

### Rate Limiting

The Radio Browser API is free and open-source. While there are no strict rate limits, it's recommended to:
- Cache filter data (countries, languages, tags) when possible
- Implement reasonable delays between requests
- Use the `limit` parameter to avoid fetching unnecessary data

## 📁 Project Structure

```
chandravaani-radio-player/
│
├── index.html          # Main application page
├── about.html          # About page
├── contact.html        # Contact page
├── script.js           # Main JavaScript application logic
├── styles.css          # Custom CSS styles
├── placeholder-icon.svg # Default station icon
├── README.md           # This file
└── .gitignore          # Git ignore file (if applicable)
```

### File Descriptions

- **index.html**: Main application interface with search, filters, and player
- **about.html**: Information about the application
- **contact.html**: Contact form (currently inactive)
- **script.js**: Contains all application logic including:
  - API communication
  - Station search and filtering
  - Audio player management
  - UI updates and interactions
- **styles.css**: Custom styling, animations, and theme definitions

## 📖 Usage Guide

### Basic Usage

1. **Browse Stations**: The homepage loads popular stations automatically
2. **Search**: Use the search bar to find stations by name
3. **Filter**: Use dropdowns to filter by genre, country, or language
4. **Mood Selection**: Click mood buttons for quick genre-based filtering
5. **Country Flags**: Click country flags for visual country selection
6. **Genre Tags**: Click genre tags to filter by specific genres
7. **Play Station**: Click any station card to start playing
8. **Player Controls**: Use the audio player controls to play/pause/seek

### Advanced Features

- **Pagination**: Navigate through search results using pagination controls
- **Top Stations**: View the most popular stations in the "Top Stations" section
- **Dynamic Backgrounds**: Background changes based on the genre of the playing station
- **Responsive Design**: Optimized for all screen sizes

## 🔧 API Integration Details

### Implementation in script.js

The application uses a custom `fetchRadioAPI` function that:

1. **Handles Multiple Endpoints**: Automatically switches between API mirrors
2. **Implements Timeouts**: 15-second timeout for requests
3. **Error Recovery**: Retries with different endpoints on failure
4. **Parameter Handling**: Automatically adds common parameters like `hidebroken: true`

**Example Implementation:**
```javascript
async function fetchRadioAPI(endpoint, params = {}, currentTry = 0) {
    const baseUrl = API_BASE_URLS[currentApiIndex];
    const url = new URL(`${baseUrl}${endpoint}`);
    
    const finalParams = {
        hidebroken: 'true',
        limit: 1000,
        order: 'clickcount',
        reverse: 'true',
        ...params
    };
    
    Object.keys(finalParams).forEach(key => 
        url.searchParams.append(key, finalParams[key])
    );
    
    try {
        const response = await fetch(url, { 
            signal: AbortSignal.timeout(15000) 
        });
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
        return await response.json();
    } catch (error) {
        // Automatic failover logic
        currentApiIndex = (currentApiIndex + 1) % API_BASE_URLS.length;
        if (currentTry < API_BASE_URLS.length - 1) {
            return fetchRadioAPI(endpoint, params, currentTry + 1);
        }
        throw error;
    }
}
```

### Caching Strategy

The application implements client-side caching for:
- **Countries**: Cached after first load
- **Languages**: Cached after first load
- **Tags**: Cached after first load

This reduces API calls and improves performance.

## 🎨 Customization

### Changing Colors

Edit `styles.css` to modify the color scheme:
```css
:root {
    --dark-bg: #111827;
    --card-bg: #1f2937;
    --primary-color: #6366f1;
    /* ... more variables */
}
```

### Adding New Mood Filters

Edit `script.js` to add new mood mappings:
```javascript
const moodMap = {
    'Chill': 'chillout,ambient,lounge,relax',
    'Workout': 'workout,electronic,dance,techno,house',
    // Add your custom mood here
    'YourMood': 'tag1,tag2,tag3'
};
```

### Modifying API Endpoints

Update the `API_BASE_URLS` array in `script.js`:
```javascript
const API_BASE_URLS = [
    'https://de1.api.radio-browser.info/json',
    'https://nl1.api.radio-browser.info/json',
    // Add more endpoints
];
```

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Contribution Guidelines

- Follow existing code style
- Add comments for complex logic
- Test your changes thoroughly
- Update documentation if needed

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- [Radio Browser API](https://www.radio-browser.info/) - For providing free access to radio station data
- [Tailwind CSS](https://tailwindcss.com/) - For the utility-first CSS framework
- [Heroicons](https://heroicons.com/) - For beautiful SVG icons
- [Flag Icons CSS](https://flagicons.lipis.dev/) - For country flag icons

## 📧 Contact

For questions, suggestions, or support, please open an issue on GitHub.

---

**Created by Chandra Bhushan Kumar Singh**

*Enjoy listening to radio stations from around the world! 🌍🎵*
