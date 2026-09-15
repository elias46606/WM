const API_BASE = "https://api.elevenlabs.io/v1";

function requireKey(): string {
  const key = process.env.ELEVENLABS_API_KEY;
  if (!key) throw new Error("ELEVENLABS_API_KEY fehlt.");
  return key;
}

// Text -> gesprochenes Audio (mp3). Gibt den rohen Response-Body
// zurück, damit die API-Route ihn 1:1 an den Client streamen kann.
export async function textToSpeech(text: string): Promise<Response> {
  const key = requireKey();
  const voiceId = process.env.ELEVENLABS_VOICE_ID || "21m00Tcm4TlvDq8ikWAM";
  const modelId = process.env.ELEVENLABS_MODEL_ID || "eleven_multilingual_v2";

  const res = await fetch(`${API_BASE}/text-to-speech/${voiceId}`, {
    method: "POST",
    headers: {
      "xi-api-key": key,
      "Content-Type": "application/json",
      Accept: "audio/mpeg",
    },
    body: JSON.stringify({
      text,
      model_id: modelId,
      voice_settings: { stability: 0.45, similarity_boost: 0.8 },
    }),
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`ElevenLabs TTS fehlgeschlagen (${res.status}): ${detail}`);
  }
  return res;
}

// Audio (z.B. aus MediaRecorder) -> Transkript via ElevenLabs Scribe.
export async function speechToText(
  audio: Blob,
  filename = "input.webm"
): Promise<string> {
  const key = requireKey();
  const form = new FormData();
  form.append("model_id", "scribe_v1");
  form.append("file", audio, filename);

  const res = await fetch(`${API_BASE}/speech-to-text`, {
    method: "POST",
    headers: { "xi-api-key": key },
    body: form,
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`ElevenLabs STT fehlgeschlagen (${res.status}): ${detail}`);
  }
  const json = await res.json();
  return json.text ?? "";
}
