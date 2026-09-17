import { beforeEach, describe, expect, it, vi } from "vitest";

import "../../assets/js/modules/past-exams-question-bank.js";
import "../../assets/js/modules/past-exams-controller.js";

const setupDOM = () => {
    document.body.innerHTML = `
        <div id="past-exams">
            <div id="past-exams-setup">
                <select id="past-exam-level">
                    <option value="1" selected>HSK 1</option>
                    <option value="all">All levels</option>
                </select>
                <select id="past-exam-section">
                    <option value="all" selected>Todas</option>
                    <option value="listening">Listening</option>
                    <option value="reading">Reading</option>
                </select>
                <select id="past-exam-questions">
                    <option value="5" selected>5</option>
                    <option value="10">10</option>
                </select>
                <div id="past-exam-timer-group">
                    <select id="past-exam-time-limit">
                        <option value="auto" selected>Auto</option>
                        <option value="10">10</option>
                        <option value="none">None</option>
                    </select>
                </div>
                <input id="past-exam-sim-mode" type="checkbox" checked />
                <input id="past-exam-official-only" type="checkbox" />
                <button id="start-past-exam">Start</button>
            </div>

            <div id="past-exams-container" style="display: none;">
                <div class="quiz-header">
                    <span id="past-exam-current">1</span>
                    <span id="past-exam-total">5</span>
                    <span id="past-exam-score-label">Answered</span>
                    <span id="past-exam-score">0/5</span>
                    <div id="past-exam-timer-badge" style="display: none;">
                        <span id="past-exam-timer-val">15:00</span>
                    </div>
                </div>

                <div id="past-exam-nav-wrapper">
                    <div id="past-exam-nav-grid"></div>
                </div>

                <div id="past-exam-pool-summary" style="display: none;"></div>

                <div id="past-exam-content">
                    <div id="past-exam-audio-container" style="display: none;">
                        <button id="past-exam-play-audio-btn">Play</button>
                        <span id="past-exam-audio-plays"></span>
                    </div>
                    <div id="past-exam-question"></div>
                    <div id="past-exam-options"></div>
                    <div class="past-exam-actions-bar">
                        <button id="past-exam-flag-btn">Flag</button>
                        <button id="past-exam-prev" style="display: none;">Prev</button>
                        <button id="past-exam-submit" disabled>Submit</button>
                        <button id="past-exam-next" style="display: none;">Next</button>
                        <button id="past-exam-finish-btn" style="display: none;">Finish</button>
                    </div>
                </div>
            </div>

            <div id="past-exams-results" style="display: none;">
                <strong id="past-exam-final-score">0/0</strong>
                <span id="past-exam-final-percentage">0%</span>
                <div id="past-exam-scaled-score"></div>
                <div id="past-exam-grade-badge"></div>
                <div id="past-exam-sections-breakdown"></div>
                <button id="restart-past-exam">Restart</button>
                <button id="past-exam-retry-mistakes" style="display: none;">Retry Mistakes</button>
                <button id="past-exam-view-cert" style="display: none;">View Cert</button>
                <button id="new-past-exam">New Exam</button>
                <div id="past-exam-review-wrapper">
                    <div id="past-exam-review-list"></div>
                </div>
            </div>

            <div id="past-exam-cert-modal" style="display: none;">
                <button id="past-exam-cert-close">Close</button>
                <span id="cert-candidate-name"></span>
                <span id="cert-level"></span>
                <span id="cert-date"></span>
                <span id="cert-max-score"></span>
                <span id="cert-total-score"></span>
                <div id="cert-table-rows"></div>
            </div>
        </div>
    `;
};

