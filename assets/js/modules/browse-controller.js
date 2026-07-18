class BrowseController {
    constructor(app) {
        this.app = app;
    }

    // getMeaningForLanguage vive en app.js: también lo usan practice,
    // quiz-legacy y strokes-radicals, y este controller es lazy.
    getMeaningForLanguage(word) {
        return this.app.getMeaningForLanguage(word);
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

        // Retrieve selected sort order
        const sortOrderSelect = document.getElementById('browse-sort-order');
        const sortOrder = sortOrderSelect ? sortOrderSelect.value : 'lesson';

        // Make a shallow copy of the filtered array to avoid mutating the original vocabulary array
        filteredVocab = [...filteredVocab];

        if (sortOrder === 'lesson') {
            const hasBookLessonMetadata = (word) => Boolean(
                word.book !== undefined ||
                word.bookPart !== undefined ||
                word.volume !== undefined ||
                word.lesson !== undefined ||
                word.lessonOrder !== undefined
            );

            const getBookRank = (bookValue) => {
                const book = String(bookValue || '').trim().toLowerCase();
                if (!book) return 1;
                if (['shang', 's', 'upper', 'up', '1', 'vol1', 'book1', '上', '上册'].includes(book)) return 1;
                if (['xia', 'x', 'lower', 'down', '2', 'vol2', 'book2', '下', '下册'].includes(book)) return 2;
                const numeric = Number(book);
                return Number.isFinite(numeric) ? numeric : 1;
            };

            const getLessonNumber = (word) => {
                const lesson = Number(word.lesson ?? 0);
                return Number.isFinite(lesson) ? lesson : 0;
            };

            const getLessonSequence = (word) => {
                const sequence = Number(word.lessonOrder ?? 0);
                return Number.isFinite(sequence) ? sequence : 0;
            };

            filteredVocab.sort((a, b) => {
                // First sort by level if sorting a mixed list
                const aLevel = Number(a.level || 0);
                const bLevel = Number(b.level || 0);
                if (selectedLevel === 'all' && aLevel !== bLevel) {
                    return aLevel - bLevel;
                }

                const aHasMetadata = hasBookLessonMetadata(a);
                const bHasMetadata = hasBookLessonMetadata(b);

                if (aHasMetadata && bHasMetadata) {
                    const aBookRank = getBookRank(a.book ?? a.bookPart ?? a.volume);
                    const bBookRank = getBookRank(b.book ?? b.bookPart ?? b.volume);
                    if (aBookRank !== bBookRank) return aBookRank - bBookRank;

                    const aLesson = getLessonNumber(a);
                    const bLesson = getLessonNumber(b);
                    if (aLesson !== bLesson) return aLesson - bLesson;

                    const aSequence = getLessonSequence(a);
                    const bSequence = getLessonSequence(b);
                    if (aSequence !== bSequence) return aSequence - bSequence;
                } else if (aHasMetadata && !bHasMetadata) {
                    return -1;
                } else if (!aHasMetadata && bHasMetadata) {
                    return 1;
                }

                const aOrder = Number.isFinite(Number(a._sourceOrder)) ? Number(a._sourceOrder) : 999999;
                const bOrder = Number.isFinite(Number(b._sourceOrder)) ? Number(b._sourceOrder) : 999999;
                return aOrder - bOrder;
            });
        } else {
            // Sort alphabetically (by level first, then _sourceOrder / alphabetical)
            filteredVocab.sort((a, b) => {
                const aLevel = Number(a.level || 0);
                const bLevel = Number(b.level || 0);
                if (selectedLevel === 'all' && aLevel !== bLevel) {
                    return aLevel - bLevel;
                }
                const aOrder = Number.isFinite(Number(a._sourceOrder)) ? Number(a._sourceOrder) : 999999;
                const bOrder = Number.isFinite(Number(b._sourceOrder)) ? Number(b._sourceOrder) : 999999;
                return aOrder - bOrder;
            });
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

        const meaning = this.getMeaningForLanguage(word);
        
        // Split word into characters to render each in a calligraphic box if there are 2 or more characters
        const chars = Array.from(word.character || '');
        const tones = this.app.getTonesFromPinyin(word.pinyin || '');
        let characterHtml = '';
        if (chars.length > 1) {
            characterHtml = '<div class="vocab-character-container">' +
                chars.map((c, i) => {
                    const tone = tones[i] !== undefined ? tones[i] : 0;
                    return `<div class="vocab-character-box tone-${tone}">${c}</div>`;
                }).join('') +
                '</div>';
        } else {
            const tone = tones[0] !== undefined ? tones[0] : 0;
            characterHtml = `<div class="vocab-character tone-${tone}">` + word.character + '</div>';
        }

        const leadTone = tones[0] !== undefined ? tones[0] : 0;
        card.classList.add('tone-spine-' + leadTone);

        const ariaLabel = (word.character + ' ' + word.pinyin).replace(/"/g, '');

        card.innerHTML =
            '<button type="button" class="vocab-card-main" aria-label="' + ariaLabel + '">' +
                characterHtml +
                '<div class="vocab-pinyin">' + this.app.colorPinyinByTone(word.pinyin) + '</div>' +
                '<div class="vocab-meaning">' + meaning + '</div>' +
            '</button>' +
            '<div class="vocab-card-footer">' +
                '<span class="vocab-level">HSK ' + word.level + '</span>' +
                '<button type="button" class="vocab-audio-btn" title="' + (this.app.getTranslation('playPronunciation') || 'Play pronunciation') + '" aria-label="' + (this.app.getTranslation('playPronunciation') || 'Play pronunciation') + '">' +
                    '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
                        '<polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>' +
                        '<path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path>' +
                        '<path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path>' +
                    '</svg>' +
                '</button>' +
            '</div>';

        const mainBtn = card.querySelector('.vocab-card-main');
        if (mainBtn) {
            mainBtn.addEventListener('click', () => this.app.selectVocabWord(word));
        }

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
