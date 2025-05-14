// Faz a requisição para a API do PokeAPI
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
    const url = "https://pokeapi.co/api/v2/pokemon?limit=151";
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
