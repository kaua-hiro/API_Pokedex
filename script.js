// Configurações de gerações
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

let currentPokemons = [];

document.addEventListener('DOMContentLoaded', () => {
    initFilters();
    loadPokemonsByGeneration('1');
});

async function loadPokemonsByGeneration(gen) {
    showLoader();
    
    try {
        const { offset, limit } = GENERATIONS[gen];
        const url = `https://pokeapi.co/api/v2/pokemon?limit=${limit}&offset=${offset}`;
        await fetchPokemons(url);
        updateHeaderTitle(gen);
    } catch (error) {
        console.error("Erro ao carregar Pokémon:", error);
    } finally {
        hideLoader();
    }
}

function updateHeaderTitle(gen) {
    const header = document.querySelector('header h1');
    header.textContent = `Pokedex - ${GENERATIONS[gen].name}`;
}

async function fetchPokemons(url) {
    const response = await fetch(url);
    const data = await response.json();
    
    const pokemonDetails = await Promise.all(
        data.results.map(pokemon => fetch(pokemon.url).then(res => res.json()))
    );
    
    currentPokemons = pokemonDetails.map(details => ({
        id: details.id,
        name: details.name,
        types: details.types.map(type => type.type.name),
        image: details.sprites.other['official-artwork']?.front_default || details.sprites.front_default,
        generation: getGenerationByID(details.id)
    }));
    
    displayPokemons(currentPokemons);
}

function displayPokemons(pokemons) {
    const pokedex = document.getElementById('pokedex');
    pokedex.innerHTML = '';
    
    pokemons.forEach(pokemon => {
        const card = document.createElement('div');
        card.className = 'pokemon-card';
        card.innerHTML = `
            <img src="${pokemon.image}" alt="${pokemon.name}" loading="lazy">
            <div class="pokemon-number">#${pokemon.id.toString().padStart(3, '0')}</div>
            <div class="pokemon-name">${pokemon.name}</div>
            <div class="pokemon-types">
                ${pokemon.types.map(type => `<span class="type ${type}">${type}</span>`).join('')}
            </div>
            <div class="generation-badge">${GENERATIONS[pokemon.generation]?.name || 'Kanto'}</div>
        `;
        pokedex.appendChild(card);
    });
}

function initFilters() {
    // Filtro por geração
    document.getElementById('generation-filter').addEventListener('change', async (e) => {
        await loadPokemonsByGeneration(e.target.value);
    });
    
    // Filtro por tipo
    document.getElementById('type-filter').addEventListener('change', filterPokemons);
    
    // Barra de pesquisa
    document.getElementById('search').addEventListener('input', filterPokemons);
    
    // Ícone de pesquisa
    document.querySelector('.search-icon').addEventListener('click', filterPokemons);
}

function filterPokemons() {
    const type = document.getElementById('type-filter').value;
    const search = document.getElementById('search').value.toLowerCase();
    
    let filtered = [...currentPokemons];
    
    if (type) {
        filtered = filtered.filter(p => p.types.includes(type));
    }
    
    if (search) {
        filtered = filtered.filter(p => 
            p.name.toLowerCase().includes(search) || 
            p.id.toString().includes(search)
        );
    }
    
    displayPokemons(filtered);
}

function getGenerationByID(id) {
    for (const [gen, config] of Object.entries(GENERATIONS)) {
        if (id > config.offset && id <= config.offset + config.limit) {
            return gen;
        }
    }
    return '1';
}

function showLoader() {
    document.getElementById('pokedex').innerHTML = '<div class="loader">Carregando Pokémon...</div>';
}

function hideLoader() {
    const loader = document.querySelector('.loader');
    if (loader) loader.remove();
}