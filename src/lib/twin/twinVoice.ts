/**
 * twinVoice.ts
 *
 * Free (no API key, no paid service, no third-party account) voice
 * greeting for the Twin's birth ceremony, using the browser-native Web
 * Speech API (`window.speechSynthesis` / `SpeechSynthesisUtterance`).
 * Chosen per the user's explicit final decision to use the free option
 * before any paid TTS provider.
 *
 * Browser support and installed-voice quality vary (some browsers report
 * zero voices until an async `voiceschanged` event fires) — every call is
 * best-effort and silently no-ops if the API or a matching voice isn't
 * available, since a missing greeting must never block the ceremony.
 */

export interface TwinVoiceOptions {
  lang?: 'th-TH' | 'en-US';
  rate?: number;
  pitch?: number;
}

function isSpeechSupported(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window;
}

/** Voices load asynchronously in some browsers (notably Chrome) — resolves
 *  once the list is populated, or immediately if it already is. */
function getVoices(): Promise<SpeechSynthesisVoice[]> {
  return new Promise((resolve) => {
    const existing = window.speechSynthesis.getVoices();
    if (existing.length > 0) {
      resolve(existing);
      return;
    }
    const onVoicesChanged = () => {
      window.speechSynthesis.removeEventListener('voiceschanged', onVoicesChanged);
      resolve(window.speechSynthesis.getVoices());
    };
    window.speechSynthesis.addEventListener('voiceschanged', onVoicesChanged);
    // Fallback in case this browser never fires the event.
    setTimeout(() => resolve(window.speechSynthesis.getVoices()), 500);
  });
}

/** Speaks `text` aloud. Never throws — a failed/unsupported greeting is
 *  cosmetic and must not interrupt the birth ceremony. */
export async function speakTwinGreeting(text: string, options: TwinVoiceOptions = {}): Promise<void> {
  if (!isSpeechSupported() || !text.trim()) return;

  try {
    const { lang = 'th-TH', rate = 0.95, pitch = 1.05 } = options;
    const voices = await getVoices();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    utterance.rate = rate;
    utterance.pitch = pitch;

    const langPrefix = lang.split('-')[0];
    const matchingVoice =
      voices.find((v) => v.lang === lang) ?? voices.find((v) => v.lang.startsWith(langPrefix));
    if (matchingVoice) utterance.voice = matchingVoice;

    // Cancel anything already queued (fast re-renders, rapid navigation)
    // before speaking, so greetings never stack/overlap.
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  } catch {
    // Best-effort only.
  }
}

/** Stops any in-progress/queued Twin speech — call on unmount/navigation
 *  so a greeting never keeps talking after the user has left the page. */
export function stopTwinVoice(): void {
  if (isSpeechSupported()) {
    window.speechSynthesis.cancel();
  }
}

/** The Twin's own greeting line, spoken right after it's just been named. */
export function buildTwinGreeting(twinName: string, lang: 'th' | 'en'): string {
  const name = twinName.trim();
  if (lang === 'th') {
    return `สวัสดีค่ะ ฉันคือ ${name} ฉันตื่นขึ้นมาแล้ว พร้อมเรียนรู้และเติบโตไปพร้อมกับคุณ`;
  }
  return `Hello, I'm ${name}. I've just awakened, ready to learn and grow with you.`;
}
