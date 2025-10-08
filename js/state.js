export const state = {
    allPokemons: [],
    currentOffset: 0,
    isLoading: false,
    isSearchingGlobal: false,
};

export function setAllPokemons(pokemons) {
    state.allPokemons = pokemons;
}

export function resetOffset() {
    state.currentOffset = 0;
}

export function incrementOffset(amount) {
    state.currentOffset += amount;
}

export function setLoading(status) {
    state.isLoading = status;
}

export function setSearchingGlobal(status) {
    state.isSearchingGlobal = status;
}