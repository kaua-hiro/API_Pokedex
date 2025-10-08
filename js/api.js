import { GENERATIONS } from './constants.js'; // Importa as constantes

async function fetchPokemonDetails(url) {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Falha ao buscar detalhes em ${url}`);
    return await response.json();
}

export async function fetchAllPokemonsByGeneration(gen) {
    const { offset, limit } = GENERATIONS[gen];
    const url = `https://pokeapi.co/api/v2/pokemon?limit=${limit}&offset=${offset}`;
    const response = await fetch(url);
    const data = await response.json();
    return data.results.map(p => ({ name: p.name, url: p.url }));
}

export async function fetchAllPokemons() {
    const url = `https://pokeapi.co/api/v2/pokemon?limit=1302`; 
    const response = await fetch(url);
    const data = await response.json();
    return data.results.map(p => ({ name: p.name, url: p.url }));
}

export async function fetchPokemonsByType(type, gen) {
    const { offset, limit } = GENERATIONS[gen];
    const url = `https://pokeapi.co/api/v2/type/${type}`;
    const response = await fetch(url);
    const data = await response.json();
    
    return data.pokemon
        .map(p => {
            const urlParts = p.pokemon.url.split('/');
            const id = parseInt(urlParts[urlParts.length - 2]);
            return { id, name: p.pokemon.name, url: p.pokemon.url };
        })
        .filter(p => p.id > offset && p.id <= offset + limit);
}

export async function searchGlobalPokemon(name) {
    const speciesResponse = await fetch(`https://pokeapi.co/api/v2/pokemon-species/${name.toLowerCase()}`);
    if (!speciesResponse.ok) throw new Error('Espécie de Pokémon não encontrada');
    const speciesData = await speciesResponse.json();
    const pokemonUrl = speciesData.varieties.find(v => v.is_default).pokemon.url;
    return await fetchPokemonDetails(pokemonUrl);
}

export async function fetchDetailsForModal(pokemonId) {
    const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemonId}`);
    if (!response.ok) throw new Error("Pokémon não encontrado");
    return await response.json();
}

export function getGenerationByID(id) {
    for (const gen in GENERATIONS) {
        const { offset, limit } = GENERATIONS[gen];
        if (id > offset && id <= offset + limit) return gen;
    }
    return '1';
}

export { fetchPokemonDetails };