import { GENERATIONS } from './constants.js';

const API_BASE = 'https://pokeapi.co/api/v2';
const TOTAL_POKEMON_COUNT = Object.values(GENERATIONS)
    .reduce((max, { offset, limit }) => Math.max(max, offset + limit), 0);

async function fetchJson(url, notFoundMessage) {
    let response;
    try {
        response = await fetch(url);
    } catch {
        throw new Error('Sem conexão com a internet. Verifique sua rede e tente novamente.');
    }
    if (!response.ok) {
        throw new Error(notFoundMessage || `Falha ao buscar dados (HTTP ${response.status}).`);
    }
    return response.json();
}

export async function fetchPokemonDetails(url) {
    return fetchJson(url, 'Não foi possível carregar os detalhes deste Pokémon.');
}

export async function fetchAllPokemonsByGeneration(gen) {
    const { offset, limit } = GENERATIONS[gen];
    const url = `${API_BASE}/pokemon?limit=${limit}&offset=${offset}`;
    const data = await fetchJson(url, 'Não foi possível carregar esta geração.');
    return data.results.map((p) => ({ name: p.name, url: p.url }));
}

export async function fetchAllPokemons() {
    const url = `${API_BASE}/pokemon?limit=${TOTAL_POKEMON_COUNT}`;
    const data = await fetchJson(url, 'Não foi possível carregar a lista de Pokémon.');
    return data.results.map((p) => ({ name: p.name, url: p.url }));
}

export async function fetchPokemonsByType(type, gen) {
    const { offset, limit } = GENERATIONS[gen];
    const url = `${API_BASE}/type/${type}`;
    const data = await fetchJson(url, 'Não foi possível carregar este tipo de Pokémon.');

    return data.pokemon
        .map((p) => {
            const urlParts = p.pokemon.url.split('/');
            const id = parseInt(urlParts[urlParts.length - 2], 10);
            return { id, name: p.pokemon.name, url: p.pokemon.url };
        })
        .filter((p) => p.id > offset && p.id <= offset + limit);
}

export async function searchGlobalPokemon(name) {
    const speciesData = await fetchJson(
        `${API_BASE}/pokemon-species/${name.toLowerCase()}`,
        `Pokémon "${name}" não encontrado.`,
    );
    const defaultVariety = speciesData.varieties.find((v) => v.is_default);
    if (!defaultVariety) {
        throw new Error(`Pokémon "${name}" não encontrado.`);
    }
    return fetchPokemonDetails(defaultVariety.pokemon.url);
}

export async function fetchDetailsForModal(pokemonId) {
    return fetchJson(`${API_BASE}/pokemon/${pokemonId}`, 'Pokémon não encontrado.');
}

export function getGenerationByID(id) {
    for (const gen in GENERATIONS) {
        const { offset, limit } = GENERATIONS[gen];
        if (id > offset && id <= offset + limit) return gen;
    }
    return '1';
}
