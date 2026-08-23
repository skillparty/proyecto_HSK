import { beforeEach, describe, expect, test, vi } from "vitest";

import "../../assets/js/modules/audio-controller.js";

// Mock Web Audio API
class MockAudioNode {
  connect() {}
  disconnect() {}
}

class MockGainNode extends MockAudioNode {
  constructor() {
    super();
    this.gain = {
      setValueAtTime: vi.fn(),
      exponentialRampToValueAtTime: vi.fn(),
    };
  }
}

class MockOscillatorNode extends MockAudioNode {
  constructor() {
    super();
    this.frequency = {
      setValueAtTime: vi.fn(),
      exponentialRampToValueAtTime: vi.fn(),
    };
    this.type = "sine";
  }
  start = vi.fn();
  stop = vi.fn();
}

class MockAudioContext {
  currentTime = 0;
  state = "running";
  sampleRate = 44100;
  destination = new MockAudioNode();

  createGain() {
    return new MockGainNode();
  }
  createOscillator() {
    return new MockOscillatorNode();
  }
  createBuffer(_channels, length, _sampleRate) {
    return {
      getChannelData: () => new Float32Array(length),
    };
  }
  createBufferSource() {
    return {
      buffer: null,
      connect: vi.fn(),
      start: vi.fn(),
      stop: vi.fn(),
    };
  }
  createBiquadFilter() {
    return {
      type: "lowpass",
      frequency: {
        setValueAtTime: vi.fn(),
        exponentialRampToValueAtTime: vi.fn(),
      },
      connect: vi.fn(),
    };
  }
  resume = vi.fn().mockResolvedValue(undefined);
}

beforeEach(() => {
  window.AudioContext = MockAudioContext;
  window.webkitAudioContext = MockAudioContext;
});

describe("AudioSynthesizer", () => {
  test("instantiates and creates context on init", () => {
    const synth = new window.AudioSynthesizer();
    expect(synth.ctx).toBeNull();
    synth.init();
    expect(synth.ctx).toBeInstanceOf(MockAudioContext);
  });

  test("playCoin executes without throwing", () => {
    const synth = new window.AudioSynthesizer();
    expect(() => synth.playCoin()).not.toThrow();
  });

  test("playHit executes without throwing", () => {
    const synth = new window.AudioSynthesizer();
    expect(() => synth.playHit()).not.toThrow();
  });

  test("playExplosion executes without throwing", () => {
    const synth = new window.AudioSynthesizer();
    expect(() => synth.playExplosion()).not.toThrow();
  });

  test("playGameOver executes without throwing", () => {
    const synth = new window.AudioSynthesizer();
    expect(() => synth.playGameOver()).not.toThrow();
  });

  test("playCorrect executes without throwing", () => {
    const synth = new window.AudioSynthesizer();
    expect(() => synth.playCorrect()).not.toThrow();
  });

  test("playIncorrect executes without throwing", () => {
    const synth = new window.AudioSynthesizer();
    expect(() => synth.playIncorrect()).not.toThrow();
  });

  test("playFlip executes without throwing", () => {
    const synth = new window.AudioSynthesizer();
    expect(() => synth.playFlip()).not.toThrow();
  });

  test("playStreakFanfare executes without throwing", () => {
    const synth = new window.AudioSynthesizer();
    expect(() => synth.playStreakFanfare()).not.toThrow();
  });
});

describe("AudioController", () => {
  const stubApp = () => ({
    isAudioEnabled: true,
    getTranslation: (k) => k,
    showHeaderNotification: vi.fn(),
    logDebug: vi.fn(),
    logWarn: vi.fn(),
  });

  test("delegates sound effects to synth when audio is enabled", () => {
    const app = stubApp();
    const controller = new window.AudioController(app);
    const spyCorrect = vi.spyOn(controller.synth, "playCorrect");
    const spyIncorrect = vi.spyOn(controller.synth, "playIncorrect");
    const spyFlip = vi.spyOn(controller.synth, "playFlip");
    const spyFanfare = vi.spyOn(controller.synth, "playStreakFanfare");

    controller.playCorrect();
    expect(spyCorrect).toHaveBeenCalledTimes(1);

    controller.playIncorrect();
    expect(spyIncorrect).toHaveBeenCalledTimes(1);

    controller.playFlip();
    expect(spyFlip).toHaveBeenCalledTimes(1);

    controller.playStreakFanfare();
    expect(spyFanfare).toHaveBeenCalledTimes(1);
  });

  test("does not play sound when isAudioEnabled is false", () => {
    const app = stubApp();
    app.isAudioEnabled = false;
    const controller = new window.AudioController(app);
    const spyCorrect = vi.spyOn(controller.synth, "playCorrect");

    controller.playCorrect();
    expect(spyCorrect).not.toHaveBeenCalled();
  });
});
