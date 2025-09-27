document.addEventListener('DOMContentLoaded', () => {
    // --- CONFIGURAÇÕES E VARIÁVEIS GLOBAIS ---
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

    let allPokemons = []; // Guarda a lista base (da geração/tipo) para a pesquisa ao vivo
    let displayedPokemons = []; // Guarda os Pokémon que estão a ser exibidos
    const POKEMONS_PER_PAGE = 24;
    let currentOffset = 0;
    let isLoading = false;
    let isSearchingGlobal = false; // Flag para a pesquisa global

    // --- ELEMENTOS DO DOM ---
    const pokedexContainer = document.getElementById('pokedex');
    const modalContainer = document.getElementById('modal-container');
    const generationFilter = document.getElementById('generation-filter');
    const typeFilter = document.getElementById('type-filter');
    const searchInput = document.getElementById('search');
    const searchIcon = document.querySelector('.search-icon');
    const scrollTrigger = document.getElementById('scroll-trigger');
    const themeToggleButton = document.getElementById('theme-toggle');

    // --- LÓGICA DE FETCH ---
    async function handleFilterChange() {
        isSearchingGlobal = false; // Garante que saímos do modo de pesquisa global
        showLoader();
        allPokemons = [];
        const selectedGen = generationFilter.value;
        const selectedType = typeFilter.value;

        try {
            if (selectedType) {
                await fetchPokemonsByType(selectedType, selectedGen);
            } else {
                await fetchAllPokemonsByGeneration(selectedGen);
            }
        } catch (error) {
            console.error("Falha ao carregar Pokémon:", error);
            displayError("Não foi possível carregar os Pokémon.");
        }
    }

    async function fetchAllPokemonsByGeneration(gen) {
        const { offset, limit } = GENERATIONS[gen];
        const url = `https://pokeapi.co/api/v2/pokemon?limit=${limit}&offset=${offset}`;
        const response = await fetch(url);
        const data = await response.json();
        allPokemons = data.results.map(p => ({ name: p.name, url: p.url }));
        renderPokedex();
    }

    async function fetchPokemonsByType(type, gen) {
        const { offset, limit } = GENERATIONS[gen];
        const url = `https://pokeapi.co/api/v2/type/${type}`;
        const response = await fetch(url);
        const data = await response.json();
        
        allPokemons = data.pokemon
            .map(p => {
                const urlParts = p.pokemon.url.split('/');
                const id = parseInt(urlParts[urlParts.length - 2]);
                return { id, name: p.pokemon.name, url: p.pokemon.url };
            })
            .filter(p => p.id > offset && p.id <= offset + limit);
        renderPokedex();
    }
    
    async function searchGlobalPokemon(name) {
        if (isLoading) return;
        isSearchingGlobal = true;
        isLoading = true;
        showLoader();
        try {
            const speciesResponse = await fetch(`https://pokeapi.co/api/v2/pokemon-species/${name.toLowerCase()}`);
            if (!speciesResponse.ok) throw new Error('Espécie de Pokémon não encontrada');
            const speciesData = await speciesResponse.json();

            const pokemonUrl = speciesData.varieties.find(v => v.is_default).pokemon.url;
            const response = await fetch(pokemonUrl);
            if (!response.ok) throw new Error('Detalhes do Pokémon não encontrados');
            const d = await response.json();

            const foundPokemon = {
                id: d.id,
                name: d.name,
                types: d.types.map(t => t.type.name),
                image: d.sprites.other['official-artwork']?.front_default || d.sprites.front_default,
                generation: getGenerationByID(d.id)
            };
            
            pokedexContainer.innerHTML = '';
            pokedexContainer.appendChild(createPokemonCard(foundPokemon));
            
        } catch (error) {
            displayError(`Pokémon "${name}" não encontrado.`);
        } finally {
            isLoading = false;
        }
    }

    // --- RENDERIZAÇÃO E SCROLL INFINITO ---
    async function loadMorePokemons() {
        if (isLoading || isSearchingGlobal) return;
        isLoading = true;

        const pokemonsToLoad = displayedPokemons.slice(currentOffset, currentOffset + POKEMONS_PER_PAGE);
        if (pokemonsToLoad.length === 0) {
            isLoading = false;
            if (currentOffset === 0) displayError("Nenhum Pokémon encontrado com estes filtros.");
            return;
        }

        const detailsPromises = pokemonsToLoad.map(p => fetch(p.url).then(res => res.json()));
        const pokemonDetails = await Promise.all(detailsPromises);

        if (currentOffset === 0) {
            pokedexContainer.innerHTML = '';
        }
        
        pokemonDetails.forEach(d => {
            const card = createPokemonCard({
                id: d.id, name: d.name, types: d.types.map(t => t.type.name),
                image: d.sprites.other['official-artwork']?.front_default || d.sprites.front_default,
                generation: getGenerationByID(d.id)
            });
            pokedexContainer.appendChild(card);
        });

        currentOffset += pokemonsToLoad.length;
        isLoading = false;
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
            <div class="generation-badge">${GENERATIONS[pokemon.generation]?.name || 'Kanto'}</div>
        `;
        card.addEventListener('click', () => showPokemonDetails(pokemon.id));
        return card;
    }

    function renderPokedex() {
        currentOffset = 0;
        const searchTerm = searchInput.value.toLowerCase().trim();
        displayedPokemons = !searchTerm ? allPokemons : allPokemons.filter(p => p.name.toLowerCase().includes(searchTerm));
        
        pokedexContainer.innerHTML = '';
        loadMorePokemons();
    }
    
    // --- INICIALIZAÇÃO E LISTENERS ---
    const observer = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && !isLoading && !isSearchingGlobal) {
            loadMorePokemons();
        }
    }, { rootMargin: "0px 0px 400px 0px" });

    function init() {
        setupTheme();
        
        const resetAndBrowse = () => {
            searchInput.value = '';
            handleFilterChange();
        };
        generationFilter.addEventListener('change', resetAndBrowse);
        typeFilter.addEventListener('change', resetAndBrowse);

        // *** LÓGICA DE BUSCA CORRIGIDA ***
        // A busca por digitação (input) agora apenas filtra a lista local, de forma instantânea.
        searchInput.addEventListener('input', () => {
            isSearchingGlobal = false; 
            renderPokedex(); 
        });

        // A busca global (API) só é acionada com 'Enter' ou clique no ícone.
        const triggerGlobalSearch = () => {
            const searchTerm = searchInput.value.trim();
            if (searchTerm.length > 2) {
                searchGlobalPokemon(searchTerm);
            }
        };
        searchIcon.addEventListener('click', triggerGlobalSearch);
        searchInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                triggerGlobalSearch();
            }
        });

        updateHeaderTitle(generationFilter.value);
        handleFilterChange();
        observer.observe(scrollTrigger);
    }
    
    init();

    // --- FUNÇÕES DO MODAL, TEMA E UTILITÁRIAS ---
    function setupTheme() { const currentTheme = localStorage.getItem('theme') || 'dark'; document.documentElement.setAttribute('data-theme', currentTheme); themeToggleButton.innerHTML = currentTheme === 'light' ? '🌙' : '☀️'; themeToggleButton.addEventListener('click', () => { let newTheme = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark'; document.documentElement.setAttribute('data-theme', newTheme); localStorage.setItem('theme', newTheme); themeToggleButton.innerHTML = newTheme === 'light' ? '🌙' : '☀️'; }); }
    async function showPokemonDetails(pokemonId) { try { const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemonId}`); if (!response.ok) throw new Error("Pokémon não encontrado"); const details = await response.json(); createDetailsModal(details); } catch (error) { console.error("Erro ao buscar detalhes do Pokémon:", error); } }
    function createDetailsModal(details) { const primaryType = details.types[0].type.name; modalContainer.innerHTML = `<div class="modal"><div class="modal-content type-${primaryType}"></div></div>`; const modalContent = modalContainer.querySelector('.modal-content'); modalContent.innerHTML = `<span class="modal-close-button">&times;</span><div class="modal-header"><h2 class="modal-pokemon-name">${details.name}</h2><span class="modal-pokemon-number">#${String(details.id).padStart(3, '0')}</span></div><div class="modal-body"><img class="modal-pokemon-image" src="${details.sprites.other['official-artwork']?.front_default || d.sprites.front_default}" alt="${details.name}"><div class="modal-pokemon-info"><div class="modal-pokemon-types">${details.types.map(t => `<span class="type ${t.type.name}">${t.type.name}</span>`).join('')}</div><div class="pokemon-stats">${details.stats.map(s => `<div class="stat-row"><span class="stat-name">${s.stat.name.replace(/-/g, ' ')}</span><div class="stat-bar-container"><div class="stat-bar" style="width: ${Math.min(s.base_stat, 150)}px;">${s.base_stat}</div></div></div>`).join('')}</div></div></div>`; modalContainer.classList.add('visible'); modalContainer.querySelector('.modal-close-button').addEventListener('click', closeModal); modalContainer.addEventListener('click', (e) => { if (e.target.classList.contains('modal')) closeModal(); }); }
    function closeModal() { modalContainer.classList.remove('visible'); }
    function updateHeaderTitle(gen) { document.querySelector('header h1').textContent = `Pokedex - ${GENERATIONS[gen].name}`; }
    function getGenerationByID(id) { for (const gen in GENERATIONS) { const { offset, limit } = GENERATIONS[gen]; if (id > offset && id <= offset + limit) return gen; } return '1'; }
    
    // *** SKELETON LOADER REMOVIDO ***
    // Substituído por uma mensagem de texto simples.
    function showLoader() { 
        pokedexContainer.innerHTML = '<div class="loader">Carregando Pokémon...</div>'; 
    }

    function displayError(message) { pokedexContainer.innerHTML = `<div class="error-message-inline">${message}</div>`; }
});