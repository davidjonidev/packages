/**
 * DOM polyfills for React Native.
 *
 * @elevenlabs/client (and its livekit-client dependency) reference browser DOM
 * APIs for audio element management, event construction, and document
 * manipulation. In React Native the actual media transport is handled natively
 * by @livekit/react-native-webrtc, but the JS references still need to resolve
 * at runtime to avoid crashes.
 *
 * These are minimal no-op stubs — they satisfy the JS surface area without
 * doing real DOM work. Must run BEFORE registerGlobals() and any
 * @elevenlabs/client imports to avoid reference errors during module
 * initialisation.
 */

// ---- Event classes ----

if (typeof globalThis.DOMException === "undefined") {
  globalThis.DOMException = class DOMException extends Error {
    constructor(message?: string, name?: string) {
      super(message);
      this.name = name ?? "DOMException";
    }
  } as typeof globalThis.DOMException;
}

if (typeof globalThis.Event === "undefined") {
  globalThis.Event = class Event {
    type: string;
    constructor(type: string) {
      this.type = type;
    }
  } as typeof globalThis.Event;
}

if (typeof globalThis.CloseEvent === "undefined") {
  globalThis.CloseEvent = class CloseEvent extends (globalThis.Event as any) {
    code: number;
    reason: string;
    wasClean: boolean;
    constructor(
      type: string,
      init?: { code?: number; reason?: string; wasClean?: boolean }
    ) {
      super(type);
      this.code = init?.code ?? 0;
      this.reason = init?.reason ?? "";
      this.wasClean = init?.wasClean ?? false;
    }
  } as typeof globalThis.CloseEvent;
}

// ---- HTML media element stubs ----

class StubHTMLMediaElement {
  srcObject: any = null;
  muted = false;
  volume = 1;
  autoplay = true;
  paused = true;
  controls = false;
  style: Record<string, string> = {};
  play() {
    return Promise.resolve();
  }
  pause() {}
  load() {}
  setSinkId() {
    return Promise.resolve();
  }
  addEventListener() {}
  removeEventListener() {}
  remove() {}
  getAttribute() {
    return null;
  }
  setAttribute() {}
}

if (typeof (globalThis as any).HTMLMediaElement === "undefined") {
  (globalThis as any).HTMLMediaElement = StubHTMLMediaElement;
}
if (typeof (globalThis as any).HTMLAudioElement === "undefined") {
  (globalThis as any).HTMLAudioElement = class extends StubHTMLMediaElement {};
}
if (typeof (globalThis as any).HTMLVideoElement === "undefined") {
  (globalThis as any).HTMLVideoElement = class extends StubHTMLMediaElement {
    width = 0;
    height = 0;
  };
}
if (typeof (globalThis as any).Audio === "undefined") {
  (globalThis as any).Audio = (globalThis as any).HTMLAudioElement;
}

// ---- Web Audio API stubs ----
// The @elevenlabs/client uses AudioContext for input volume analysis and output
// routing. In React Native, actual audio capture and playback is handled
// natively by @livekit/react-native-webrtc — these stubs prevent ReferenceErrors
// in the JS layer without affecting native audio behaviour.

class StubAnalyserNode {
  fftSize = 2048;
  frequencyBinCount = 1024;
  smoothingTimeConstant = 0.8;
  connect() {
    return this;
  }
  disconnect() {}
  getByteFrequencyData() {}
  getFloatTimeDomainData() {}
}

class StubGainNode {
  gain = { value: 1, setValueAtTime: () => {} };
  connect() {
    return this;
  }
  disconnect() {}
}

class StubMediaStreamSource {
  connect() {
    return this;
  }
  disconnect() {}
}

class StubMediaStreamDestination {
  stream = typeof MediaStream !== "undefined" ? new MediaStream() : {};
  connect() {
    return this;
  }
  disconnect() {}
}

class StubAudioWorkletNode {
  port = {
    postMessage: () => {},
    onmessage: null as ((e: any) => void) | null,
    addEventListener: () => {},
    removeEventListener: () => {},
  };
  connect() {
    return this;
  }
  disconnect() {}
  addEventListener() {}
  removeEventListener() {}
}

if (typeof (globalThis as any).AudioContext === "undefined") {
  (globalThis as any).AudioContext = class StubAudioContext {
    state = "running";
    sampleRate = 44100;
    destination = { connect: () => {} };
    createAnalyser() {
      return new StubAnalyserNode();
    }
    createGain() {
      return new StubGainNode();
    }
    createMediaStreamSource() {
      return new StubMediaStreamSource();
    }
    createMediaStreamDestination() {
      return new StubMediaStreamDestination();
    }
    addModule() {
      return Promise.resolve();
    }
    get audioWorklet() {
      return { addModule: () => Promise.resolve() };
    }
    resume() {
      return Promise.resolve();
    }
    suspend() {
      return Promise.resolve();
    }
    close() {
      return Promise.resolve();
    }
  };
}

if (typeof (globalThis as any).webkitAudioContext === "undefined") {
  (globalThis as any).webkitAudioContext = (globalThis as any).AudioContext;
}

if (typeof (globalThis as any).AudioWorkletNode === "undefined") {
  (globalThis as any).AudioWorkletNode = StubAudioWorkletNode;
}

// ---- document stub ----

if (typeof globalThis.document === "undefined") {
  (globalThis as any).document = {
    createElement: (tag: string) => {
      if (tag === "video") return new (globalThis as any).HTMLVideoElement();
      return new (globalThis as any).HTMLAudioElement();
    },
    createDocumentFragment: () => ({ appendChild: () => {} }),
    body: {
      appendChild: () => {},
      removeChild: () => {},
      contains: () => false,
    },
    visibilityState: "visible",
    addEventListener: () => {},
    removeEventListener: () => {},
  };
}

// ---- window stub ----

if (
  typeof globalThis.window === "undefined" ||
  typeof globalThis.window.removeEventListener !== "function"
) {
  const existing = (globalThis as any).window ?? {};
  (globalThis as any).window = {
    ...existing,
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => true,
    navigator: { userAgent: "React Native" },
  };
}

// ---- navigator stub ----

if (typeof globalThis.navigator === "undefined") {
  (globalThis as any).navigator = { userAgent: "React Native" };
} else if (typeof globalThis.navigator.userAgent === "undefined") {
  (globalThis as any).navigator.userAgent = "React Native";
}
