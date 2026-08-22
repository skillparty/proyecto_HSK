class BrowseController {
    constructor(app) {
        this.app = app;
        this.intersectionObserver = null;
        this.scrollCleanupHandlers = [];
        this.selectedWords = new Set();
        this.isSelectionMode = false;

        if (typeof window !== 'undefined') {
            window.addEventListener('hsk:vocabulary-ready', () => {
                if (this.app.browseState && (!this.app.browseState.filteredVocabulary || this.app.browseState.filteredVocabulary.length === 0)) {
                    this.filterVocabulary();
                }
            });
        }
    }

    // getMeaningForLanguage vive en app.js: también lo usan practice,
    // quiz-legacy y strokes-radicals, y este controller es lazy.
    getMeaningForLanguage(word) {
        return this.app.getMeaningForLanguage(word);
    }

    updateVocabularyCards() {
        const vocabCards = document.querySelectorAll('.vocab-card');
        vocabCards.forEach((card, index) => {
            if (this.app.browseState && this.app.browseState.displayedItems && this.app.browseState.displayedItems[index]) {
                const word = this.app.browseState.displayedItems[index];
                const meaningElement = card.querySelector('.vocab-meaning');
                if (meaningElement) {
                    meaningElement.textContent = this.getMeaningForLanguage(word);
                }
            }
        });
    }

    onTabActivated() {
        this.setupInfiniteScroll();
        this.checkIfNeedMoreContent();
    }

    initializeBrowse() {
        this.app.browseState = {
            filteredVocabulary: [],
            displayedItems: [],
            currentPage: 0,
            itemsPerPage: 30,
            hasMore: true,
            loading: false
        };

        if ((!this.app.vocabulary || this.app.vocabulary.length === 0) && typeof this.app.loadVocabulary === 'function') {
            this.app.loadVocabulary().then(() => this.filterVocabulary());
        }

        this.filterVocabulary();
        this.setupInfiniteScroll();

        const exportBtn = document.getElementById('export-anki-btn');
        if (exportBtn && !exportBtn.dataset.boundAnki) {
            exportBtn.dataset.boundAnki = 'true';
            exportBtn.addEventListener('click', () => this.exportToAnkiCsv());
        }

        const exportPdfBtn = document.getElementById('export-pdf-btn');
        if (exportPdfBtn && !exportPdfBtn.dataset.boundPdf) {
            exportPdfBtn.dataset.boundPdf = 'true';
            exportPdfBtn.addEventListener('click', () => this.openPdfModal());
        }

        const selectModeBtn = document.getElementById('browse-select-mode-btn');
        if (selectModeBtn && !selectModeBtn.dataset.boundSelect) {
            selectModeBtn.dataset.boundSelect = 'true';
            selectModeBtn.addEventListener('click', () => this.toggleSelectionMode());
        }

        const selectAllBtn = document.getElementById('browse-select-all-btn');
        if (selectAllBtn && !selectAllBtn.dataset.boundSelectAll) {
            selectAllBtn.dataset.boundSelectAll = 'true';
            selectAllBtn.addEventListener('click', () => this.selectAllVisible());
        }

        const clearSelectionBtn = document.getElementById('browse-clear-selection-btn');
        if (clearSelectionBtn && !clearSelectionBtn.dataset.boundClear) {
            clearSelectionBtn.dataset.boundClear = 'true';
            clearSelectionBtn.addEventListener('click', () => this.clearSelection());
        }

        const printSelectedBtn = document.getElementById('browse-print-selected-btn');
        if (printSelectedBtn && !printSelectedBtn.dataset.boundPrintSel) {
            printSelectedBtn.dataset.boundPrintSel = 'true';
            printSelectedBtn.addEventListener('click', () => this.openPdfModal());
        }
    }

    getOrCreateSentinel() {
        const browseContainer = document.getElementById('browse');
        if (!browseContainer) return null;

        let sentinel = document.getElementById('browse-sentinel');
        if (!sentinel) {
            sentinel = document.createElement('div');
            sentinel.id = 'browse-sentinel';
            sentinel.className = 'browse-sentinel';
            sentinel.setAttribute('aria-hidden', 'true');
            sentinel.style.cssText = 'height: 20px; width: 100%; margin: 10px 0; pointer-events: none; opacity: 0;';
            browseContainer.appendChild(sentinel);
        }
        return sentinel;
    }

    setupInfiniteScroll() {
        const vocabularyGrid = document.getElementById('vocabulary-grid');
        const browseContainer = document.getElementById('browse');
        if (!vocabularyGrid || !browseContainer) {
            return;
        }

        // Clean up previous listeners
        if (this.scrollCleanupHandlers && this.scrollCleanupHandlers.length > 0) {
            this.scrollCleanupHandlers.forEach(cleanup => {
                try { cleanup(); } catch { /* noop */ }
            });
            this.scrollCleanupHandlers = [];
        }

        if (this.intersectionObserver) {
            this.intersectionObserver.disconnect();
            this.intersectionObserver = null;
        }

        const sentinel = this.getOrCreateSentinel();

        // 1. Modern IntersectionObserver for automatic scroll detection across containers
        if (typeof window !== 'undefined' && 'IntersectionObserver' in window && sentinel) {
            this.intersectionObserver = new IntersectionObserver((entries) => {
                const entry = entries[0];
                if (entry && entry.isIntersecting) {
                    if (this.app.browseState && !this.app.browseState.loading && this.app.browseState.hasMore) {
                        this.loadMoreVocabulary();
                    }
                }
            }, {
                root: null,
                rootMargin: '300px 0px',
                threshold: 0
            });
            this.intersectionObserver.observe(sentinel);
        }

        // 2. Multi-target scroll listener with rAF throttling
        let ticking = false;
        const handleScroll = () => {
            if (!this.app.browseState || this.app.browseState.loading || !this.app.browseState.hasMore) {
                return;
            }

            // Check desktop container overflow scroll
            if (browseContainer.scrollHeight > browseContainer.clientHeight) {
                if (browseContainer.scrollTop + browseContainer.clientHeight >= browseContainer.scrollHeight - 300) {
                    this.loadMoreVocabulary();
                    return;
                }
            }

            // Check document / window scroll
            const doc = document.documentElement;
            const windowScrollTop = window.pageYOffset || (doc && doc.scrollTop) || (document.body && document.body.scrollTop) || 0;
            const windowHeight = window.innerHeight || (doc && doc.clientHeight) || 0;
            const docHeight = Math.max(
                (doc && doc.scrollHeight) || 0,
                (document.body && document.body.scrollHeight) || 0
            );

            if (windowScrollTop + windowHeight >= docHeight - 300) {
                this.loadMoreVocabulary();
            }
        };

        const onScroll = () => {
            if (!ticking) {
                if (typeof window !== 'undefined' && typeof window.requestAnimationFrame === 'function') {
                    window.requestAnimationFrame(() => {
                        handleScroll();
                        ticking = false;
                    });
                } else {
                    handleScroll();
                    ticking = false;
                }
                ticking = true;
            }
        };

        this.app.scrollListener = onScroll;

        window.addEventListener('scroll', onScroll, { passive: true });
        document.addEventListener('scroll', onScroll, { capture: true, passive: true });
        browseContainer.addEventListener('scroll', onScroll, { passive: true });

        this.scrollCleanupHandlers = [
            () => window.removeEventListener('scroll', onScroll),
            () => document.removeEventListener('scroll', onScroll, { capture: true }),
            () => browseContainer.removeEventListener('scroll', onScroll)
        ];
    }

    checkIfNeedMoreContent() {
        if (!this.app.browseState || this.app.browseState.loading || !this.app.browseState.hasMore) {
            return;
        }

        const browseContainer = document.getElementById('browse');
        const sentinel = document.getElementById('browse-sentinel');
        if (!browseContainer || !sentinel) return;

        const isVisible = browseContainer.offsetParent !== null || (typeof window !== 'undefined' && window.getComputedStyle(browseContainer).display !== 'none');
        if (!isVisible) return;

        const rect = sentinel.getBoundingClientRect();
        const clientHeight = window.innerHeight || document.documentElement.clientHeight;
        const inViewport = rect.height > 0 && rect.top > 0 && rect.top <= clientHeight + 100;
        const containerHasNoOverflow = browseContainer.clientHeight > 0 && browseContainer.scrollHeight <= browseContainer.clientHeight;

        if (inViewport || containerHasNoOverflow) {
            setTimeout(() => {
                if (this.app.browseState && !this.app.browseState.loading && this.app.browseState.hasMore) {
                    this.loadMoreVocabulary();
                }
            }, 60);
        }
    }

    loadMoreVocabulary() {
        if (!this.app.browseState || this.app.browseState.loading || !this.app.browseState.hasMore) {
            return;
        }

        this.app.browseState.loading = true;
        this.showLoadingIndicator();

        const startIndex = this.app.browseState.currentPage * this.app.browseState.itemsPerPage;
        const endIndex = startIndex + this.app.browseState.itemsPerPage;
        const nextBatch = this.app.browseState.filteredVocabulary.slice(startIndex, endIndex);

        if (nextBatch.length === 0) {
            this.app.browseState.hasMore = false;
            this.app.browseState.loading = false;
            this.hideLoadingIndicator();
            this.showNoMoreItemsIndicator();
            return;
        }

        this.renderVocabularyBatch(nextBatch);
        this.app.browseState.displayedItems.push(...nextBatch);
        this.app.browseState.currentPage += 1;
        this.app.browseState.loading = false;
        this.hideLoadingIndicator();

        if (this.app.browseState.displayedItems.length >= this.app.browseState.filteredVocabulary.length) {
            this.app.browseState.hasMore = false;
            this.showNoMoreItemsIndicator();
        } else {
            this.checkIfNeedMoreContent();
        }
    }

    filterVocabulary() {
        const searchInput = document.getElementById('search-input');
        const levelFilter = document.getElementById('browse-level-filter');
        const vocabularyGrid = document.getElementById('vocabulary-grid');
        const browseStats = document.getElementById('browse-stats');

        if (!vocabularyGrid) {
            return;
        }

        const searchTerm = searchInput ? searchInput.value.toLowerCase().trim() : '';
        const selectedLevel = levelFilter ? levelFilter.value : 'all';

        let filteredVocab = this.app.vocabulary || [];

        if (selectedLevel !== 'all') {
            filteredVocab = filteredVocab.filter(word => Number(word.level) === Number(selectedLevel));
        }

        if (searchTerm) {
            filteredVocab = filteredVocab.filter(word =>
                (word.character && word.character.includes(searchTerm)) ||
                (word.pinyin && word.pinyin.toLowerCase().includes(searchTerm)) ||
                (word.english && word.english.toLowerCase().includes(searchTerm)) ||
                (word.translation && word.translation.toLowerCase().includes(searchTerm)) ||
                (word.spanish && word.spanish.toLowerCase().includes(searchTerm))
            );
        }

        const sortOrderSelect = document.getElementById('browse-sort-order');
        const sortOrder = sortOrderSelect ? sortOrderSelect.value : 'lesson';

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

        if (!this.app.browseState) {
            this.app.browseState = {
                currentPage: 0,
                itemsPerPage: 30
            };
        }

        this.app.browseState.filteredVocabulary = filteredVocab;
        this.app.browseState.displayedItems = [];
        this.app.browseState.currentPage = 0;
        this.app.browseState.hasMore = filteredVocab.length > 0;
        this.app.browseState.loading = false;

        if (browseStats) {
            browseStats.textContent = (this.app.getTranslation && this.app.getTranslation('wordsFound', { count: filteredVocab.length })) || ('Found ' + filteredVocab.length + ' words');
        }

        vocabularyGrid.innerHTML = '';
        this.hideNoMoreItemsIndicator();
        this.hideLoadingIndicator();

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
        const isSelected = this.selectedWords.has(word.character);
        if (isSelected) {
            card.classList.add('is-card-selected');
        }
        
        // Split word into characters to render each in a calligraphic box if there are 2 or more characters
        const chars = Array.from(word.character || '');
        const tones = (this.app.getTonesFromPinyin && this.app.getTonesFromPinyin(word.pinyin || '')) || [];
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
            characterHtml = `<div class="vocab-character tone-${tone}">` + (word.character || '') + '</div>';
        }

        const leadTone = tones[0] !== undefined ? tones[0] : 0;
        card.classList.add('tone-spine-' + leadTone);

        const ariaLabel = ((word.character || '') + ' ' + (word.pinyin || '')).replace(/"/g, '');
        const pinyinHtml = this.app.colorPinyinByTone ? this.app.colorPinyinByTone(word.pinyin || '') : (word.pinyin || '');
        const escapedChar = (word.character || '').replace(/"/g, '&quot;');

        card.innerHTML =
            '<label class="vocab-card-select-label" title="Seleccionar para PDF">' +
                '<input type="checkbox" class="vocab-card-select-checkbox" data-character="' + escapedChar + '"' + (isSelected ? ' checked' : '') + '>' +
                '<span class="vocab-card-select-custom"></span>' +
            '</label>' +
            '<button type="button" class="vocab-card-main" aria-label="' + ariaLabel + '">' +
                characterHtml +
                '<div class="vocab-pinyin">' + pinyinHtml + '</div>' +
                '<div class="vocab-meaning">' + meaning + '</div>' +
            '</button>' +
            '<div class="vocab-card-footer">' +
                '<span class="vocab-level">HSK ' + (word.level || 1) + '</span>' +
                '<button type="button" class="vocab-audio-btn" title="' + ((this.app.getTranslation && this.app.getTranslation('playPronunciation')) || 'Play pronunciation') + '" aria-label="' + ((this.app.getTranslation && this.app.getTranslation('playPronunciation')) || 'Play pronunciation') + '">' +
                    '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
                        '<polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>' +
                        '<path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path>' +
                        '<path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path>' +
                    '</svg>' +
                '</button>' +
            '</div>';

        const checkbox = card.querySelector('.vocab-card-select-checkbox');
        if (checkbox) {
            checkbox.addEventListener('change', (e) => {
                e.stopPropagation();
                this.toggleWordSelection(word.character, card, checkbox.checked);
            });
            checkbox.addEventListener('click', (e) => {
                e.stopPropagation();
            });
        }

        const mainBtn = card.querySelector('.vocab-card-main');
        if (mainBtn) {
            mainBtn.addEventListener('click', () => {
                if (this.isSelectionMode) {
                    const cb = card.querySelector('.vocab-card-select-checkbox');
                    if (cb) {
                        cb.checked = !cb.checked;
                        this.toggleWordSelection(word.character, card, cb.checked);
                    }
                    return;
                }
                if (typeof this.app.selectVocabWord === 'function') {
                    this.app.selectVocabWord(word);
                }
            });
        }

        const audioBtn = card.querySelector('.vocab-audio-btn');
        if (audioBtn) {
            audioBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                if (typeof this.app.playAudio === 'function') {
                    this.app.playAudio(word.character);
                }
            });
        }

        return card;
    }

    async getPdfController() {
        if (this.app && this.app.flashcardPdfController) {
            return this.app.flashcardPdfController;
        }
        if (typeof window !== 'undefined' && !window.FlashcardPdfController) {
            if (this.app && this.app.uiController && typeof this.app.uiController.loadScript === 'function') {
                await this.app.uiController.loadScript("assets/js/modules/flashcard-pdf-controller.js");
                await this.app.uiController.loadStylesheet("assets/css/flashcard-pdf-styles.css");
            } else {
                await new Promise((resolve, reject) => {
                    const s = document.createElement('script');
                    s.src = 'assets/js/modules/flashcard-pdf-controller.js';
                    s.onload = resolve;
                    s.onerror = reject;
                    document.head.appendChild(s);
                });
            }
        }
        const controller = new window.FlashcardPdfController(this.app);
        if (this.app) {
            this.app.flashcardPdfController = controller;
        }
        return controller;
    }

    async openPdfModal() {
        try {
            const pdfCtrl = await this.getPdfController();
            const levelFilter = document.getElementById('browse-level-filter');
            const currentLevel = levelFilter ? levelFilter.value : (this.app.currentLevel || 1);

            pdfCtrl.openModal({
                source: "browse",
                vocabulary: this.app.vocabulary || [],
                filteredVocabulary: (this.app.browseState && this.app.browseState.filteredVocabulary) || [],
                selectedItems: this.selectedWords,
                currentLevel: currentLevel
            });
        } catch (err) {
            console.error("Error opening PDF modal:", err);
        }
    }

    toggleSelectionMode(forceState) {
        this.isSelectionMode = typeof forceState === 'boolean' ? forceState : !this.isSelectionMode;
        const browseContainer = document.getElementById('browse');
        if (browseContainer) {
            browseContainer.classList.toggle('selection-mode-active', this.isSelectionMode);
        }
        const selectModeBtn = document.getElementById('browse-select-mode-btn');
        if (selectModeBtn) {
            selectModeBtn.classList.toggle('is-active', this.isSelectionMode);
        }
        this.updateSelectionUI();
    }

    toggleWordSelection(character, card, isChecked) {
        if (!character) return;
        if (isChecked) {
            this.selectedWords.add(character);
            if (card) card.classList.add('is-card-selected');
        } else {
            this.selectedWords.delete(character);
            if (card) card.classList.remove('is-card-selected');
        }
        this.updateSelectionUI();
    }

    selectAllVisible() {
        const displayed = (this.app.browseState && this.app.browseState.displayedItems) || [];
        displayed.forEach(word => {
            if (word && word.character) {
                this.selectedWords.add(word.character);
            }
        });
        const checkboxes = document.querySelectorAll('.vocab-card-select-checkbox');
        checkboxes.forEach(cb => {
            cb.checked = true;
            const card = cb.closest('.vocab-card');
            if (card) card.classList.add('is-card-selected');
        });
        this.updateSelectionUI();
    }

    clearSelection() {
        this.selectedWords.clear();
        const checkboxes = document.querySelectorAll('.vocab-card-select-checkbox');
        checkboxes.forEach(cb => {
            cb.checked = false;
            const card = cb.closest('.vocab-card');
            if (card) card.classList.remove('is-card-selected');
        });
        this.updateSelectionUI();
    }

    updateSelectionUI() {
        const count = this.selectedWords.size;
        const selectionBar = document.getElementById('browse-selection-bar');
        const badge = document.getElementById('browse-selected-count-badge');
        const selectedText = document.getElementById('browse-selected-text');
        const printSelectedText = document.getElementById('browse-print-selected-text');

        if (badge) {
            badge.textContent = count;
            badge.style.display = count > 0 ? 'inline-block' : 'none';
        }

        if (selectedText) {
            selectedText.textContent = (this.app.getTranslation && this.app.getTranslation('selectedCount', { count })) || (count + ' seleccionadas');
        }

        if (printSelectedText) {
            printSelectedText.textContent = (this.app.getTranslation && this.app.getTranslation('printSelected', { count })) || ('Generar PDF (' + count + ')');
        }

        if (selectionBar) {
            selectionBar.style.display = (this.isSelectionMode || count > 0) ? 'flex' : 'none';
        }
    }

    showLoadingIndicator() {
        const browseContainer = document.getElementById('browse');
        if (!browseContainer) {
            return;
        }

        let loadingIndicator = document.getElementById('browse-loading');
        if (!loadingIndicator) {
            loadingIndicator = document.createElement('div');
            loadingIndicator.id = 'browse-loading';
            loadingIndicator.className = 'browse-loading';
            loadingIndicator.innerHTML =
                '<div class="loading-spinner"></div>' +
                '<div class="loading-text">' + ((this.app.getTranslation && this.app.getTranslation('loadingMoreVocabulary')) || 'Loading more vocabulary...') + '</div>';
            
            const sentinel = document.getElementById('browse-sentinel');
            if (sentinel) {
                browseContainer.insertBefore(loadingIndicator, sentinel);
            } else {
                browseContainer.appendChild(loadingIndicator);
            }
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
        const browseContainer = document.getElementById('browse');
        if (!browseContainer) {
            return;
        }

        let noMoreIndicator = document.getElementById('browse-no-more');
        if (!noMoreIndicator) {
            noMoreIndicator = document.createElement('div');
            noMoreIndicator.id = 'browse-no-more';
            noMoreIndicator.className = 'browse-no-more';
            noMoreIndicator.innerHTML =
                '<div class="no-more-text">' + ((this.app.getTranslation && this.app.getTranslation('allVocabularyLoaded')) || '[✓] All vocabulary loaded!') + '</div>';
            
            const sentinel = document.getElementById('browse-sentinel');
            if (sentinel) {
                browseContainer.insertBefore(noMoreIndicator, sentinel);
            } else {
                browseContainer.appendChild(noMoreIndicator);
            }
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
            '<div class="no-results-icon">🔍</div>' +
            '<h4>' + ((this.app.getTranslation && this.app.getTranslation('noVocabularyFound')) || 'No words found') + '</h4>' +
            '<p>' + ((this.app.getTranslation && this.app.getTranslation('tryAdjustingSearch')) || 'Try adjusting the search or filters.') + '</p>' +
            '</div>';
    }

    exportToAnkiCsv() {
        const vocabList = this.app.browseState?.filteredVocabulary || this.app.vocabulary || [];
        if (vocabList.length === 0) {
            if (this.app.showNotification) {
                this.app.showNotification('No hay vocabulario para exportar', 'warning');
            }
            return;
        }

        let csvContent = 'Hanzi\tPinyin\tMeaning\tLevel\n';
        vocabList.forEach(item => {
            const hanzi = (item.character || '').replace(/"/g, '""');
            const pinyin = (item.pinyin || '').replace(/"/g, '""');
            const meaning = (this.getMeaningForLanguage(item) || '').replace(/"/g, '""');
            const level = item.level || 1;
            csvContent += `"${hanzi}"\t"${pinyin}"\t"${meaning}"\t"HSK ${level}"\n`;
        });

        const blob = new Blob([csvContent], { type: 'text/tab-separated-values;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `hsk_vocab_anki_export.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        if (this.app.showNotification) {
            this.app.showNotification(`¡Exportadas ${vocabList.length} palabras a CSV para Anki!`, 'success');
        }
    }
}

window.BrowseController = BrowseController;
