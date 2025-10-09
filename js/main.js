import { fetchAllPokemons, fetchAllPokemonsByGeneration, fetchPokemonsByType, searchGlobalPokemon, fetchDetailsForModal, fetchPokemonDetails } from './api.js';
import { createPokemonCard, createDetailsModal, showLoader, displayError, updateHeaderTitle, setupTheme } from './ui.js';
import { POKEMONS_PER_PAGE } from './constants.js';
import { state, setAllPokemons, resetOffset, incrementOffset, setLoading, setSearchingGlobal } from './state.js';

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

    async function handleFilterOrBrowse() {
        setSearchingGlobal(false);
        showLoader(pokedexContainer);
        setAllPokemons([]);
        const selectedGen = generationFilter.value;
        const selectedType = typeFilter.value;

        try {
            let pokemons = [];
            if (selectedGen === 'all') {
                pokemons = await fetchAllPokemons();
                if (selectedType) {
                    displayError("Filtro por tipo não disponível com 'Todas as Gerações'.", pokedexContainer);
                    return;
                }
            } else if (selectedType) {
                pokemons = await fetchPokemonsByType(selectedType, selectedGen);
            } else {
                pokemons = await fetchAllPokemonsByGeneration(selectedGen);
            }
            setAllPokemons(pokemons);
            renderPokedex();
        } catch (error) {
            displayError("Não foi possível carregar os Pokémon.", pokedexContainer);
        }
    }

    async function handleGlobalSearch(name) {
        if (state.isLoading) return;
        setSearchingGlobal(true);
        setLoading(true);
        showLoader(pokedexContainer);
        try {
            const d = await searchGlobalPokemon(name);
            const foundPokemon = { id: d.id, name: d.name, types: d.types.map(t => t.type.name), image: d.sprites.other['official-artwork']?.front_default || d.sprites.front_default };
            pokedexContainer.innerHTML = '';
            const card = createPokemonCard(foundPokemon);
            card.addEventListener('click', () => showPokemonDetails(foundPokemon.id));
            pokedexContainer.appendChild(card);
        } catch (error) {
            displayError(`Pokémon "${name}" não encontrado.`, pokedexContainer);
        } finally {
            setLoading(false);
        }
    }
    
    async function loadMorePokemons() {
        if (state.isLoading || state.isSearchingGlobal) return;
        setLoading(true);

        const pokemonsToLoad = getFilteredPokemons().slice(state.currentOffset, state.currentOffset + POKEMONS_PER_PAGE);
        if (pokemonsToLoad.length === 0) {
            setLoading(false);
            if (state.currentOffset === 0) displayError("Nenhum Pokémon encontrado com estes filtros.", pokedexContainer);
            return;
        }

        const detailsPromises = pokemonsToLoad.map(p => fetchPokemonDetails(p.url));
        const pokemonDetails = await Promise.all(detailsPromises);

        if (state.currentOffset === 0) {
            pokedexContainer.innerHTML = '';
        }
        
        pokemonDetails.forEach(d => {
            const card = createPokemonCard({ id: d.id, name: d.name, types: d.types.map(t => t.type.name), image: d.sprites.other['official-artwork']?.front_default || d.sprites.front_default });
            card.addEventListener('click', () => showPokemonDetails(d.id));
            pokedexContainer.appendChild(card);
        });

        incrementOffset(pokemonsToLoad.length);
        setLoading(false);
    }

    function renderPokedex() {
        resetOffset();
        pokedexContainer.innerHTML = '';
        loadMorePokemons();
    }

    function getFilteredPokemons() {
        const searchTerm = searchInput.value.toLowerCase().trim();
        if (!searchTerm) return state.allPokemons;
        return state.allPokemons.filter(pokemon => pokemon.name.toLowerCase().includes(searchTerm));
    }
    
    async function showPokemonDetails(pokemonId) {
        try {
            const details = await fetchDetailsForModal(pokemonId);
            createDetailsModal(details, modalContainer);
        } catch (error) { console.error("Erro ao buscar detalhes do Pokémon:", error); }
    }
    
    const observer = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && !state.isLoading && !state.isSearchingGlobal) {
            loadMorePokemons();
        }
    }, { rootMargin: "0px 0px 400px 0px" });

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
            debounceTimeout = setTimeout(renderPokedex, 300);
        });

        const triggerGlobalSearch = () => {
            const searchTerm = searchInput.value.trim();
            if (searchTerm.length > 2) { handleGlobalSearch(searchTerm); }
        };
        searchIcon.addEventListener('click', triggerGlobalSearch);
        searchInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') { e.preventDefault(); triggerGlobalSearch(); }
        });

        generationFilter.value = 'all';
        updateHeaderTitle(generationFilter.value);
        handleFilterOrBrowse(); 
        observer.observe(scrollTrigger);
    }
    
    init();
});