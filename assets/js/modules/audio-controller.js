class AudioController {
    constructor(app) {
        this.app = app;
    }

    toggleAudio() {
        this.app.isAudioEnabled = !this.app.isAudioEnabled;
        localStorage.setItem('hsk-audio-enabled', this.app.isAudioEnabled.toString());
        this.updateAudioButton();

        const message = this.app.isAudioEnabled
            ? (this.app.getTranslation('audioEnabledMsg') || 'Audio enabled')
            : (this.app.getTranslation('audioDisabledMsg') || 'Audio disabled');
        this.app.showHeaderNotification(message);

        this.app.logDebug('[audio] Toggled: ' + (this.app.isAudioEnabled ? 'enabled' : 'disabled'));
    }

    updateAudioButton() {
        const audioToggle = document.getElementById('audio-toggle');
        if (!audioToggle) {
            return;
        }

        const audioToggleLabel = this.app.isAudioEnabled
            ? (this.app.getTranslation('disableAudio') || 'Disable audio')
            : (this.app.getTranslation('enableAudio') || 'Enable audio');

        audioToggle.title = audioToggleLabel;
        audioToggle.setAttribute('aria-label', audioToggleLabel);
        audioToggle.setAttribute('data-tooltip', audioToggleLabel);

        const onIcon = audioToggle.querySelector('.audio-on-icon');
        const offIcon = audioToggle.querySelector('.audio-off-icon');

        if (onIcon && offIcon) {
            if (this.app.isAudioEnabled) {
                onIcon.style.display = 'inline';
                offIcon.style.display = 'none';
                audioToggle.classList.add('active');
            } else {
                onIcon.style.display = 'none';
                offIcon.style.display = 'inline';
                audioToggle.classList.remove('active');
            }
        }
    }

    playAudio(text) {
        if (!this.app.isAudioEnabled || !('speechSynthesis' in window)) {
            this.app.logDebug('[audio] Disabled or unsupported');
            return;
        }

        try {
            speechSynthesis.cancel();

            setTimeout(() => {
                const utterance = new SpeechSynthesisUtterance(text);
                utterance.lang = 'zh-CN';
                utterance.rate = 0.7;
                utterance.pitch = 1.0;
                utterance.volume = 0.9;

                const selectedVoice = this.getPreferredVoice();
                if (selectedVoice) {
                    utterance.voice = selectedVoice;
                    this.app.logDebug('[audio] Voice selected:', selectedVoice.name);
                }

                utterance.onstart = () => {
                    this.app.logDebug('[audio] Playback started');
                    this.showAudioFeedback(true);
                };

                utterance.onerror = (event) => {
                    this.app.logWarn('[audio] Playback error:', event.error);
                    this.showAudioFeedback(false);
                };

                utterance.onend = () => {
                    this.app.logDebug('[audio] Playback completed');
                    this.showAudioFeedback(false);
                };

                speechSynthesis.speak(utterance);
            }, 100);
        } catch (error) {
            this.app.logWarn('[audio] Playback failed:', error);
            this.showAudioFeedback(false);
        }
    }

    initializeVoices() {
        if (!('speechSynthesis' in window)) {
            return;
        }

        const voices = speechSynthesis.getVoices();
        this.app.availableVoices = voices;

        const chineseVoices = voices.filter(voice =>
            voice.lang.includes('zh') ||
            voice.name.toLowerCase().includes('chinese') ||
            voice.name.toLowerCase().includes('mandarin')
        );

        this.app.chineseVoices = { male: null, female: null };
        chineseVoices.forEach(voice => {
            const name = voice.name.toLowerCase();
            if (name.includes('female') || name.includes('woman') || name.includes('mei')) {
                this.app.chineseVoices.female = voice;
            } else if (name.includes('male') || name.includes('man') || name.includes('wang')) {
                this.app.chineseVoices.male = voice;
            } else if (!this.app.chineseVoices.male) {
                this.app.chineseVoices.male = voice;
            } else if (!this.app.chineseVoices.female) {
                this.app.chineseVoices.female = voice;
            }
        });

        this.app.logDebug('[audio] Chinese voices ready', {
            male: this.app.chineseVoices.male ? this.app.chineseVoices.male.name : 'None',
            female: this.app.chineseVoices.female ? this.app.chineseVoices.female.name : 'None',
            total: chineseVoices.length
        });
    }

    getPreferredVoice() {
        switch (this.app.selectedVoice) {
            case 'male':
                return this.app.chineseVoices.male || this.app.chineseVoices.female;
            case 'female':
                return this.app.chineseVoices.female || this.app.chineseVoices.male;
            case 'auto':
            default:
                return this.app.chineseVoices.male || this.app.chineseVoices.female;
        }
    }

    setVoicePreference(voiceType) {
        this.app.selectedVoice = voiceType;
        localStorage.setItem('hsk-voice-preference', voiceType);

        this.playAudio('你好');

        const voiceNames = {
            male: this.app.currentLanguage === 'es' ? 'Voz masculina' : 'Male voice',
            female: this.app.currentLanguage === 'es' ? 'Voz femenina' : 'Female voice',
            auto: this.app.currentLanguage === 'es' ? 'Voz automática' : 'Auto voice'
        };

        const selectedName = voiceNames[voiceType] || voiceType;
        const message = selectedName + ' ' + (this.app.currentLanguage === 'es' ? 'seleccionada' : 'selected');
        this.app.showHeaderNotification(message);

        this.app.logDebug('[audio] Voice preference set to: ' + voiceType);
    }

    loadVoicePreference() {
        const savedVoice = localStorage.getItem('hsk-voice-preference');
        if (savedVoice) {
            this.app.selectedVoice = savedVoice;
            this.app.logDebug('[audio] Loaded voice preference: ' + savedVoice);
        }
    }

    updateVoiceSelector() {
        const voiceSelect = document.getElementById('voice-select');
        if (voiceSelect) {
            voiceSelect.value = this.app.selectedVoice;
        }
    }

    showAudioFeedback(isPlaying) {
        const audioButtons = document.querySelectorAll('.vocab-audio-btn, #audio-toggle');
        audioButtons.forEach(button => {
            if (isPlaying) {
                button.style.animation = 'pulse 1s ease-in-out infinite';
                button.style.color = '#f59e0b';
            } else {
                button.style.animation = '';
                button.style.color = '';
            }
        });
    }
}

window.AudioController = AudioController;