const stubApp = () => ({
    currentLanguage: "es",
    vocabulary: [
        { character: "你好", pinyin: "nǐ hǎo", english: "hello", spanish: "hola", level: 1 },
        { character: "谢谢", pinyin: "xièxie", english: "thank you", spanish: "gracias", level: 1 },
        { character: "再见", pinyin: "zàijiàn", english: "goodbye", spanish: "adiós", level: 1 },
        { character: "苹果", pinyin: "píngguǒ", english: "apple", spanish: "manzana", level: 1 },
        { character: "医生", pinyin: "yīshēng", english: "doctor", spanish: "médico", level: 1 }
    ],
    pastExamQuestionBank: [
        {
            id: "test-reading-1",
            hskLevel: 1,
            examSetId: "sample-a",
            sectionType: "reading",
            audioRequired: false,
            prompt: { es: "¿Qué significa 你好?", en: "What does 你好 mean?" },
            options: [
                { key: "A", label: { es: "hola", en: "hello" } },
                { key: "B", label: { es: "adiós", en: "goodbye" } },
                { key: "C", label: { es: "gracias", en: "thank you" } },
                { key: "D", label: { es: "agua", en: "water" } }
            ],
            answer: "A",
            explanation: { es: "你好 significa hola.", en: "你好 means hello." }
        },
        {
            id: "test-listening-1",
            hskLevel: 1,
            examSetId: "sample-a",
            sectionType: "listening",
            audioRequired: true,
            audioText: "你好，请问洗手间在哪儿？",
            prompt: { es: "Escucha el audio: ¿Qué busca?", en: "Listen: What is the person looking for?" },
            options: [
                { key: "A", label: { es: "El baño", en: "Restroom" } },
                { key: "B", label: { es: "El restaurante", en: "Restaurant" } },
                { key: "C", label: { es: "La tienda", en: "Shop" } },
                { key: "D", label: { es: "El hotel", en: "Hotel" } }
            ],
            answer: "A",
            explanation: { es: "洗手间 significa baño.", en: "洗手间 means restroom." }
        },
        {
            id: "test-writing-1",
            hskLevel: 1,
            examSetId: "sample-a",
            sectionType: "writing",
            audioRequired: false,
            prompt: { es: "Selecciona el caracter para manzana:", en: "Select character for apple:" },
            options: [
                { key: "A", label: { es: "苹果", en: "苹果" } },
                { key: "B", label: { es: "医生", en: "医生" } },
                { key: "C", label: { es: "谢谢", en: "谢谢" } },
                { key: "D", label: { es: "再见", en: "再见" } }
            ],
            answer: "A"
        }
    ],
    getTranslation: (k) => k,
    showToast: vi.fn(),
    logDebug: vi.fn(),
    logWarn: vi.fn(),
    logError: vi.fn(),
    audioController: {
        playWordAudio: vi.fn()
    },
    userProfile: {
        displayName: "Test Candidate"
    }
});

describe("PastExamsQuestionBank", () => {
    it("filters static questions and isolates listening audio questions", () => {
        const app = stubApp();
        const qb = new window.PastExamsQuestionBank(app);

        // Section 'all' should never include audio questions
        const allQuestions = qb.getFilteredStaticQuestions("1", "all");
        expect(allQuestions.every((q) => q.audioRequired !== true)).toBe(true);

        // Section 'listening' should include audio questions
        const listeningQuestions = qb.getFilteredStaticQuestions("1", "listening");
        expect(listeningQuestions.length).toBe(1);
        expect(listeningQuestions[0].sectionType).toBe("listening");
        expect(listeningQuestions[0].audioRequired).toBe(true);
    });

    it("generates procedural listening questions when requested", () => {
        const app = stubApp();
        const qb = new window.PastExamsQuestionBank(app);

        const word = { character: "水", pinyin: "shuǐ", english: "water", spanish: "agua", level: 1 };
        const generated = qb.createGeneratedQuestion(word, "listening", app.vocabulary, 0);

        expect(generated).not.toBeNull();
        expect(generated.sectionType).toBe("listening");
        expect(generated.audioRequired).toBe(true);
        expect(generated.audioText).toBe("水");
        expect(generated.options.length).toBe(4);
    });
});

