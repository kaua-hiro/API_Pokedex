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
const modalContainer = document.getElementById('modal-container');

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
        displayError("Não foi possível carregar os Pokémon. Verifique sua conexão.");
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

    if (pokemons.length === 0) {
        displayError("Nenhum Pokémon encontrado com os filtros aplicados.");
        return;
    }
    
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
        // Adiciona o evento de clique para abrir o modal de detalhes
        card.addEventListener('click', () => showPokemonDetails(pokemon.id));
        pokedex.appendChild(card);
    });
}

function initFilters() {
    document.getElementById('generation-filter').addEventListener('change', (e) => {
        loadPokemonsByGeneration(e.target.value);
    });
    document.getElementById('type-filter').addEventListener('change', filterPokemons);
    document.getElementById('search').addEventListener('input', filterPokemons);
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

// --- NOVAS FUNÇÕES PARA O MODAL DE DETALHES ---

async function showPokemonDetails(pokemonId) {
    try {
        const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemonId}`);
        const details = await response.json();
        createDetailsModal(details);
    } catch (error) {
        console.error("Erro ao buscar detalhes do Pokémon:", error);
    }
}

function createDetailsModal(details) {
    modalContainer.innerHTML = ''; // Limpa modal anterior

    const primaryType = details.types[0].type.name;

    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content type-${primaryType}">
            <span class="modal-close-button">&times;</span>
            <div class="modal-header">
                <h2 class="modal-pokemon-name">${details.name}</h2>
                <span class="modal-pokemon-number">#${details.id.toString().padStart(3, '0')}</span>
            </div>
            <div class="modal-body">
                <img class="modal-pokemon-image" src="${details.sprites.other['official-artwork']?.front_default || details.sprites.front_default}" alt="${details.name}">
                <div class="modal-pokemon-info">
                    <div class="modal-pokemon-types">
                        ${details.types.map(t => `<span class="type ${t.type.name}">${t.type.name}</span>`).join('')}
                    </div>
                    <div class="pokemon-stats">
                        ${details.stats.map(s => `
                            <div class="stat-row">
                                <span class="stat-name">${s.stat.name.replace(/-/g, ' ').split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}</span>
                                <div class="stat-bar-container">
                                    <div class="stat-bar" style="width: ${Math.min(s.base_stat, 150)}px;">${s.base_stat}</div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        </div>
    `;

    modalContainer.appendChild(modal);
    modalContainer.classList.add('visible');

    // Eventos para fechar o modal
    modal.querySelector('.modal-close-button').addEventListener('click', closeModal);
    modalContainer.addEventListener('click', (e) => {
        if (e.target === modalContainer) {
            closeModal();
        }
    });
}

function closeModal() {
    modalContainer.classList.remove('visible');
    setTimeout(() => {
        modalContainer.innerHTML = '';
    }, 300); // Aguarda a animação de fade-out
}

// --- FUNÇÕES UTILITÁRIAS ---

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

function displayError(message) {
     document.getElementById('pokedex').innerHTML = `<div class="error-message-inline">${message}</div>`;
}