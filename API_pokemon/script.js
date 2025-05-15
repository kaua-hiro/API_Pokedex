/* // Faz a requisição para a API do PokeAPI
// e armazena os dados no array pokemons
// Adicione o evento de clique no botão de busca

async function buscarPokemons() {
  
    // Adicione este evento listener no final do seu script.js
    document
      .getElementById("type-filter")
      .addEventListener("change", function () {
        filterPokemonsByType(this.value);
      });

    // Função para filtrar Pokémon por tipo
    function filterPokemonsByType(type) {
      if (!type) {
        displayPokemons(pokemons);
        return;
      }

      const filteredPokemons = pokemons.filter((pokemon) =>
        pokemon.types.includes(type)
      );

      displayPokemons(filteredPokemons);
    }
    
// Adicione este evento listener no final da função buscarPokemons()
document.getElementById("generation-filter").addEventListener("change", function() {
    filterPokemonsByGeneration(this.value);
});

// Atualize a função searchPokemon para considerar também o filtro de geração
function searchPokemon() {
    const searchInput = document.getElementById("search").value.toLowerCase();
    const selectedType = document.getElementById("type-filter").value;
    const selectedGeneration = document.getElementById("generation-filter").value;

    let filteredPokemons = pokemons;

    // Aplicar filtro de tipo se houver um selecionado
    if (selectedType) {
        filteredPokemons = filteredPokemons.filter((pokemon) =>
            pokemon.types.includes(selectedType)
        );
    }

    // Aplicar filtro de geração se houver uma selecionada
    if (selectedGeneration) {
        filteredPokemons = filteredPokemons.filter((pokemon) =>
            pokemon.generation === selectedGeneration
        );
    }

    // Aplicar filtro de busca se houver texto
    if (searchInput !== "") {
        filteredPokemons = filteredPokemons.filter(
            (pokemon) =>
            pokemon.name.toLowerCase().includes(searchInput) ||
            pokemon.types.some((type) => type.includes(searchInput)) ||
            pokemon.id.toString().includes(searchInput)
        );
    }

    displayPokemons(filteredPokemons);
}

    // Atualiza a função searchPokemon para considerar também o filtro ativo
    function searchPokemon() {
      const searchInput = document.getElementById("search").value.toLowerCase();
      const selectedType = document.getElementById("type-filter").value;

      let filteredPokemons = pokemons;

      // Aplicar filtro de tipo se houver um selecionado
      if (selectedType) {
        filteredPokemons = filteredPokemons.filter((pokemon) =>
          pokemon.types.includes(selectedType)
        );
      }

      // Aplicar filtro de busca se houver texto
      if (searchInput !== "") {
        filteredPokemons = filteredPokemons.filter(
          (pokemon) =>
            pokemon.name.toLowerCase().includes(searchInput) ||
            pokemon.types.some((type) => type.includes(searchInput)) ||
            pokemon.id.toString().includes(searchInput)
        );
      }

      displayPokemons(filteredPokemons);
    }
    // Adicione este evento para o ícone de busca
    document
      .querySelector(".search-icon")
      .addEventListener("click", searchPokemon);
    const url = "https://pokeapi.co/api/v2/pokemon?limit=151&offset=0";

    // Adicione este evento para o campo de texto

    const pokemons = [];
    const response = await fetch(url);
    const data = await response.json();

    for (const pokemon of data.results) {
      const res = await fetch(pokemon.url);
      const details = await res.json();

      pokemons.push({
        id: details.id,
        name: details.name,
        types: details.types.map((type) => type.type.name),
        image: details.sprites.front_default,
      });
    }

    // Aqui você pode fazer algo com a lista `pokemons`, como exibir na tela
    displayPokemons(pokemons);
    // Função para criar um card de Pokémon
    function createPokemonCard(pokemon) {
      const card = document.createElement("div");
      card.className = "pokemon-card";

      // Formata o número do Pokémon com 3 dígitos
      const formattedId = pokemon.id.toString().padStart(3, "0");

      card.innerHTML = `
        <img src="${pokemon.image}" alt="${
        pokemon.name
      }" width="96" height="96">
        <div class="pokemon-number">#${formattedId}</div>
        <div class="pokemon-name">${pokemon.name}</div>
        <div class="pokemon-types">
            ${pokemon.types
              .map((type) => `<span class="type ${type}">${type}</span>`)
              .join("")}
        </div>
    `;

      return card;
    }

    // Função para exibir todos os Pokémon
    function displayPokemons(pokemonList) {
      const pokedexContainer = document.getElementById("pokedex");
      pokedexContainer.innerHTML = "";
      // Ordena os Pokémon por número
      const sortedPokemons = [...pokemonList].sort((a, b) => a.id - b.id);

      sortedPokemons.forEach((pokemon) => {
        const card = createPokemonCard(pokemon);
        pokedexContainer.appendChild(card);
      });
    }

    // Função para buscar Pokémon
    function searchPokemon() {
      const searchInput = document.getElementById("search").value.toLowerCase();

      if (searchInput === "") {
        displayPokemons(pokemons);
        return;
      }

      // Filtra os Pokémon com base na busca
      const filteredPokemons = pokemons.filter(
        (pokemon) =>
          pokemon.name.toLowerCase().includes(searchInput) ||
          pokemon.id.toString().includes(searchInput)
      );
      displayPokemons(filteredPokemons);
    }

    // Adiciona evento de clique no botão de busca e no campo de texto
    document.getElementById("search").addEventListener("keyup", (e) => {
      searchPokemon();
    });
  }
buscarPokemons();
 */

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
    // Carrega a primeira geração por padrão
    loadPokemonsByGeneration('1');
});

async function loadPokemonsByGeneration(gen) {
    showLoader();
    
    try {
        const { offset, limit } = GENERATIONS[gen];
        const url = `https://pokeapi.co/api/v2/pokemon?limit=${limit}&offset=${offset}`;
        await fetchPokemons(url);
    } catch (error) {
        console.error("Erro ao carregar Pokémon:", error);
    } finally {
        hideLoader();
    }
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