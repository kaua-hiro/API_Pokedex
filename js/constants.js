export const POKEMONS_PER_PAGE = 24;

export const GENERATIONS = {
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

/** One accent colour per region — echoes each generation's box-art
 * palette, used as the keypad-style swatch in the GEN picker. */
export const GENERATION_COLORS = {
    1: "#EF5350",
    2: "#D4A62A",
    3: "#26A69A",
    4: "#5C6BC0",
    5: "#78909C",
    6: "#AB47BC",
    7: "#FF7043",
    8: "#7E57C2",
    9: "#EC407A",
};