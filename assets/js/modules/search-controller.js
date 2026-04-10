class SearchController {
    constructor(app) {
        this.app = app;
    }

    performHeaderSearch(searchTerm) {
        if (!searchTerm || searchTerm.trim() === '') {
            this.hideHeaderSearchDropdown();
            return;
        }

        clearTimeout(this.app.headerSearchTimeout);
        this.app.headerSearchTimeout = setTimeout(() => {
            this.showHeaderSearchResults(searchTerm);
        }, 300);
    }

    showHeaderSearchResults(searchTerm) {
        try {
            const normalizedTerm = searchTerm.toLowerCase();
            const results = this.app.vocabulary.filter((word) =>
                word.character.includes(searchTerm) ||
                word.pinyin.toLowerCase().includes(normalizedTerm) ||
                (word.english && word.english.toLowerCase().includes(normalizedTerm)) ||
                (word.translation && word.translation.toLowerCase().includes(normalizedTerm))
            ).slice(0, 5);

            this.displayHeaderSearchDropdown(results);
        } catch (error) {
            this.app.logWarn('Error performing header search:', error && error.message ? error.message : error);
        }
    }

    displayHeaderSearchDropdown(results) {
        this.hideHeaderSearchDropdown();

        if (!results || results.length === 0) {
            return;
        }

        const dropdown = document.createElement('div');
        dropdown.id = 'header-search-dropdown';
        dropdown.style.cssText = [
            'position: absolute',
            'top: 100%',
            'left: 0',
            'right: 0',
            'background: white',
            'border: 1px solid var(--color-border, #e2e8f0)',
            'border-radius: 8px',
            'box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1)',
            'z-index: 1000',
            'max-height: 300px',
            'overflow-y: auto',
            'margin-top: 4px'
        ].join(';') + ';';

        results.forEach((word) => {
            const item = document.createElement('div');
            item.style.cssText = [
                'padding: 12px 16px',
                'cursor: pointer',
                'border-bottom: 1px solid #f1f5f9',
                'transition: background-color 0.2s ease',
                'display: flex',
                'justify-content: space-between',
                'align-items: center'
            ].join(';') + ';';

            item.innerHTML =
                '<div>' +
                    '<span style="font-size: 1.25rem; font-weight: 600; color: #e11d48;">' + word.character + '</span>' +
                    '<span style="margin-left: 8px; color: #f59e0b;">' + word.pinyin + '</span>' +
                '</div>' +
                '<div style="font-size: 0.875rem; color: #64748b;">' +
                    (word.english || word.translation || '') +
                '</div>';

            item.addEventListener('mouseenter', () => {
                item.style.backgroundColor = '#fdf2f8';
            });

            item.addEventListener('mouseleave', () => {
                item.style.backgroundColor = '';
            });

            item.addEventListener('click', () => {
                this.selectHeaderSearchResult(word);
                this.hideHeaderSearchDropdown();
            });

            dropdown.appendChild(item);
        });

        const headerSearch = document.getElementById('header-search');
        if (headerSearch && headerSearch.parentElement) {
            const parent = headerSearch.parentElement;
            parent.style.position = 'relative';
            parent.appendChild(dropdown);

            setTimeout(() => {
                document.addEventListener('click', (event) => {
                    if (!parent.contains(event.target)) {
                        this.hideHeaderSearchDropdown();
                    }
                }, { once: true });
            }, 100);
        }
    }

    hideHeaderSearchDropdown() {
        const existingDropdown = document.getElementById('header-search-dropdown');
        if (existingDropdown) {
            existingDropdown.remove();
        }
    }

    selectHeaderSearchResult(word) {
        this.app.switchTab('practice');
        this.app.currentWord = word;
        this.app.isFlipped = false;
        this.app.updateCard();

        const headerSearch = document.getElementById('header-search');
        if (headerSearch) {
            headerSearch.value = '';
        }

        this.app.logDebug('[SEARCH] Selected word from header search: ' + word.character);
    }
}

window.SearchController = SearchController;
