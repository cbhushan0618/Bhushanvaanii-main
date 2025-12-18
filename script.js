document.addEventListener('DOMContentLoaded', () => {
    // --- Constants & State ---
    const API_BASE_URLS = [
        'https://de1.api.radio-browser.info/json',
        'https://nl1.api.radio-browser.info/json', // Added another potential mirror
        'https://de2.api.radio-browser.info/json'
    ];
    let currentApiIndex = 0;
    let currentStations = [];
    let currentPlayingStationId = null;
    const stationsPerPage = 16;
    let currentPage = 1;
    let currentSearchTerm = '';
    let currentGenre = '';
    let currentCountry = '';
    let currentLanguage = '';
    let currentMoodTag = ''; // Added for mood state
    let isLoading = false; // Flag to prevent multiple simultaneous loads

    // Cache for filters
    let countriesCache = null;
    let languagesCache = null;
    let tagsCache = null;

    // --- Mood Mapping ---
    const moodMap = {
        'Chill': 'chillout,ambient,lounge,relax', // Map mood to potential tags
        'Workout': 'workout,electronic,dance,techno,house', // Example tags
        'Focus': 'focus,ambient,classical,instrumental,lofi', // Example tags
        'Party': 'party,dance,pop,disco,house', // Example tags
        'Ambient': 'ambient,drone,atmospheric', // Example tags
        'Sleep': 'sleep,ambient,relaxing'
    };

    // --- Background Theme Mapping ---
    const backgroundThemeMap = {
        'chillout': 'bg-theme-chill',
        'ambient': 'bg-theme-chill',
        'lounge': 'bg-theme-chill',
        'relax': 'bg-theme-chill',
        'sleep': 'bg-theme-chill',
        'workout': 'bg-theme-workout',
        'electronic': 'bg-theme-workout',
        'dance': 'bg-theme-workout',
        'techno': 'bg-theme-workout',
        'house': 'bg-theme-workout',
        'focus': 'bg-theme-focus',
        'classical': 'bg-theme-classical',
        'instrumental': 'bg-theme-focus',
        'lofi': 'bg-theme-focus',
        'jazz': 'bg-theme-jazz',
        'party': 'bg-theme-party',
        'pop': 'bg-theme-party',
        'disco': 'bg-theme-party',
        // Add more mappings as needed
    };
    const defaultBackground = 'bg-theme-default'; // Use a class for the default

    // --- DOM Elements ---
    const searchInput = document.getElementById('search-input');
    const genreFilter = document.getElementById('genre-filter');
    const countryFilter = document.getElementById('country-filter');
    const languageFilter = document.getElementById('language-filter');
    const searchButton = document.getElementById('search-button');
    const resetButton = document.getElementById('reset-button');
    const stationListDiv = document.getElementById('station-list');
    const topStationsListDiv = document.getElementById('top-stations-list');
    const genreTagsDiv = document.getElementById('genre-tags');
    const flagListDiv = document.getElementById('flag-list');
    const paginationDiv = document.getElementById('pagination');
    const loadingMessage = document.getElementById('loading-message');
    const noResultsMessage = document.getElementById('no-results-message');
    const playerSection = document.getElementById('player');
    const playerFavicon = document.getElementById('player-favicon');
    const playerStationName = document.getElementById('player-station-name');
    const playerStationInfo = document.getElementById('player-station-info');
    const audioPlayer = document.getElementById('audio-player');
    const moodListDiv = document.getElementById('mood-list'); // Added

    // --- API Fetching --- (with Fallback)
    async function fetchRadioAPI(endpoint, params = {}, currentTry = 0) {
        const baseUrl = API_BASE_URLS[currentApiIndex];
        const url = new URL(`${baseUrl}${endpoint}`);
        // Add default params and user-provided params
        const finalParams = {
             hidebroken: 'true',
             limit: 1000, // Fetch a large batch for client-side filtering/pagination
             order: 'clickcount',
             reverse: 'true',
             ...params
        };
        Object.keys(finalParams).forEach(key => url.searchParams.append(key, finalParams[key]));

        console.log(`Fetching: ${url.toString()}`);
        try {
            const response = await fetch(url, { signal: AbortSignal.timeout(15000) }); // 15 second timeout
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            const data = await response.json();
            console.log(`Received ${data?.length || 0} items from ${url.toString()}`);
            return data;
        } catch (error) {
            console.error(`Error fetching from ${baseUrl}: ${error.message}`);
            currentApiIndex = (currentApiIndex + 1) % API_BASE_URLS.length;
            if (currentTry < API_BASE_URLS.length - 1) {
                console.log(`Retrying with ${API_BASE_URLS[currentApiIndex]}...`);
                return fetchRadioAPI(endpoint, params, currentTry + 1);
            } else {
                console.error('All API endpoints failed.');
                displayError('Failed to connect to the Radio Browser API. Please try again later.');
                return null;
            }
        }
    }

    // --- UI Rendering ---
    function displayStations(stations, targetDiv) {
        if (!targetDiv) return;
        targetDiv.classList.remove('loading');
        targetDiv.innerHTML = ''; // Clear previous content or loading spinner

        if (!stations || stations.length === 0) {
            // Handled by show/hide messages function
            return;
        }

        stations.forEach((station, index) => {
            const card = createStationCard(station);
            card.style.setProperty('--animation-delay', `${index * 0.05}s`);
            targetDiv.appendChild(card);
        });
    }

    function createStationCard(station) {
        const card = document.createElement('div');
        card.className = 'station-card bg-gray-800 rounded-lg p-3 shadow-md cursor-pointer hover:bg-gray-700 transition duration-200 flex flex-col gap-2 opacity-0 animate-fade-in';
        card.dataset.stationId = station.stationuuid;
        const streamUrl = station.url_resolved || station.url;
        card.dataset.streamUrl = streamUrl || '';

        const placeholderIcon = `
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-full h-full text-gray-500">
              <path fill-rule="evenodd" d="M1.5 4.5a3 3 0 0 1 3-3h1.372c.86 0 1.61.586 1.819 1.42l1.105 4.423a1.875 1.875 0 0 1-.694 1.955l-1.293.97c-.135.101-.164.279-.087.431l4.106 7.482a1.875 1.875 0 0 1 1.955-.694l4.423 1.105c.834.209 1.42.959 1.42 1.82V19.5a3 3 0 0 1-3 3h-1.372c-.86 0-1.61-.586-1.819-1.42l-1.105-4.423a1.875 1.875 0 0 1 .694-1.955l1.293-.97c.135-.101.164-.279.087-.431l-4.106-7.482A1.875 1.875 0 0 1 8.943 3.694l-4.423-1.105a3.003 3.003 0 0 1-1.82-.188A3 3 0 0 1 1.5 4.5Zm15-1.5a.75.75 0 0 0-.75.75V5.25a.75.75 0 0 0 1.5 0V3.75a.75.75 0 0 0-.75-.75Z" clip-rule="evenodd" />
            </svg>`;

        card.innerHTML = `
            <div class="flex items-center gap-3">
                <div class="w-12 h-12 rounded bg-gray-700 flex-shrink-0 overflow-hidden flex items-center justify-center">
                    ${station.favicon ? `<img src="${station.favicon}" alt="" class="w-full h-full object-cover" onerror="this.parentElement.innerHTML = '${placeholderIcon.replace(/\n/g, '').replace(/'/g, '\"')}';">` : placeholderIcon}
                </div>
                <div class="flex-grow min-w-0">
                    <h3 class="font-semibold text-sm text-gray-100 truncate" title="${station.name || ''}">${station.name || 'Unknown Station'}</h3>
                    <p class="text-xs text-gray-400 truncate" title="${station.country || ''}">${station.country || 'Unknown Country'}</p>
                </div>
            </div>
            <div class="text-xs text-gray-400 truncate" title="${station.tags || ''}">Tags: ${station.tags || 'N/A'}</div>
            <div class="text-xs text-gray-400">Bitrate: ${station.bitrate || 'N/A'} kbps</div>
        `;

        if (streamUrl) {
            card.addEventListener('click', () => playStation(station));
        } else {
            card.style.cursor = 'not-allowed';
            card.style.opacity = '0.6';
            card.title = 'Station stream URL is missing or invalid.';
        }
        return card;
    }

     function displayError(message) {
         const errorContainer = document.getElementById('error-container');
         const errorMessageSpan = document.getElementById('error-message');

         if (errorContainer && errorMessageSpan) {
             errorMessageSpan.textContent = message;
             errorContainer.classList.remove('hidden');
             // Optional: Add a close button listener if implemented
             // const closeBtn = document.getElementById('close-error');
             // if (closeBtn) closeBtn.onclick = () => errorContainer.classList.add('hidden');

             // Auto-hide after a few seconds?
             setTimeout(() => {
                if (errorContainer) errorContainer.classList.add('hidden');
             }, 7000); // Hide after 7 seconds
         } else {
             // Fallback to alert if the container isn't found
             console.error("Error container not found. Falling back to alert.");
             alert(`Error: ${message}`);
         }

         // Hide loading indicators regardless
         stationListDiv?.classList.remove('loading');
         topStationsListDiv?.classList.remove('loading');
         genreTagsDiv?.classList.remove('loading');
         hideMessage(loadingMessage);
     }

    function showMessage(element) {
        element?.classList.remove('hidden');
    }

    function hideMessage(element) {
        element?.classList.add('hidden');
    }

    // --- Player Logic ---
    function playStation(station) {
        if (!station || !station.stationuuid) return;
        const streamUrl = station.url_resolved || station.url;
        if (!streamUrl) {
            displayError(`Station '${station.name}' has no stream URL.`);
            return;
        }

        console.log(`Playing: ${station.name} (${streamUrl})`);
        audioPlayer.src = streamUrl;
        audioPlayer.play().then(() => {
            updatePlayerUI(station);
            currentPlayingStationId = station.stationuuid;
            highlightPlayingStation();
        }).catch(error => {
            console.error(`Error playing ${station.name}:`, error);
            displayError(`Could not play station '${station.name}'. Stream might be offline or incompatible.`);
            resetPlayerUI();
        });
    }

    function updatePlayerUI(station) {
        playerSection.classList.remove('hidden');
        playerFavicon.src = station.favicon || ''; // Set src, rely on onerror for placeholder
        playerFavicon.alt = station.name || 'Station';
        playerStationName.textContent = station.name || 'Unknown Station';
        playerStationInfo.textContent = `${station.country || 'Unknown'} - ${station.bitrate || 'N/A'}kbps`;

        // --- Dynamic Background Logic ---
        updateBackgroundTheme(station.tags);
    }

    function resetPlayerUI() {
         playerSection.classList.add('hidden');
         audioPlayer.src = '';
         currentPlayingStationId = null;
         highlightPlayingStation();
         // Reset background to default
         updateBackgroundTheme(null);
    }

    function updateBackgroundTheme(tagsString) {
        const body = document.body;
        // Remove existing theme classes
        Object.values(backgroundThemeMap).forEach(themeClass => body.classList.remove(themeClass));
        body.classList.remove(defaultBackground);
        body.classList.remove('background-gradient'); // Remove initial gradient if themes apply

        let themeApplied = false;
        if (tagsString) {
            const tags = tagsString.toLowerCase().split(',');
            for (const tag of tags) {
                const themeClass = backgroundThemeMap[tag.trim()];
                if (themeClass) {
                    body.classList.add(themeClass);
                    themeApplied = true;
                    console.log(`Applied background theme: ${themeClass} for tag: ${tag}`);
                    break; // Apply first matching theme
                }
            }
        }

        // If no theme was applied based on tags, set default
        if (!themeApplied) {
            body.classList.add(defaultBackground);
        }
    }

    playerFavicon.onerror = () => {
        // Display inline SVG placeholder on error
        playerFavicon. Msrc = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%234b5563"><path fill-rule="evenodd" d="M1.5 4.5a3 3 0 0 1 3-3h1.372c.86 0 1.61.586 1.819 1.42l1.105 4.423a1.875 1.875 0 0 1-.694 1.955l-1.293.97c-.135.101-.164.279-.087.431l4.106 7.482a1.875 1.875 0 0 1 1.955-.694l4.423 1.105c.834.209 1.42.959 1.42 1.82V19.5a3 3 0 0 1-3 3h-1.372c-.86 0-1.61-.586-1.819-1.42l-1.105-4.423a1.875 1.875 0 0 1 .694-1.955l1.293-.97c.135-.101.164-.279.087-.431l-4.106-7.482A1.875 1.875 0 0 1 8.943 3.694l-4.423-1.105a3.003 3.003 0 0 1-1.82-.188A3 3 0 0 1 1.5 4.5Zm15-1.5a.75.75 0 0 0-.75.75V5.25a.75.75 0 0 0 1.5 0V3.75a.75.75 0 0 0-.75-.75Z" clip-rule="evenodd" /></svg>`;
    };

     audioPlayer.addEventListener('error', (e) => {
         console.error("Audio Player Error:", e);
         if (currentPlayingStationId) { // Only show error if we were trying to play something
             displayError(`Playback error for ${playerStationName.textContent}. Stream might be offline or incompatible.`);
         }
         resetPlayerUI();
     });

     audioPlayer.addEventListener('ended', () => {
         console.log("Playback ended for", playerStationName.textContent);
         // Optional: Auto-play next? Or just reset.
         resetPlayerUI();
     });

     function highlightPlayingStation() {
         document.querySelectorAll('.station-card').forEach(card => {
             if (card.dataset.stationId === currentPlayingStationId) {
                 card.classList.add('border-indigo-500', 'border-2'); // Simple highlight
             } else {
                 card.classList.remove('border-indigo-500', 'border-2');
             }
         });
     }

    // --- Filtering and Searching ---
    async function handleSearchOrFilter() {
        if (isLoading) return;
        isLoading = true;
        currentPage = 1; // Reset page on new search/filter
        currentSearchTerm = searchInput.value.trim();
        currentGenre = genreFilter.value;
        currentCountry = countryFilter.value;
        currentLanguage = languageFilter.value;
        // If a mood was selected, currentMoodTag holds the tag(s)
        // We prioritize mood tag if set, otherwise use genre dropdown
        const filterTag = currentMoodTag || currentGenre;

        // Clear other potentially conflicting filters when a new primary filter is set
        // (e.g., clicking a mood clears the genre dropdown visually)
        // This logic might need refinement based on desired interaction

        await loadStations(filterTag); // Pass the effective tag to loadStations
        isLoading = false;
    }

    function handleMoodSelection(event) {
        if (isLoading || !event.target.classList.contains('mood-button')) return;

        const selectedMood = event.target.dataset.mood;
        currentMoodTag = moodMap[selectedMood] || ''; // Get corresponding tags

        // Visually deselect other mood buttons
        document.querySelectorAll('#mood-list button.selected').forEach(btn => btn.classList.remove('selected'));
        // Select clicked button
        event.target.classList.add('selected');

        // Clear potentially conflicting filters
        genreFilter.value = ''; // Clear genre dropdown
        currentGenre = '';
        // Deselect genre tag buttons
         document.querySelectorAll('#genre-tags button.bg-indigo-500').forEach(btn => {
            btn.classList.remove('bg-indigo-500');
            btn.classList.add('bg-gray-600', 'hover:bg-gray-500'); // Assuming these are the base classes
        });

        console.log(`Mood selected: ${selectedMood}, Tag(s): ${currentMoodTag}`);
        handleSearchOrFilter(); // Trigger station loading
    }

    function resetSearchAndFilters() {
        if (isLoading) return;
        searchInput.value = '';
        genreFilter.value = '';
        countryFilter.value = '';
        languageFilter.value = '';
        currentPage = 1;
        currentSearchTerm = '';
        currentGenre = '';
        currentCountry = '';
        currentLanguage = '';
        currentMoodTag = ''; // Reset mood tag
        loadStations(); // Reload default popular stations
        // Reset genre tag selection if applicable
        document.querySelectorAll('#genre-tags button.bg-indigo-500').forEach(btn => {
            btn.classList.remove('bg-indigo-500');
            btn.classList.add('bg-gray-600', 'hover:bg-gray-500');
        });
        // Reset flag selection
        document.querySelectorAll('#flag-list button.selected').forEach(btn => {
            btn.classList.remove('selected');
        });
        // Select the "All Countries" button visually if it exists
        const allFlagsButton = flagListDiv?.querySelector('button[data-country-name="All Countries"]');
        if (allFlagsButton) {
            allFlagsButton.classList.add('selected');
        }
        // Deselect mood buttons
        document.querySelectorAll('#mood-list button.selected').forEach(btn => btn.classList.remove('selected'));
    }

    // --- Loading Data ---
    async function loadStations(filterTag = null) {
        stationListDiv.innerHTML = '';
        stationListDiv.classList.add('loading');
        hideMessage(noResultsMessage);
        hideMessage(loadingMessage);
        paginationDiv.innerHTML = '';

        let params = {};
        let endpoint = '/stations';

        // Use the provided filterTag (from mood) or the genre dropdown value
        const effectiveTag = filterTag !== null ? filterTag : currentGenre;

        if (currentSearchTerm) params.name = currentSearchTerm;
        if (effectiveTag) params.tagList = effectiveTag; // Use tagList for multiple tags
        if (currentCountry) params.country = currentCountry;
        if (currentLanguage) params.language = currentLanguage;

        if (currentSearchTerm || effectiveTag || currentCountry || currentLanguage) {
            endpoint = '/stations/search';
            // API recommends using 'search' endpoint with 'tagList' for multiple tags
            delete params.order;
            delete params.reverse;
            params.limit = 500;
        } else {
            params.order = 'clickcount';
            params.reverse = 'true';
            params.limit = 1000;
        }

        const stations = await fetchRadioAPI(endpoint, params);

        stationListDiv.classList.remove('loading');

        if (stations && stations.length > 0) {
            currentStations = stations;
            renderCurrentPage();
        } else {
            currentStations = [];
            showMessage(noResultsMessage);
        }
    }

    async function loadTopStations() {
        topStationsListDiv.innerHTML = '';
        topStationsListDiv.classList.add('loading');
        const topStations = await fetchRadioAPI('/stations/topclick/8'); // Fetch top 8
        if (topStations && topStations.length > 0) {
            displayStations(topStations, topStationsListDiv);
        } else {
             topStationsListDiv.classList.remove('loading');
             topStationsListDiv.innerHTML = '<p class="text-gray-400 text-sm col-span-full text-center">Could not load top stations.</p>';
        }
    }

    async function loadFilterOptions() {
        // Countries (fetch with codes for flags)
        if (!countriesCache) {
             // Request includes countrycode field which often holds iso_3166_1
             countriesCache = await fetchRadioAPI('/countries', { order: 'stationcount', reverse: 'true', limit: 5000 });
         }
        if (countriesCache) {
            populateDropdown(countryFilter, countriesCache, 'Filter by Country', 'name', 'name');
            populateFlagFilters(countriesCache.slice(0, 30)); // Show top 30 country flags
        }

        // Languages
         if (!languagesCache) {
             languagesCache = await fetchRadioAPI('/languages', { order: 'stationcount', reverse: 'true', limit: 1000 });
         }
        if (languagesCache) {
            populateDropdown(languageFilter, languagesCache, 'Filter by Language', 'name', 'name');
        }

        // Tags (Genres)
        if (!tagsCache) {
             tagsCache = await fetchRadioAPI('/tags', { order: 'stationcount', reverse: 'true', limit: 100 });
         }
        if (tagsCache) {
            populateDropdown(genreFilter, tagsCache, 'Filter by Genre (Tag)', 'name', 'name');
            populateGenreTags(tagsCache.slice(0, 25)); // Show top 25 tags
        }
    }

    function populateDropdown(selectElement, items, defaultOptionText, valueKey, textKey) {
        if (!selectElement || !items) return;
        // Keep the default option
        const defaultOption = selectElement.querySelector('option');
        selectElement.innerHTML = '';
        if (defaultOption) selectElement.appendChild(defaultOption);

        items.forEach(item => {
            if (item && item[valueKey] && item[textKey] && typeof item[textKey] === 'string' && item[textKey].trim() !== '') {
                const option = document.createElement('option');
                option.value = item[valueKey];
                option.textContent = `${item[textKey]}${item.stationcount ? ` (${item.stationcount})` : ''}`;
                selectElement.appendChild(option);
            }
        });
    }

    function populateFlagFilters(countries) {
         if (!flagListDiv) return;
         flagListDiv.classList.remove('loading');
         flagListDiv.innerHTML = ''; // Clear loading message
         if (!countries || countries.length === 0) {
             flagListDiv.innerHTML = '<p class="text-gray-400 text-sm">No countries found.</p>';
             return;
         }

         // Add an "All" button
         const allButton = createFlagButton({ name: 'All Countries', iso_3166_1: '' });
         flagListDiv.appendChild(allButton);

         countries.forEach(country => {
             // Ensure country code exists and is 2 letters for the flag icon
             if (country && country.iso_3166_1 && country.iso_3166_1.length === 2 && country.stationcount > 0) {
                 const button = createFlagButton(country);
                 flagListDiv.appendChild(button);
             }
         });
     }

     function createFlagButton(country) {
         const button = document.createElement('button');
         const countryCode = country.iso_3166_1.toLowerCase();
         const countryName = country.name;
         button.className = 'flag-button flex-shrink-0 flex flex-col items-center gap-1 p-2 rounded-md hover:bg-gray-700 transition duration-150';
         button.dataset.countryCode = country.iso_3166_1; // Store original code if needed
         button.dataset.countryName = countryName; // Store name for setting dropdown

         if (countryCode) {
            // Use the flag-icon-css class
             button.innerHTML = `
                 <span class="fi fi-${countryCode} text-3xl rounded"></span>
                 <span class="text-xs text-gray-400 truncate max-w-[60px]">${countryName}</span>
             `;
             button.title = `${countryName} (${country.stationcount || 0})`;
         } else {
             // Style for "All Countries" button
             button.innerHTML = `
                 <span class="w-[30px] h-[22.5px] flex items-center justify-center bg-gray-600 rounded text-gray-300 text-xl">
                     <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-5 h-5">
                       <path d="M8.28 9.005a.75.75 0 1 0 0 1.5h3.44a.75.75 0 1 0 0-1.5H8.28Z" />
                       <path fill-rule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16ZM1.75 10a8.25 8.25 0 1 1 16.5 0 8.25 8.25 0 0 1-16.5 0Z" clip-rule="evenodd" />
                     </svg>
                 </span>
                 <span class="text-xs text-gray-300 font-medium">${countryName}</span>
             `;
             button.title = countryName;
         }

         button.addEventListener('click', () => {
             // Visually select the flag
             document.querySelectorAll('#flag-list button.selected').forEach(btn => {
                 btn.classList.remove('selected');
             });
             button.classList.add('selected');

             // Set filter and trigger search
             countryFilter.value = countryName === 'All Countries' ? '' : countryName;
             currentCountry = countryFilter.value; // Update state variable

             // Clear mood/genre selection? (Optional, depending on desired UX)
             // currentMoodTag = '';
             // document.querySelectorAll('#mood-list button.selected').forEach(btn => btn.classList.remove('selected'));
             // genreFilter.value = '';
             // currentGenre = '';
             // document.querySelectorAll('#genre-tags button.bg-indigo-500').forEach(btn => { /* deselect */ });

             handleSearchOrFilter();
         });
         return button;
     }

    function populateGenreTags(tags) {
         if (!genreTagsDiv) return;
         genreTagsDiv.classList.remove('loading');
         genreTagsDiv.innerHTML = ''; // Clear loading message
         if (!tags || tags.length === 0) {
             genreTagsDiv.innerHTML = '<p class="text-gray-400 text-sm">No genres found.</p>';
             return;
         }
         tags.forEach(tag => {
             if (tag && tag.name && tag.name.trim()) {
                 const button = document.createElement('button');
                 button.className = 'px-3 py-1 bg-gray-600 hover:bg-gray-500 text-gray-200 rounded-full text-sm transition duration-200 flex-shrink-0';
                 button.textContent = `${tag.name} (${tag.stationcount || 0})`;
                 button.dataset.tag = tag.name;
                 button.addEventListener('click', () => {
                     // Visually select the tag
                     document.querySelectorAll('#genre-tags button.bg-indigo-500').forEach(btn => {
                         btn.classList.remove('bg-indigo-500');
                         btn.classList.add('bg-gray-600', 'hover:bg-gray-500');
                     });
                     button.classList.remove('bg-gray-600', 'hover:bg-gray-500');
                     button.classList.add('bg-indigo-500');

                     // Clear mood selection when genre tag clicked
                     currentMoodTag = '';
                     document.querySelectorAll('#mood-list button.selected').forEach(btn => btn.classList.remove('selected'));

                     genreFilter.value = tag.name;
                     currentGenre = tag.name; // Update state variable
                     handleSearchOrFilter();
                 });
                 genreTagsDiv.appendChild(button);
             }
         });
     }

    // --- Pagination --- (Client-Side)
    function renderCurrentPage() {
        const startIndex = (currentPage - 1) * stationsPerPage;
        const endIndex = startIndex + stationsPerPage;
        const stationsToDisplay = currentStations.slice(startIndex, endIndex);

        displayStations(stationsToDisplay, stationListDiv);
        renderPaginationControls();
        highlightPlayingStation(); // Ensure playing state is reflected
    }

    function renderPaginationControls() {
        paginationDiv.innerHTML = '';
        const totalPages = Math.ceil(currentStations.length / stationsPerPage);

        if (totalPages <= 1) return;

        const createButton = (text, page, isDisabled = false, isCurrent = false) => {
            const button = document.createElement('button');
            button.innerHTML = text; // Allow HTML for icons
            button.disabled = isDisabled;
            button.className = `px-3 py-1 rounded text-sm transition duration-200 ${isCurrent ? 'bg-indigo-500 text-white cursor-default' : isDisabled ? 'bg-gray-700 text-gray-500 cursor-not-allowed' : 'bg-gray-600 hover:bg-indigo-500 text-gray-200'}`;
            if (!isDisabled && !isCurrent) {
                button.addEventListener('click', () => {
                    currentPage = page;
                    renderCurrentPage();
                     // Scroll to top of list
                     stationListSection.scrollIntoView({ behavior: 'smooth' });
                });
            }
            return button;
        };

        // Previous Button
        paginationDiv.appendChild(createButton('&laquo; Prev', currentPage - 1, currentPage === 1));

        // Page Numbers (simplified)
        let startPage = Math.max(1, currentPage - 2);
        let endPage = Math.min(totalPages, currentPage + 2);

        if (startPage > 1) {
             paginationDiv.appendChild(createButton('1', 1));
             if (startPage > 2) paginationDiv.appendChild(document.createTextNode('...'));
         }

        for (let i = startPage; i <= endPage; i++) {
            paginationDiv.appendChild(createButton(i.toString(), i, false, i === currentPage));
        }

         if (endPage < totalPages) {
             if (endPage < totalPages - 1) paginationDiv.appendChild(document.createTextNode('...'));
             paginationDiv.appendChild(createButton(totalPages.toString(), totalPages));
         }

        // Next Button
        paginationDiv.appendChild(createButton('Next &raquo;', currentPage + 1, currentPage === totalPages));
    }

    // --- Initial Load ---
    async function initializeApp() {
        // Ensure flagListDiv loading state is removed if filters fail
         try {
             await loadFilterOptions();
         } catch (error) {
             console.error("Failed to load filter options:", error);
             if (flagListDiv) flagListDiv.classList.remove('loading');
             if (genreTagsDiv) genreTagsDiv.classList.remove('loading');
             // Optionally display an error specific to filters
         }
        loadTopStations();
        await loadStations();
        isLoading = false;
    }

    // --- Event Listeners ---
    searchButton.addEventListener('click', handleSearchOrFilter);
    resetButton.addEventListener('click', resetSearchAndFilters);
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleSearchOrFilter();
    });
    genreFilter.addEventListener('change', handleSearchOrFilter);
    countryFilter.addEventListener('change', () => {
        // Deselect flag if dropdown changes
        document.querySelectorAll('#flag-list button.selected').forEach(btn => {
            btn.classList.remove('selected');
        });
         currentCountry = countryFilter.value;
         // Optionally clear mood/genre here too if desired
         handleSearchOrFilter();
    });
    languageFilter.addEventListener('change', () => {
        currentLanguage = languageFilter.value;
        // Optionally clear mood/genre here too if desired
        handleSearchOrFilter();
    });
    // Add listener for mood buttons
    if (moodListDiv) {
        moodListDiv.addEventListener('click', handleMoodSelection);
    }

    // Add placeholder image loading animation/style if needed
     document.head.insertAdjacentHTML('beforeend', `<style>
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        .animate-fade-in { animation: fadeIn 0.6s ease forwards; animation-delay: var(--animation-delay, 0s); }
        img[src=''] { background-color: #374151; /* gray-700 */ }
        /* Add styles for audio player controls if needed */
        #audio-player::-webkit-media-controls-panel { background-color: rgba(55, 65, 81, 0.8); /* gray-700 transparent */ color: #fff; }
        #audio-player::-webkit-media-controls-play-button { color: #fff; }
        /* Add more specific selectors if needed */
     </style>`);

    // --- Start App ---
    initializeApp();
    // Set initial default background
    updateBackgroundTheme(null);
}); 