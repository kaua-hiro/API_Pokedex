import { GENERATIONS } from './constants.js';
import { getGenerationByID } from './api.js';

const TYPE_LABELS_PT = {
    normal: 'Normal', fire: 'Fogo', water: 'Água', electric: 'Elétrico',
    grass: 'Grama', ice: 'Gelo', fighting: 'Lutador', poison: 'Venenoso',
    ground: 'Terra', flying: 'Voador', psychic: 'Psíquico', bug: 'Inseto',
    rock: 'Pedra', ghost: 'Fantasma', dragon: 'Dragão', dark: 'Sombrio',
    steel: 'Aço', fairy: 'Fada',
};

const STAT_LABELS_PT = {
    hp: 'HP', attack: 'Ataque', defense: 'Defesa',
    'special-attack': 'Ataque Esp.', 'special-defense': 'Defesa Esp.', speed: 'Velocidade',
};

const MAX_STAT_VALUE = 255;

const PLACEHOLDER_IMAGE = 'data:image/svg+xml;utf8,' + encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">'
    + '<circle cx="50" cy="50" r="46" fill="none" stroke="#ccc" stroke-width="4"/>'
    + '<line x1="4" y1="50" x2="96" y2="50" stroke="#ccc" stroke-width="4"/>'
    + '<circle cx="50" cy="50" r="12" fill="#fff" stroke="#ccc" stroke-width="4"/>'
    + '</svg>',
);

function translateType(type) {
    return TYPE_LABELS_PT[type] || type;
}

function getPokemonImage(pokemon) {
    return pokemon.sprites?.other?.['official-artwork']?.front_default
        || pokemon.sprites?.front_default
        || pokemon.image
        || '';
}

function buildTypeBadges(types) {
    return types
        .map((type) => `<span class="type ${type}">${translateType(type)}</span>`)
        .join('');
}

/** Escapes text pulled from third-party services (translation API) before
 * it goes into innerHTML — unlike PokeAPI's own fields, that response
 * isn't a source we control. */
function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

export function createPokemonCard(pokemon, onSelect) {
    const card = document.createElement('div');
    card.className = 'pokemon-card';
    card.setAttribute('role', 'button');
    card.setAttribute('tabindex', '0');
    card.setAttribute('aria-label', `Ver detalhes de ${pokemon.name}`);

    if (onSelect) {
        card.addEventListener('click', onSelect);
        card.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onSelect();
            }
        });
    }

    const img = document.createElement('img');
    img.src = pokemon.image;
    img.alt = pokemon.name;
    img.loading = 'lazy';
    img.onerror = () => { img.onerror = null; img.src = PLACEHOLDER_IMAGE; };

    const number = document.createElement('div');
    number.className = 'pokemon-number';
    number.textContent = `#${String(pokemon.id).padStart(3, '0')}`;

    const name = document.createElement('div');
    name.className = 'pokemon-name';
    name.textContent = pokemon.name;

    const types = document.createElement('div');
    types.className = 'pokemon-types';
    types.innerHTML = buildTypeBadges(pokemon.types);

    const generationBadge = document.createElement('div');
    generationBadge.className = 'generation-badge';
    generationBadge.textContent = GENERATIONS[getGenerationByID(pokemon.id)]?.name || 'Kanto';

    card.append(img, number, name, types, generationBadge);
    return card;
}

