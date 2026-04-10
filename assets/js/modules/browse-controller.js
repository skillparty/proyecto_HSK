class BrowseController {
    constructor(app) {
        this.app = app;
    }

    getMeaningForLanguage(word) {
        if (this.app.currentLanguage === 'es') {
            return word.spanish || word.translation || word.english || '?';
        }

        return word.english || word.translation || '?';
    }

    updateVocabularyCards() {
        const vocabCards = document.querySelectorAll('.vocab-card');
        vocabCards.forEach((card, index) => {
            if (this.app.browseState && this.app.browseState.displayedItems[index]) {
                const word = this.app.browseState.displayedItems[index];
                const meaningElement = card.querySelector('.vocab-meaning');
                if (meaningElement) {
                    meaningElement.textContent = this.getMeaningForLanguage(word);
                }
            }
        });
    }

    initializeBrowse() {
        this.app.browseState = {
            filteredVocabulary: [],
            displayedItems: [],
            currentPage: 0,
            itemsPerPage: 20,
            hasMore: true,
            loading: false
        };

        this.filterVocabulary();
        this.setupInfiniteScroll();
    }

    setupInfiniteScroll() {
        const vocabularyGrid = document.getElementById('vocabulary-grid');
        if (!vocabularyGrid) {
            return;
        }

        if (this.app.scrollListener) {
            window.removeEventListener('scroll', this.app.scrollListener);
        }

        this.app.scrollListener = () => {
            if (this.app.browseState.loading || !this.app.browseState.hasMore) {
                return;
            }

            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            const windowHeight = window.innerHeight;
            const documentHeight = document.documentElement.scrollHeight;

            if (scrollTop + windowHeight >= documentHeight - 200) {
                this.loadMoreVocabulary();
            }
        };

        window.addEventListener('scroll', this.app.scrollListener);
    }

    loadMoreVocabulary() {
        if (this.app.browseState.loading || !this.app.browseState.hasMore) {
            return;
        }

        this.app.browseState.loading = true;
        this.showLoadingIndicator();

        const startIndex = this.app.browseState.currentPage * this.app.browseState.itemsPerPage;
        const endIndex = startIndex + this.app.browseState.itemsPerPage;
        const nextBatch = this.app.browseState.filteredVocabulary.slice(startIndex, endIndex);

        if (nextBatch.length === 0) {
            this.app.browseState.hasMore = false;
            this.hideLoadingIndicator();
            this.showNoMoreItemsIndicator();
            return;
        }

        setTimeout(() => {
            this.renderVocabularyBatch(nextBatch);
            this.app.browseState.displayedItems.push(...nextBatch);
            this.app.browseState.currentPage += 1;
            this.app.browseState.loading = false;
            this.hideLoadingIndicator();

            if (this.app.browseState.displayedItems.length >= this.app.browseState.filteredVocabulary.length) {
                this.app.browseState.hasMore = false;
                this.showNoMoreItemsIndicator();
            }
        }, 300);
    }

    filterVocabulary() {
        const searchInput = document.getElementById('search-input');
        const levelFilter = document.getElementById('browse-level-filter');
        const vocabularyGrid = document.getElementById('vocabulary-grid');
        const browseStats = document.getElementById('browse-stats');

        if (!vocabularyGrid) {
            return;
        }

        const searchTerm = searchInput ? searchInput.value.toLowerCase() : '';
        const selectedLevel = levelFilter ? levelFilter.value : 'all';

        let filteredVocab = this.app.vocabulary;

        if (selectedLevel !== 'all') {
            filteredVocab = filteredVocab.filter(word => word.level == selectedLevel);
        }

        if (searchTerm) {
            filteredVocab = filteredVocab.filter(word =>
                word.character.includes(searchTerm) ||
                word.pinyin.toLowerCase().includes(searchTerm) ||
                (word.english && word.english.toLowerCase().includes(searchTerm)) ||
                (word.translation && word.translation.toLowerCase().includes(searchTerm))
            );
        }

        this.app.browseState.filteredVocabulary = filteredVocab;
        this.app.browseState.displayedItems = [];
        this.app.browseState.currentPage = 0;
        this.app.browseState.hasMore = filteredVocab.length > 0;

        if (browseStats) {
            browseStats.textContent = this.app.getTranslation('wordsFound', { count: filteredVocab.length }) || ('Found ' + filteredVocab.length + ' words');
        }

        vocabularyGrid.innerHTML = '';
        this.hideNoMoreItemsIndicator();

        if (filteredVocab.length > 0) {
            this.loadMoreVocabulary();
        } else {
            this.showNoResultsMessage();
        }
    }

    renderVocabularyBatch(words) {
        const vocabularyGrid = document.getElementById('vocabulary-grid');
        if (!vocabularyGrid) {
            return;
        }

        words.forEach(word => {
            const card = this.createVocabularyCard(word);
            vocabularyGrid.appendChild(card);
        });
    }

    createVocabularyCard(word) {
        const card = document.createElement('div');
        card.className = 'vocab-card';
        card.setAttribute('role', 'button');
        card.setAttribute('tabindex', '0');
        card.setAttribute('aria-label', word.character + ' ' + word.pinyin);

        const meaning = this.getMeaningForLanguage(word);
        card.innerHTML =
            '<div class="vocab-character">' + word.character + '</div>' +
            '<div class="vocab-pinyin">' + word.pinyin + '</div>' +
            '<div class="vocab-meaning">' + meaning + '</div>' +
            '<div class="vocab-level">HSK ' + word.level + '</div>' +
            '<button class="vocab-audio-btn" title="' + (this.app.getTranslation('playPronunciation') || 'Play pronunciation') + '">' +
                '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
                    '<polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>' +
                    '<path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path>' +
                    '<path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path>' +
                '</svg>' +
            '</button>';

        card.addEventListener('click', (e) => {
            if (!e.target.closest('.vocab-audio-btn')) {
                this.app.selectVocabWord(word);
            }
        });

        card.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                if (e.target.closest('.vocab-audio-btn')) {
                    return;
                }

                e.preventDefault();
                this.app.selectVocabWord(word);
            }
        });

        const audioBtn = card.querySelector('.vocab-audio-btn');
        if (audioBtn) {
            audioBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.app.playAudio(word.character);
            });
        }

        return card;
    }

    showLoadingIndicator() {
        const vocabularyGrid = document.getElementById('vocabulary-grid');
        if (!vocabularyGrid) {
            return;
        }

        let loadingIndicator = document.getElementById('browse-loading');
        if (!loadingIndicator) {
            loadingIndicator = document.createElement('div');
            loadingIndicator.id = 'browse-loading';
            loadingIndicator.className = 'browse-loading';
            loadingIndicator.innerHTML =
                '<div class="loading-spinner"></div>' +
                '<div class="loading-text">' + (this.app.getTranslation('loadingMoreVocabulary') || 'Loading more vocabulary...') + '</div>';
            vocabularyGrid.parentNode.appendChild(loadingIndicator);
        }

        loadingIndicator.style.display = 'flex';
    }

    hideLoadingIndicator() {
        const loadingIndicator = document.getElementById('browse-loading');
        if (loadingIndicator) {
            loadingIndicator.style.display = 'none';
        }
    }

    showNoMoreItemsIndicator() {
        const vocabularyGrid = document.getElementById('vocabulary-grid');
        if (!vocabularyGrid) {
            return;
        }

        let noMoreIndicator = document.getElementById('browse-no-more');
        if (!noMoreIndicator) {
            noMoreIndicator = document.createElement('div');
            noMoreIndicator.id = 'browse-no-more';
            noMoreIndicator.className = 'browse-no-more';
            noMoreIndicator.innerHTML =
                '<div class="no-more-text">' + (this.app.getTranslation('allVocabularyLoaded') || '[OK] All vocabulary loaded!') + '</div>';
            vocabularyGrid.parentNode.appendChild(noMoreIndicator);
        }

        noMoreIndicator.style.display = 'block';
    }

    hideNoMoreItemsIndicator() {
        const noMoreIndicator = document.getElementById('browse-no-more');
        if (noMoreIndicator) {
            noMoreIndicator.style.display = 'none';
        }
    }

    showNoResultsMessage() {
        const vocabularyGrid = document.getElementById('vocabulary-grid');
        if (!vocabularyGrid) {
            return;
        }

        vocabularyGrid.innerHTML =
            '<div class="no-results">' +
            '<div class="no-results-icon">?</div>' +
            '<h4>No words found</h4>' +
            '<p>Try adjusting the search or filters.</p>' +
            '</div>';
    }
}

window.BrowseController = BrowseController;
