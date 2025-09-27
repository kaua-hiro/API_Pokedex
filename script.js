document.addEventListener('DOMContentLoaded', () => {
    // --- 1. CONSTANTES E VARIÁVEIS DE ESTADO ---
    const GENERATIONS = {
        1: { name: "Kanto", limit: 151, offset: 0 },
        2: { name: "Johto", limit: 100, offset: 151 },
        3: { name: "Hoenn", limit: 135, offset: 251 },
        4: { name: "Sinnoh", limit: 107, offset: 386 },
        5: { name: "Unova", limit: 156, offset: 493 },
        6: { name: "Kalos", limit: 72, offset: 649 },
        7: { name: "Alola", limit: 88, offset: 721 },
        8: { name: "Galar", limit: 96, offset: 809 },
        9: { name: "Paldea", limit: 110, offset: 905 }
    };
    let masterPokemonList = [];
    let typeCache = {};
    let searchDebounceTimeout;
    let isMasterListLoaded = false;

    // --- 2. ELEMENTOS DO DOM ---
    const pokedexContainer = document.getElementById('pokedex');
    const modalContainer = document.getElementById('modal-container');
    const generationFilter = document.getElementById('generation-filter');
    const typeFilter = document.getElementById('type-filter');
    const searchInput = document.getElementById('search');
    const themeToggleButton = document.getElementById('theme-toggle');

    // --- 3. FUNÇÕES AUXILIARES (MOVİDAS PARA O TOPO PARA CORRIGIR O ERRO) ---
    const setFiltersDisabled = (disabled) => {
        searchInput.disabled = disabled;
        typeFilter.disabled = disabled;
        generationFilter.disabled = disabled;
    };

    const getGenerationByID = (id) => {
        for (const gen in GENERATIONS) {
            const { offset, limit } = GENERATIONS[gen];
            if (id > offset && id <= offset + limit) return gen;
        }
        return null;
    };

    const formatPokemonData = (details) => ({
        id: details.id,
        name: details.name,
        types: details.types.map(t => t.type.name),
        image: details.sprites.other['official-artwork']?.front_default || details.sprites.front_default
    });

    function showLoader(message = 'Carregando...') {
        pokedexContainer.innerHTML = `<div class="loader">${message}</div>`;
    }

    function displayError(message) {
        pokedexContainer.innerHTML = `<div class="error-message-inline">${message}</div>`;
    }

    // --- 4. LÓGICA PRINCIPAL ---

    // Carrega os primeiros 24 Pokémon para uma visualização inicial rápida
    async function loadInitialPokemon() {
        showLoader("Carregando Pokémon...");
        try {
            const response = await fetch('https://pokeapi.co/api/v2/pokemon?limit=24');
            const data = await response.json();
            const detailPromises = data.results.map(p => fetch(p.url).then(res => res.json()));
            const pokemonDetails = await Promise.all(detailPromises);
            renderCards(pokemonDetails);
        } catch (error) {
            displayError("Não foi possível carregar. Verifique sua conexão.");
        }
    }

    // Carrega a lista completa de nomes em segundo plano para a busca
    async function loadMasterListInBackground() {
        try {
            const response = await fetch('https://pokeapi.co/api/v2/pokemon?limit=1302');
            const data = await response.json();
            masterPokemonList = data.results.map(p => {
                const urlParts = p.url.split('/');
                const id = parseInt(urlParts[urlParts.length - 2]);
                return { name: p.name, url: p.url, id };
            });
            isMasterListLoaded = true;
        } catch (error) {
            console.error("Falha ao carregar a lista completa em segundo plano:", error);
        }
    }
    
    // Busca dados de um tipo específico e armazena em cache
    async function fetchAndCacheTypeData(typeName) {
        if (typeCache[typeName]) return typeCache[typeName];
        const response = await fetch(`https://pokeapi.co/api/v2/type/${typeName}`);
        const data = await response.json();
        const pokemonNames = new Set(data.pokemon.map(p => p.pokemon.name));
        typeCache[typeName] = pokemonNames;
        return pokemonNames;
    }

    // Função central que lida com a busca e filtragem
    async function handleSearchAndFilter() {
        const searchTerm = searchInput.value.toLowerCase().trim();
        const selectedGen = generationFilter.value;
        const selectedType = typeFilter.value;

        // Se não há filtros ou busca, e a página já carregou, não faz nada.
        if (!searchTerm && selectedGen === 'all' && !selectedType) {
            // Poderia recarregar os iniciais, mas vamos deixar como está por enquanto.
            return;
        }

        if (!isMasterListLoaded) {
            showLoader("Aguarde, preparando a busca...");
            return;
        }

        let filteredResults = masterPokemonList;

        if (searchTerm) {
            filteredResults = filteredResults.filter(p => p.name.includes(searchTerm));
        }
        if (selectedGen !== 'all') {
            filteredResults = filteredResults.filter(p => getGenerationByID(p.id) === selectedGen);
        }
        if (selectedType) {
            showLoader(`Filtrando por tipo ${selectedType}...`);
            const typePokemonNames = await fetchAndCacheTypeData(selectedType);
            filteredResults = filteredResults.filter(p => typePokemonNames.has(p.name));
        }

        if (filteredResults.length === 0) {
            displayError("Nenhum Pokémon corresponde aos filtros.");
            return;
        }

        const resultsToDisplay = filteredResults.slice(0, 24);
        showLoader("Carregando resultados...");

        try {
            const detailPromises = resultsToDisplay.map(p => fetch(p.url).then(res => res.json()));
            const pokemonDetails = await Promise.all(detailPromises);
            renderCards(pokemonDetails);
        } catch (error) {
            displayError("Ocorreu um erro ao carregar os Pokémon.");
        }
    }

    // --- 5. RENDERIZAÇÃO ---
    function renderCards(pokemonArray) {
        pokedexContainer.innerHTML = '';
        pokemonArray.forEach(details => {
            const pokemon = formatPokemonData(details);
            const card = createPokemonCard(pokemon);
            pokedexContainer.appendChild(card);
        });
    }

    function createPokemonCard(pokemon) {
        const card = document.createElement('div');
        card.className = 'pokemon-card';
        card.innerHTML = `
            <img src="${pokemon.image}" alt="${pokemon.name}" loading="lazy">
            <div class="pokemon-number">#${String(pokemon.id).padStart(3, '0')}</div>
            <div class="pokemon-name">${pokemon.name}</div>
            <div class="pokemon-types">
                ${pokemon.types.map(type => `<span class="type ${type}">${type}</span>`).join('')}
            </div>
        `;
        card.addEventListener('click', () => showPokemonDetails(pokemon.id));
        return card;
    }

    // --- 6. EVENTOS E INICIALIZAÇÃO ---
    function onFilterChange() {
        clearTimeout(searchDebounceTimeout);
        searchDebounceTimeout = setTimeout(() => {
            handleSearchAndFilter();
        }, 400);
    }

    async function init() {
        setupTheme();
        setFiltersDisabled(true);
        await loadInitialPokemon();
        await loadMasterListInBackground();
        setFiltersDisabled(false);

        searchInput.addEventListener('input', onFilterChange);
        generationFilter.addEventListener('change', onFilterChange);
        typeFilter.addEventListener('change', onFilterChange);
    }

    init();

    // --- 7. MODAL E OUTROS ---
    setupTheme();
    async function showPokemonDetails(pokemonId) { try { const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemonId}`); if (!response.ok) throw new Error("Pokémon não encontrado"); const details = await response.json(); createDetailsModal(details); } catch (error) { console.error("Erro ao buscar detalhes do Pokémon:", error); } }
    function createDetailsModal(details) { const primaryType = details.types[0].type.name; modalContainer.innerHTML = `<div class="modal"><div class="modal-content type-${primaryType}"></div></div>`; const modalContent = modalContainer.querySelector('.modal-content'); modalContent.innerHTML = `<span class="modal-close-button">&times;</span><div class="modal-header"><h2 class="modal-pokemon-name">${details.name}</h2><span class="modal-pokemon-number">#${String(details.id).padStart(3, '0')}</span></div><div class="modal-body"><img class="modal-pokemon-image" src="${details.sprites.other['official-artwork']?.front_default || details.sprites.front_default}" alt="${details.name}"><div class="modal-pokemon-info"><div class="modal-pokemon-types">${details.types.map(t => `<span class="type ${t.type.name}">${t.type.name}</span>`).join('')}</div><div class="pokemon-stats">${details.stats.map(s => `<div class="stat-row"><span class="stat-name">${s.stat.name.replace(/-/g, ' ')}</span><div class="stat-bar-container"><div class="stat-bar" style="width: ${Math.min(s.base_stat, 150)}px;">${s.base_stat}</div></div></div>`).join('')}</div></div></div>`; modalContainer.classList.add('visible'); modalContainer.querySelector('.modal-close-button').addEventListener('click', closeModal); modalContainer.addEventListener('click', (e) => { if (e.target.classList.contains('modal')) closeModal(); }); }
    function closeModal() { modalContainer.classList.remove('visible'); }
    function setupTheme() { const currentTheme = localStorage.getItem('theme') || 'dark'; document.documentElement.setAttribute('data-theme', currentTheme); themeToggleButton.innerHTML = currentTheme === 'light' ? '🌙' : '☀️'; themeToggleButton.addEventListener('click', () => { let newTheme = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark'; document.documentElement.setAttribute('data-theme', newTheme); localStorage.setItem('theme', newTheme); themeToggleButton.innerHTML = newTheme === 'light' ? '🌙' : '☀️'; }); }
});