export function createDetailsModal(details, modalContainer, description = {}) {
    const primaryType = details.types[0].type.name;
    const { descriptionEn = '', descriptionPt = null } = description;

    const statsHtml = details.stats.map((s) => {
        const label = STAT_LABELS_PT[s.stat.name] || s.stat.name.replace(/-/g, ' ');
        const percentage = Math.min(Math.round((s.base_stat / MAX_STAT_VALUE) * 100), 100);
        return `
            <div class="stat-row">
                <span class="stat-name">${label}</span>
                <div class="stat-bar-container">
                    <div class="stat-bar" data-fill="${percentage}" style="width: 0%;"></div>
                </div>
                <span class="stat-value">${s.base_stat}</span>
            </div>`;
    }).join('');

    const abilitiesHtml = details.abilities
        .map((a) => a.ability.name.replace(/-/g, ' '))
        .join(', ');

    const descriptionHtml = descriptionEn ? `
        <div class="modal-pokemon-description">
            <p class="dex-entry dex-entry--en"><span class="dex-entry__tag">EN</span>${escapeHtml(descriptionEn)}</p>
            <p class="dex-entry dex-entry--pt"><span class="dex-entry__tag">PT</span>${descriptionPt ? escapeHtml(descriptionPt) : 'Tradução indisponível no momento.'}</p>
        </div>` : '';

    modalContainer.innerHTML = `
        <div class="modal" role="dialog" aria-modal="true" aria-labelledby="modal-pokemon-name">
            <div class="modal-content type-${primaryType}">
                <button type="button" class="modal-close-button" aria-label="Fechar detalhes">&times;</button>
                <div class="modal-header">
                    <h2 class="modal-pokemon-name" id="modal-pokemon-name">${details.name}</h2>
                    <span class="modal-pokemon-number">#${String(details.id).padStart(3, '0')}</span>
                </div>
                <div class="modal-body">
                    <div class="modal-scanner">
                        <span class="modal-scanner__sweep" aria-hidden="true"></span>
                        <img class="modal-pokemon-image" src="${getPokemonImage(details)}" alt="${details.name}">
                    </div>
                    <div class="modal-pokemon-info">
                        <div class="modal-pokemon-types">${buildTypeBadges(details.types.map((t) => t.type.name))}</div>
                        <div class="modal-pokemon-meta">
                            <span><strong>Altura:</strong> ${(details.height / 10).toFixed(1)} m</span>
                            <span><strong>Peso:</strong> ${(details.weight / 10).toFixed(1)} kg</span>
                        </div>
                        <div class="modal-pokemon-abilities"><strong>Habilidades:</strong> ${abilitiesHtml}</div>
                        ${descriptionHtml}
                        <div class="pokemon-stats">${statsHtml}</div>
                    </div>
                </div>
            </div>
        </div>`;

    modalContainer.classList.add('visible');

    requestAnimationFrame(() => {
        modalContainer.querySelectorAll('.stat-bar').forEach((bar) => {
            bar.style.width = `${bar.dataset.fill}%`;
        });
    });

    const closeButton = modalContainer.querySelector('.modal-close-button');
    closeButton.addEventListener('click', () => closeModal(modalContainer));
    closeButton.focus();

    modalContainer.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) closeModal(modalContainer);
    });

    const escHandler = (e) => {
        if (e.key === 'Escape') {
            closeModal(modalContainer);
            document.removeEventListener('keydown', escHandler);
        }
    };
    document.addEventListener('keydown', escHandler);
}

export function closeModal(modalContainer) {
    modalContainer.classList.remove('visible');
    modalContainer.innerHTML = '';
}

export function showLoader(pokedexContainer) {
    pokedexContainer.setAttribute('aria-busy', 'true');
    pokedexContainer.innerHTML = '';
    const skeletonCount = 12;
    const fragment = document.createDocumentFragment();
    for (let i = 0; i < skeletonCount; i += 1) {
        const card = document.createElement('div');
        card.className = 'skeleton-card';
        card.innerHTML = `
            <div class="skeleton skeleton-image"></div>
            <div class="skeleton skeleton-text"></div>
            <div class="skeleton skeleton-text skeleton-text-small"></div>`;
        fragment.appendChild(card);
    }
    pokedexContainer.appendChild(fragment);
}

export function displayError(message, pokedexContainer, onRetry) {
    pokedexContainer.setAttribute('aria-busy', 'false');
    pokedexContainer.innerHTML = '';
    const errorBox = document.createElement('div');
    errorBox.className = 'error-message-inline';
    errorBox.setAttribute('role', 'alert');

    const text = document.createElement('p');
    text.textContent = message;
    errorBox.appendChild(text);

    if (onRetry) {
        const retryButton = document.createElement('button');
        retryButton.type = 'button';
        retryButton.className = 'retry-button';
        retryButton.textContent = 'RE-SCAN';
        retryButton.addEventListener('click', onRetry);
        errorBox.appendChild(retryButton);
    }

    pokedexContainer.appendChild(errorBox);
}

export function updateHeaderTitle(gen) {
    const subtitle = document.getElementById('unit-subtitle');
    if (subtitle) subtitle.textContent = `Unit-01 · ${GENERATIONS[gen]?.name || 'Todas as Gerações'}`;
}

export function setupTheme(themeToggleButton) {
    const applyTheme = (theme) => {
        document.body.classList.toggle('dark-mode', theme === 'dark');
        themeToggleButton.setAttribute('aria-pressed', String(theme === 'dark'));
        themeToggleButton.setAttribute('aria-label', theme === 'dark' ? 'Ativar carcaça clara' : 'Ativar carcaça escura');
    };

    const prefersDark = window.matchMedia?.('(prefers-color-scheme: dark)').matches;
    const savedTheme = localStorage.getItem('theme') || (prefersDark ? 'dark' : 'light');
    applyTheme(savedTheme);

    themeToggleButton.addEventListener('click', () => {
        const isDarkMode = document.body.classList.contains('dark-mode');
        const newTheme = isDarkMode ? 'light' : 'dark';
        localStorage.setItem('theme', newTheme);
        applyTheme(newTheme);
    });
}
