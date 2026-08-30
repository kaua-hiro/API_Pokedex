import {
    fetchAllPokemons,
    fetchAllPokemonsByGeneration,
    fetchPokemonsByType,
    searchGlobalPokemon,
    fetchDetailsForModal,
    fetchPokemonDetails,
} from './api.js';
import {
    createPokemonCard,
    createDetailsModal,
    showLoader,
    displayError,
    updateHeaderTitle,
    setupTheme,
} from './ui.js';
import { POKEMONS_PER_PAGE } from './constants.js';
import {
    state,
    setAllPokemons,
    resetOffset,
    incrementOffset,
    setLoading,
    setSearchingGlobal,
} from './state.js';

const SEARCH_DEBOUNCE_MS = 300;
const MIN_GLOBAL_SEARCH_LENGTH = 3;

document.addEventListener('DOMContentLoaded', () => {
    let debounceTimeout;

    const pokedexContainer = document.getElementById('pokedex');
    const modalContainer = document.getElementById('modal-container');
    const generationFilter = document.getElementById('generation-filter');
    const typeFilter = document.getElementById('type-filter');
    const searchInput = document.getElementById('search');
    const searchIcon = document.querySelector('.search-icon');
    const scrollTrigger = document.getElementById('scroll-trigger');
    const themeToggleButton = document.getElementById('theme-toggle');

    function mapToCardData(details) {
        return {
            id: details.id,
            name: details.name,
            types: details.types.map((t) => t.type.name),
            image: details.sprites.other['official-artwork']?.front_default || details.sprites.front_default,
        };
    }

    async function handleFilterOrBrowse() {
        if (state.isLoading) return;
        setSearchingGlobal(false);

        const selectedGen = generationFilter.value;
        const selectedType = typeFilter.value;

        if (selectedGen === 'all' && selectedType) {
            displayError("FILTRO INVÁLIDO — tipo não combina com 'Todas as Gerações'.", pokedexContainer);
            setAllPokemons([]);
            return;
        }

        setLoading(true);
        showLoader(pokedexContainer);
        setAllPokemons([]);

        try {
            let pokemons;
            if (selectedGen === 'all') {
                pokemons = await fetchAllPokemons();
            } else if (selectedType) {
                pokemons = await fetchPokemonsByType(selectedType, selectedGen);
            } else {
                pokemons = await fetchAllPokemonsByGeneration(selectedGen);
            }
            setAllPokemons(pokemons);
            setLoading(false);
            renderPokedex();
        } catch (error) {
            setLoading(false);
            displayError(error.message || 'FALHA NA LEITURA — não foi possível carregar os Pokémon.', pokedexContainer, handleFilterOrBrowse);
        }
    }

    async function handleGlobalSearch(name) {
        if (state.isLoading) return;
        setSearchingGlobal(true);
        setLoading(true);
        showLoader(pokedexContainer);
        try {
            const details = await searchGlobalPokemon(name);
            const foundPokemon = mapToCardData(details);
            pokedexContainer.innerHTML = '';
            const card = createPokemonCard(foundPokemon, () => showPokemonDetails(foundPokemon.id));
            pokedexContainer.appendChild(card);
            pokedexContainer.setAttribute('aria-busy', 'false');
        } catch (error) {
            displayError(error.message || `ESPÉCIME "${name}" NÃO ENCONTRADO.`, pokedexContainer, () => handleGlobalSearch(name));
        } finally {
            setLoading(false);
        }
    }

    async function loadMorePokemons() {
        if (state.isLoading || state.isSearchingGlobal) return;

        const pokemonsToLoad = getFilteredPokemons().slice(state.currentOffset, state.currentOffset + POKEMONS_PER_PAGE);
        if (pokemonsToLoad.length === 0) {
            if (state.currentOffset === 0) displayError('SEM RESULTADOS — ajuste os filtros e escaneie de novo.', pokedexContainer);
            return;
        }

        setLoading(true);
        try {
            const pokemonDetails = await Promise.all(pokemonsToLoad.map((p) => fetchPokemonDetails(p.url)));

            if (state.currentOffset === 0) {
                pokedexContainer.innerHTML = '';
            }

            const fragment = document.createDocumentFragment();
            pokemonDetails.forEach((details) => {
                const card = createPokemonCard(mapToCardData(details), () => showPokemonDetails(details.id));
                fragment.appendChild(card);
            });
            pokedexContainer.appendChild(fragment);
            pokedexContainer.setAttribute('aria-busy', 'false');

            incrementOffset(pokemonsToLoad.length);
        } catch (error) {
            if (state.currentOffset === 0) pokedexContainer.innerHTML = '';
            displayError(error.message || 'Não foi possível carregar os Pokémon.', pokedexContainer, loadMorePokemons);
        } finally {
            setLoading(false);
        }
    }

    function renderPokedex() {
        resetOffset();
        pokedexContainer.innerHTML = '';
        loadMorePokemons();
    }

    function getFilteredPokemons() {
        const searchTerm = searchInput.value.toLowerCase().trim();
        if (!searchTerm) return state.allPokemons;
        return state.allPokemons.filter((pokemon) => pokemon.name.toLowerCase().includes(searchTerm));
    }

    async function showPokemonDetails(pokemonId) {
        try {
            const details = await fetchDetailsForModal(pokemonId);
            createDetailsModal(details, modalContainer);
        } catch (error) {
            console.error('Erro ao buscar detalhes do Pokémon:', error);
        }
    }

    const observer = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && !state.isLoading && !state.isSearchingGlobal) {
            loadMorePokemons();
        }
    }, { rootMargin: '0px 0px 400px 0px' });

    function init() {
        setupTheme(themeToggleButton);

        const resetAndBrowse = () => {
            searchInput.value = '';
            handleFilterOrBrowse();
        };
        generationFilter.addEventListener('change', () => {
            updateHeaderTitle(generationFilter.value);
            if (generationFilter.value === 'all') { typeFilter.value = ''; }
            resetAndBrowse();
        });
        typeFilter.addEventListener('change', resetAndBrowse);

        searchInput.addEventListener('input', () => {
            setSearchingGlobal(false);
            clearTimeout(debounceTimeout);
            debounceTimeout = setTimeout(renderPokedex, SEARCH_DEBOUNCE_MS);
        });

        const triggerGlobalSearch = () => {
            const searchTerm = searchInput.value.trim();
            if (searchTerm.length >= MIN_GLOBAL_SEARCH_LENGTH) { handleGlobalSearch(searchTerm); }
        };
        searchIcon.addEventListener('click', triggerGlobalSearch);
        searchInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') { e.preventDefault(); triggerGlobalSearch(); }
        });

        const btnSearch = document.getElementById('btn-search');
        const btnClear = document.getElementById('btn-clear');
        btnSearch?.addEventListener('click', triggerGlobalSearch);
        btnClear?.addEventListener('click', () => {
            generationFilter.value = 'all';
            typeFilter.value = '';
            updateHeaderTitle('all');
            resetAndBrowse();
        });

        const yearEl = document.getElementById('current-year');
        if (yearEl) yearEl.textContent = new Date().getFullYear();

        generationFilter.value = 'all';
        updateHeaderTitle(generationFilter.value);
        handleFilterOrBrowse();
        observer.observe(scrollTrigger);
    }

    init();
});
