// DOM polyfills must run before any @elevenlabs/client or livekit-client code
// loads — they reference browser globals (document, HTMLAudioElement, Event,
// etc.) that don't exist in React Native.
import "./polyfills";

import {
  registerGlobals,
  AudioSession,
  AndroidAudioTypePresets,
} from "@livekit/react-native";
import type { Options } from "@elevenlabs/client";
import {
  setSetupStrategy,
  webSessionSetup,
  type VoiceSessionSetupResult,
} from "@elevenlabs/client/internal";

// Polyfill WebRTC globals needed by livekit-client in React Native
registerGlobals();

/**
 * React Native voice session setup strategy.
 *
 * 1. Configures and starts the native AudioSession
 * 2. Delegates connection + input/output setup to the web strategy
 * 3. Wraps detach to stop the native AudioSession on cleanup
 */
async function reactNativeSessionSetup(
  options: Options
): Promise<VoiceSessionSetupResult> {
  await AudioSession.configureAudio({
    android: {
      preferredOutputList: ["speaker"],
      audioTypeOptions: AndroidAudioTypePresets.communication,
    },
    ios: {
      defaultOutput: "speaker",
    },
  });
  await AudioSession.startAudioSession();

  const result = await webSessionSetup(options);

  const originalDetach = result.detach;
  return {
    ...result,
    detach: () => {
      originalDetach();
      AudioSession.stopAudioSession();
    },
  };
}

setSetupStrategy(reactNativeSessionSetup);

export * from "./index";
