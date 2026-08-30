import { GENERATIONS } from './constants.js';

const API_BASE = 'https://pokeapi.co/api/v2';
const TOTAL_POKEMON_COUNT = Object.values(GENERATIONS)
    .reduce((max, { offset, limit }) => Math.max(max, offset + limit), 0);

async function fetchJson(url, notFoundMessage) {
    let response;
    try {
        response = await fetch(url);
    } catch {
        throw new Error('SINAL PERDIDO — verifique sua conexão e escaneie novamente.');
    }
    if (!response.ok) {
        throw new Error(notFoundMessage || `FALHA NA LEITURA (HTTP ${response.status}).`);
    }
    return response.json();
}

export async function fetchPokemonDetails(url) {
    return fetchJson(url, 'FALHA AO LER OS DADOS deste espécime.');
}

export async function fetchAllPokemonsByGeneration(gen) {
    const { offset, limit } = GENERATIONS[gen];
    const url = `${API_BASE}/pokemon?limit=${limit}&offset=${offset}`;
    const data = await fetchJson(url, 'FALHA AO CARREGAR esta geração.');
    return data.results.map((p) => ({ name: p.name, url: p.url }));
}

export async function fetchAllPokemons() {
    const url = `${API_BASE}/pokemon?limit=${TOTAL_POKEMON_COUNT}`;
    const data = await fetchJson(url, 'FALHA AO CARREGAR a base de dados.');
    return data.results.map((p) => ({ name: p.name, url: p.url }));
}

export async function fetchPokemonsByType(type, gen) {
    const { offset, limit } = GENERATIONS[gen];
    const url = `${API_BASE}/type/${type}`;
    const data = await fetchJson(url, 'FALHA AO FILTRAR por esse tipo.');

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
        `ESPÉCIME "${name}" NÃO ENCONTRADO.`,
    );
    const defaultVariety = speciesData.varieties.find((v) => v.is_default);
    if (!defaultVariety) {
        throw new Error(`ESPÉCIME "${name}" NÃO ENCONTRADO.`);
    }
    return fetchPokemonDetails(defaultVariety.pokemon.url);
}

export async function fetchDetailsForModal(pokemonId) {
    return fetchJson(`${API_BASE}/pokemon/${pokemonId}`, 'ESPÉCIME NÃO ENCONTRADO.');
}

export async function fetchPokemonSpecies(pokemonId) {
    return fetchJson(`${API_BASE}/pokemon-species/${pokemonId}`, 'DESCRIÇÃO NÃO ENCONTRADA.');
}

/** PokeAPI has no Portuguese flavor text at all — only en/fr/de/es/it/ja/ko/zh. */
export function getEnglishFlavorText(speciesData) {
    const entry = speciesData.flavor_text_entries.find((e) => e.language.name === 'en');
    if (!entry) return '';
    return entry.flavor_text.replace(/[\n\f\r]+/g, ' ').replace(/\s+/g, ' ').trim();
}

const TRANSLATE_ENDPOINT = 'https://api.mymemory.translated.net/get';

/** Best-effort machine translation via a free public API. Never throws —
 * callers get null on failure and fall back to English-only. */
export async function translateToPortuguese(text) {
    if (!text) return null;
    const url = `${TRANSLATE_ENDPOINT}?q=${encodeURIComponent(text)}&langpair=en|pt-BR`;
    try {
        const response = await fetch(url);
        if (!response.ok) return null;
        const data = await response.json();
        const translated = data?.responseData?.translatedText;
        const looksLikeApiError = !translated || /QUERY LENGTH LIMIT|INVALID|MYMEMORY WARNING/i.test(translated);
        return looksLikeApiError ? null : translated;
    } catch {
        return null;
    }
}

export function getGenerationByID(id) {
    for (const gen in GENERATIONS) {
        const { offset, limit } = GENERATIONS[gen];
        if (id > offset && id <= offset + limit) return gen;
    }
    return '1';
}
