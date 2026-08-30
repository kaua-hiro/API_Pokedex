/**
 * Replaces a native <select> with a custom listbox styled as a miniature
 * Pokédex screen (lens + status dots header, phosphor terminal list).
 * The native <select> is kept in the DOM (visually hidden) as the single
 * source of truth: this widget only reads/writes its `.value` and fires
 * its `change` event, so existing form logic keeps working untouched.
 */

const openInstances = new Set();

function closeOthers(except) {
    openInstances.forEach((instance) => {
        if (instance !== except) instance.close();
    });
}

export function createPokedexSelect(selectEl, { renderSwatch } = {}) {
    const wrapper = document.createElement('div');
    wrapper.className = 'pokedex-select';

    const triggerId = `${selectEl.id}-trigger`;
    const trigger = document.createElement('button');
    trigger.type = 'button';
    trigger.id = triggerId;
    trigger.className = 'pokedex-select__trigger';
    trigger.setAttribute('aria-haspopup', 'listbox');
    trigger.setAttribute('aria-expanded', 'false');

    const triggerValue = document.createElement('span');
    triggerValue.className = 'pokedex-select__value';
    const chevron = document.createElement('span');
    chevron.className = 'pokedex-select__chevron';
    chevron.setAttribute('aria-hidden', 'true');
    trigger.append(triggerValue, chevron);

    const panel = document.createElement('div');
    panel.className = 'pokedex-select__panel';
    panel.hidden = true;

    const list = document.createElement('ul');
    list.className = 'pokedex-select__list';
    list.setAttribute('role', 'listbox');
    list.setAttribute('aria-labelledby', triggerId);

    const keypadCells = Array.from({ length: 12 }, () => '<span class="pokedex-select__key" aria-hidden="true"></span>').join('');

    panel.innerHTML = `
        <div class="pokedex-select__flip-left">
            <div class="pokedex-select__mini-header">
                <span class="pokedex-select__lens" aria-hidden="true"></span>
                <span class="pokedex-select__dots" aria-hidden="true">
                    <span class="dot dot--green"></span>
                    <span class="dot dot--yellow"></span>
                </span>
            </div>
            <div class="pokedex-select__screen">
                <p class="pokedex-select__screen-label">&gt; ${selectEl.getAttribute('aria-label') || ''}</p>
            </div>
            <div class="pokedex-select__mini-controls" aria-hidden="true">
                <span class="pokedex-select__mini-btn-red"></span>
                <span class="pokedex-select__mini-grille"></span>
            </div>
        </div>
        <div class="pokedex-select__hinge" aria-hidden="true">
            <span class="pokedex-select__knuckle"></span>
            <span class="pokedex-select__knuckle"></span>
        </div>
        <div class="pokedex-select__flip-right" aria-hidden="true">
            <span class="pokedex-select__mini-display"></span>
            <span class="pokedex-select__keypad">${keypadCells}</span>
            <span class="pokedex-select__mini-buttons">
                <span class="pokedex-select__mini-btn-white"></span>
                <span class="pokedex-select__mini-btn-white"></span>
                <span class="pokedex-select__mini-gold"></span>
            </span>
            <span class="pokedex-select__mini-green-buttons">
                <span class="pokedex-select__mini-btn-green"></span>
                <span class="pokedex-select__mini-btn-green"></span>
            </span>
        </div>`;

    panel.querySelector('.pokedex-select__screen').appendChild(list);

    const optionEls = Array.from(selectEl.options).map((opt, index) => {
        const li = document.createElement('li');
        li.className = 'pokedex-select__option';
        li.setAttribute('role', 'option');
        li.id = `${selectEl.id}-opt-${index}`;
        li.dataset.value = opt.value;

        const swatchHtml = renderSwatch ? (renderSwatch(opt.value) || '') : '';
        li.innerHTML = `
            ${swatchHtml}
            <span class="pokedex-select__label">${opt.textContent}</span>
            <span class="pokedex-select__check" aria-hidden="true">&#10003;</span>`;

        li.addEventListener('click', () => choose(opt.value));
        list.appendChild(li);
        return li;
    });

    let activeIndex = Math.max(0, selectEl.selectedIndex);

    function sync() {
        const opt = selectEl.options[selectEl.selectedIndex];
        triggerValue.textContent = opt ? opt.textContent : '';
        optionEls.forEach((li, i) => {
            const isSelected = selectEl.options[i].value === selectEl.value;
            li.setAttribute('aria-selected', String(isSelected));
            li.classList.toggle('is-selected', isSelected);
            if (isSelected) activeIndex = i;
        });
    }

    function choose(value) {
        if (selectEl.value !== value) {
            selectEl.value = value;
            selectEl.dispatchEvent(new Event('change', { bubbles: true }));
        }
        sync();
        close();
        trigger.focus();
    }

    function highlight(index) {
        activeIndex = Math.max(0, Math.min(optionEls.length - 1, index));
        optionEls.forEach((li, i) => li.classList.toggle('is-active', i === activeIndex));
        optionEls[activeIndex]?.scrollIntoView({ block: 'nearest' });
        trigger.setAttribute('aria-activedescendant', optionEls[activeIndex]?.id || '');
    }

    function onDocumentClick(e) {
        if (!wrapper.contains(e.target)) close();
    }

    function onKeydown(e) {
        switch (e.key) {
            case 'ArrowDown': e.preventDefault(); highlight(activeIndex + 1); break;
            case 'ArrowUp': e.preventDefault(); highlight(activeIndex - 1); break;
            case 'Home': e.preventDefault(); highlight(0); break;
            case 'End': e.preventDefault(); highlight(optionEls.length - 1); break;
            case 'Enter':
            case ' ':
                e.preventDefault();
                choose(optionEls[activeIndex].dataset.value);
                break;
            case 'Escape':
            case 'Tab':
                close();
                if (e.key === 'Escape') trigger.focus();
                break;
            default: break;
        }
    }

    function open() {
        if (!panel.hidden) return;
        closeOthers(instance);
        panel.hidden = false;
        trigger.setAttribute('aria-expanded', 'true');
        wrapper.classList.add('is-open');
        highlight(activeIndex);
        document.addEventListener('click', onDocumentClick);
        document.addEventListener('keydown', onKeydown);
    }

    function close() {
        if (panel.hidden) return;
        panel.hidden = true;
        trigger.setAttribute('aria-expanded', 'false');
        wrapper.classList.remove('is-open');
        document.removeEventListener('click', onDocumentClick);
        document.removeEventListener('keydown', onKeydown);
    }

    function toggle() {
        if (panel.hidden) open(); else close();
    }

    trigger.addEventListener('click', toggle);
    trigger.addEventListener('keydown', (e) => {
        if (panel.hidden && (e.key === 'ArrowDown' || e.key === 'ArrowUp' || e.key === 'Enter' || e.key === ' ')) {
            e.preventDefault();
            open();
        }
    });

    selectEl.classList.add('visually-hidden');
    selectEl.setAttribute('tabindex', '-1');
    selectEl.setAttribute('aria-hidden', 'true');

    const associatedLabel = document.querySelector(`label[for="${selectEl.id}"]`);
    if (associatedLabel) associatedLabel.setAttribute('for', triggerId);

    selectEl.insertAdjacentElement('afterend', wrapper);
    wrapper.append(trigger, panel);

    const instance = { sync, close };
    openInstances.add(instance);
    sync();
    return instance;
}
