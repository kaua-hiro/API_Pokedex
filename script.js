document.addEventListener('DOMContentLoaded', () => {
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

    let allPokemons = []; // Agora guarda a lista base (ou da geração ou do tipo)
    const POKEMONS_PER_PAGE = 24;
    let currentOffset = 0;
    let isLoading = false;

    const pokedexContainer = document.getElementById('pokedex');
    const modalContainer = document.getElementById('modal-container');
    const generationFilter = document.getElementById('generation-filter');
    const typeFilter = document.getElementById('type-filter');
    const searchInput = document.getElementById('search');
    const scrollTrigger = document.getElementById('scroll-trigger');

    // --- LÓGICA DE FETCH ---

    async function handleFilterChange() {
        const selectedGen = generationFilter.value;
        const selectedType = typeFilter.value;

        showLoader();
        pokedexContainer.innerHTML = '';
        allPokemons = [];

        if (selectedType) {
            // Se um tipo for selecionado, ele tem prioridade
            await fetchPokemonsByType(selectedType, selectedGen);
        } else {
            // Caso contrário, carrega a geração inteira
            await fetchAllPokemonsByGeneration(selectedGen);
        }
    }

    async function fetchAllPokemonsByGeneration(gen) {
        try {
            const { offset, limit } = GENERATIONS[gen];
            const url = `https://pokeapi.co/api/v2/pokemon?limit=${limit}&offset=${offset}`;
            const response = await fetch(url);
            const data = await response.json();
            allPokemons = data.results.map(p => ({ name: p.name, url: p.url }));
        } catch (error) {
            console.error("Falha ao carregar Pokémon por geração:", error);
            displayError("Não foi possível carregar os Pokémon.");
        }
        renderPokedex();
    }

    async function fetchPokemonsByType(type, gen) {
        try {
            const { offset, limit } = GENERATIONS[gen];
            const url = `https://pokeapi.co/api/v2/type/${type}`;
            const response = await fetch(url);
            const data = await response.json();
            
            // Filtra os Pokémon do tipo para pertencerem apenas à geração selecionada
            allPokemons = data.pokemon
                .map(p => {
                    const urlParts = p.pokemon.url.split('/');
                    const id = parseInt(urlParts[urlParts.length - 2]);
                    return { id, name: p.pokemon.name, url: p.pokemon.url };
                })
                .filter(p => p.id > offset && p.id <= offset + limit);

        } catch (error) {
            console.error("Falha ao carregar Pokémon por tipo:", error);
            displayError("Não foi possível carregar os Pokémon deste tipo.");
        }
        renderPokedex();
    }
    
    async function loadMorePokemons() {
        if (isLoading) return;
        isLoading = true;

        const pokemonsToLoad = getFilteredPokemons().slice(currentOffset, currentOffset + POKEMONS_PER_PAGE);
        if (pokemonsToLoad.length === 0) {
            isLoading = false;
            return;
        }

        const detailsPromises = pokemonsToLoad.map(p => fetch(p.url).then(res => res.json()));
        const pokemonDetails = await Promise.all(detailsPromises);

        const newCards = pokemonDetails.map(d => createPokemonCard({
            id: d.id,
            name: d.name,
            types: d.types.map(t => t.type.name),
            image: d.sprites.other['official-artwork']?.front_default || d.sprites.front_default,
            generation: getGenerationByID(d.id)
        }));

        newCards.forEach(card => pokedexContainer.appendChild(card));
        currentOffset += pokemonsToLoad.length;
        isLoading = false;
    }

    // --- LÓGICA DE RENDERIZAÇÃO E FILTROS ---
    
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
        pokedexContainer.innerHTML = '';
        currentOffset = 0;
        hideLoader();
        const filtered = getFilteredPokemons();
        if (filtered.length === 0) {
            displayError("Nenhum Pokémon encontrado com estes filtros.");
            return;
        }
        loadMorePokemons();
    }

    function getFilteredPokemons() {
        const searchTerm = searchInput.value.toLowerCase();
        if (!searchTerm) return allPokemons;

        return allPokemons.filter(pokemon => 
            pokemon.name.toLowerCase().includes(searchTerm)
        );
    }
    
    const observer = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && !isLoading) {
            loadMorePokemons();
        }
    }, { rootMargin: "0px 0px 400px 0px" });

    function init() {
        generationFilter.addEventListener('change', () => {
             updateHeaderTitle(generationFilter.value);
             handleFilterChange();
        });
        typeFilter.addEventListener('change', handleFilterChange);
        searchInput.addEventListener('input', renderPokedex);

        updateHeaderTitle(generationFilter.value);
        fetchAllPokemonsByGeneration(generationFilter.value);
        observer.observe(scrollTrigger);
    }
    
    init();

    async function showPokemonDetails(pokemonId) { try { const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemonId}`); if (!response.ok) throw new Error("Pokémon não encontrado"); const details = await response.json(); createDetailsModal(details); } catch (error) { console.error("Erro ao buscar detalhes do Pokémon:", error); } }
    function createDetailsModal(details) { const primaryType = details.types[0].type.name; modalContainer.innerHTML = `<div class="modal"><div class="modal-content type-${primaryType}"></div></div>`; const modalContent = modalContainer.querySelector('.modal-content'); modalContent.innerHTML = `<span class="modal-close-button">&times;</span><div class="modal-header"><h2 class="modal-pokemon-name">${details.name}</h2><span class="modal-pokemon-number">#${String(details.id).padStart(3, '0')}</span></div><div class="modal-body"><img class="modal-pokemon-image" src="${details.sprites.other['official-artwork']?.front_default || details.sprites.front_default}" alt="${details.name}"><div class="modal-pokemon-info"><div class="modal-pokemon-types">${details.types.map(t => `<span class="type ${t.type.name}">${t.type.name}</span>`).join('')}</div><div class="pokemon-stats">${details.stats.map(s => `<div class="stat-row"><span class="stat-name">${s.stat.name.replace(/-/g, ' ')}</span><div class="stat-bar-container"><div class="stat-bar" style="width: ${Math.min(s.base_stat, 150)}px;">${s.base_stat}</div></div></div>`).join('')}</div></div></div>`; modalContainer.classList.add('visible'); modalContainer.querySelector('.modal-close-button').addEventListener('click', closeModal); modalContainer.addEventListener('click', (e) => { if (e.target.classList.contains('modal')) closeModal(); }); }
    function closeModal() { modalContainer.classList.remove('visible'); }
    function updateHeaderTitle(gen) { document.querySelector('header h1').textContent = `Pokedex - ${GENERATIONS[gen].name}`; }
    function getGenerationByID(id) { for (const gen in GENERATIONS) { const { offset, limit } = GENERATIONS[gen]; if (id > offset && id <= offset + limit) return gen; } return '1'; }
    function showLoader() { pokedexContainer.innerHTML = '<div class="loader">A carregar Pokémon...</div>'; }
    function hideLoader() { const loader = pokedexContainer.querySelector('.loader'); if (loader) loader.remove(); }
    function displayError(message) { pokedexContainer.innerHTML = `<div class="error-message-inline">${message}</div>`; }
});