describe("PastExamsController", () => {
    let app;
    let controller;

    beforeEach(() => {
        setupDOM();
        app = stubApp();
        controller = new window.PastExamsController(app);
    });

    it("initializes and attaches event listeners idempotently", async () => {
        await controller.initialize();
        expect(controller.state.ready).toBe(true);
        expect(controller.listenersAttached).toBe(true);

        // Second initialize should be safe
        await controller.initialize();
        expect(controller.listenersAttached).toBe(true);
    });

    it("starts official simulation mode with navigator grid and timer", async () => {
        await controller.startExam();

        expect(controller.state.isActive).toBe(true);
        expect(controller.state.isSimulationMode).toBe(true);
        expect(controller.state.questions.length).toBeGreaterThan(0);

        const grid = document.getElementById("past-exam-nav-grid");
        expect(grid.children.length).toBe(controller.state.questions.length);

        const timerBadge = document.getElementById("past-exam-timer-badge");
        expect(timerBadge.style.display).not.toBe("none");
        controller.stopTimer();
    });

    it("allows free navigation between questions in simulation mode", async () => {
        await controller.startExam();

        expect(controller.state.currentQuestion).toBe(0);

        controller.nextQuestion();
        expect(controller.state.currentQuestion).toBe(1);

        controller.prevQuestion();
        expect(controller.state.currentQuestion).toBe(0);

        controller.goToQuestion(2);
        expect(controller.state.currentQuestion).toBe(2);

        controller.stopTimer();
    });

    it("records answers and updates the navigator grid without immediate feedback", async () => {
        await controller.startExam();

        // Select answer on question 0
        controller.selectAnswer("A");
        expect(controller.state.userAnswers[0]).toBe("A");

        const firstGridBtn = document.querySelector('.past-exam-grid-btn[data-question-index="0"]');
        expect(firstGridBtn.classList.contains("answered")).toBe(true);

        // Can change answer freely before submission
        controller.selectAnswer("B");
        expect(controller.state.userAnswers[0]).toBe("B");

        controller.stopTimer();
    });

    it("allows flagging and unflagging questions (🚩)", async () => {
        await controller.startExam();

        controller.toggleFlagQuestion();
        expect(controller.state.flaggedQuestions.has(0)).toBe(true);

        const firstGridBtn = document.querySelector('.past-exam-grid-btn[data-question-index="0"]');
        expect(firstGridBtn.classList.contains("flagged")).toBe(true);

        // Toggle again unflags
        controller.toggleFlagQuestion();
        expect(controller.state.flaggedQuestions.has(0)).toBe(false);
        expect(firstGridBtn.classList.contains("flagged")).toBe(false);

        controller.stopTimer();
    });

    it("plays listening audio and respects max play limit", async () => {
        // Force a listening question
        const listeningQ = app.pastExamQuestionBank.find((q) => q.sectionType === "listening");
        await controller.startExam([listeningQ]);

        const audioContainer = document.getElementById("past-exam-audio-container");
        expect(audioContainer.style.display).toBe("flex");

        // Play 1
        controller.playCurrentAudio();
        expect(app.audioController.playWordAudio).toHaveBeenCalledWith(listeningQ.audioText);
        expect(controller.state.audioPlayCount).toBe(1);

        // Play 2 (max for level 1)
        controller.playCurrentAudio();
        expect(controller.state.audioPlayCount).toBe(2);

        // Play 3 should be blocked
        controller.playCurrentAudio();
        expect(controller.state.audioPlayCount).toBe(2);
        expect(app.showToast).toHaveBeenCalled();

        controller.stopTimer();
    });

    it("evaluates final score, scaled score, grade badge, and review breakdown on finish", async () => {
        const questions = app.pastExamQuestionBank.slice(0, 2);
        await controller.startExam(questions);

        // Answer question 0 correctly ('A')
        controller.goToQuestion(0);
        controller.selectAnswer(questions[0].answer);

        // Answer question 1 incorrectly
        controller.goToQuestion(1);
        controller.selectAnswer("D"); // wrong

        controller.finishExam();

        expect(controller.state.score).toBe(1);
        expect(controller.state.history.length).toBe(2);
        expect(controller.state.mistakes.length).toBe(1);

        // Check DOM results
        const finalScoreEl = document.getElementById("past-exam-final-score");
        expect(finalScoreEl.textContent).toBe("1/2");

        const scaledHost = document.getElementById("past-exam-scaled-score");
        expect(scaledHost.innerHTML).toContain("scaled-points-label");

        const reviewList = document.getElementById("past-exam-review-list");
        expect(reviewList.children.length).toBe(2);

        // Review card contains explanation
        expect(reviewList.innerHTML).toContain("review-explanation");
    });

    it("allows retrying only failed questions via retryMistakes", async () => {
        const questions = app.pastExamQuestionBank.slice(0, 2);
        await controller.startExam(questions);

        // Fail both questions
        controller.goToQuestion(0);
        controller.selectAnswer("Z");
        controller.goToQuestion(1);
        controller.selectAnswer("Z");
        controller.finishExam();

        expect(controller.state.mistakes.length).toBe(2);

        await controller.retryMistakes();
        expect(controller.state.isActive).toBe(true);
        expect(controller.state.questions.length).toBe(2);

        controller.stopTimer();
    });

    it("opens and closes the simulated certificate modal", async () => {
        const questions = app.pastExamQuestionBank.slice(0, 1);
        await controller.startExam(questions);
        controller.selectAnswer(questions[0].answer);
        controller.finishExam();

        controller.showCertificateModal();
        const modal = document.getElementById("past-exam-cert-modal");
        expect(modal.style.display).toBe("flex");
        expect(document.getElementById("cert-candidate-name").textContent).toBe("Test Candidate");

        controller.closeCertificateModal();
        expect(modal.style.display).toBe("none");
    });
});
