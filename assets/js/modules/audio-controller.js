class AudioController {
    constructor(app) {
        this.app = app;
        this.synth = new AudioSynthesizer();
    }

    playGameCoin() {
        if (!this.app.isAudioEnabled) return;
        this.synth.playCoin();
    }

    playGameExplosion() {
        if (!this.app.isAudioEnabled) return;
        this.synth.playExplosion();
    }

    playGameHit() {
        if (!this.app.isAudioEnabled) return;
        this.synth.playHit();
    }

    playGameOver() {
        if (!this.app.isAudioEnabled) return;
        this.synth.playGameOver();
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
        } else {
            // Fallback: replace innerHTML dynamically just like ThemeController does
            if (this.app.isAudioEnabled) {
                audioToggle.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg>';
                audioToggle.classList.add('active');
            } else {
                audioToggle.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><line x1="23" y1="9" x2="17" y2="15"></line><line x1="17" y1="9" x2="23" y2="15"></line></svg>';
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

class AudioSynthesizer {
    constructor() {
        this.ctx = null;
    }

    init() {
        if (!this.ctx) {
            this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    playCoin() {
        try {
            this.init();
            if (!this.ctx || this.ctx.state === 'suspended') return;
            const now = this.ctx.currentTime;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(587.33, now); // D5
            osc.frequency.setValueAtTime(880, now + 0.08); // A5
            gain.gain.setValueAtTime(0.06, now);
            gain.gain.exponentialRampToValueAtTime(0.005, now + 0.3);
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(now);
            osc.stop(now + 0.3);
        } catch (e) {
            console.warn('AudioSynthesizer error:', e);
        }
    }

    playHit() {
        try {
            this.init();
            if (!this.ctx || this.ctx.state === 'suspended') return;
            const now = this.ctx.currentTime;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(140, now);
            osc.frequency.exponentialRampToValueAtTime(35, now + 0.15);
            gain.gain.setValueAtTime(0.12, now);
            gain.gain.exponentialRampToValueAtTime(0.005, now + 0.15);
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(now);
            osc.stop(now + 0.15);
        } catch (e) {
            console.warn('AudioSynthesizer error:', e);
        }
    }

    playExplosion() {
        try {
            this.init();
            if (!this.ctx || this.ctx.state === 'suspended') return;
            const now = this.ctx.currentTime;

            const bufferSize = this.ctx.sampleRate * 0.35;
            const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
            const data = buffer.getChannelData(0);
            for (let i = 0; i < bufferSize; i++) {
                data[i] = Math.random() * 2 - 1;
            }

            const noise = this.ctx.createBufferSource();
            noise.buffer = buffer;

            const filter = this.ctx.createBiquadFilter();
            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(600, now);
            filter.frequency.exponentialRampToValueAtTime(40, now + 0.35);

            const gain = this.ctx.createGain();
            gain.gain.setValueAtTime(0.15, now);
            gain.gain.exponentialRampToValueAtTime(0.005, now + 0.35);

            noise.connect(filter);
            filter.connect(gain);
            gain.connect(this.ctx.destination);

            noise.start(now);
            noise.stop(now + 0.35);
        } catch (e) {
            console.warn('AudioSynthesizer error:', e);
        }
    }

    playGameOver() {
        try {
            this.init();
            if (!this.ctx || this.ctx.state === 'suspended') return;
            const now = this.ctx.currentTime;
            const notes = [293.66, 277.18, 261.63, 196.00]; // D4, C#4, C4, G3
            const durations = [0.12, 0.12, 0.12, 0.4];
            let time = now;

            notes.forEach((freq, idx) => {
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                osc.type = 'triangle';
                osc.frequency.setValueAtTime(freq, time);

                gain.gain.setValueAtTime(0.08, time);
                gain.gain.exponentialRampToValueAtTime(0.005, time + durations[idx]);

                osc.connect(gain);
                gain.connect(this.ctx.destination);
                osc.start(time);
                osc.stop(time + durations[idx]);

                time += durations[idx] * 0.85;
            });
        } catch (e) {
            console.warn('AudioSynthesizer error:', e);
        }
    }
}

window.AudioController = AudioController;
