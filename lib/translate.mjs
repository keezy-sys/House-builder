const resolveChatModel = (value) => {
  const trimmed = String(value || "").trim();
  if (!trimmed) return "";
  const normalized = trimmed.toLowerCase();
  if (["default", "auto", "openai-default"].includes(normalized)) {
    return "";
  }
  return trimmed;
};

const chatModel = resolveChatModel(process.env.OPENAI_CHAT_MODEL);

const extractResponseText = (payload) => {
  const outputText = String(payload?.output_text || "").trim();
  if (outputText) return outputText;
  const output = Array.isArray(payload?.output) ? payload.output : [];
  for (const item of output) {
    const content = Array.isArray(item?.content) ? item.content : [];
    for (const part of content) {
      const text = String(part?.text || part?.output_text || "").trim();
      if (text) return text;
    }
  }
  const choiceText = String(
    payload?.choices?.[0]?.message?.content || "",
  ).trim();
  if (choiceText) return choiceText;
  return "";
};

const createError = (message, code, statusCode = 500) => {
  const error = new Error(message);
  error.code = code;
  error.statusCode = statusCode;
  return error;
};

const callOpenAi = async (payload) => {
  const apiKey = String(process.env.OPENAI_API_KEY || "").trim();
  if (!apiKey) {
    throw createError("Missing OpenAI API key.", "missing_api_key", 400);
  }
  const requestPayload = { ...payload };
  if (chatModel) {
    requestPayload.model = chatModel;
  }
  let upstream;
  try {
    upstream = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(requestPayload),
    });
  } catch {
    throw createError(
      "Failed to reach OpenAI.",
      "openai_network_error",
      502,
    );
  }
  let data = {};
  try {
    data = await upstream.json();
  } catch {
    data = {};
  }
  if (!upstream.ok) {
    const message =
      data?.error?.message || `OpenAI request failed (${upstream.status}).`;
    throw createError(message, "openai_error", upstream.status);
  }
  const text = extractResponseText(data);
  if (!text) {
    throw createError("OpenAI response missing text output.", "missing_text");
  }
  return text;
};

const normalizeText = (value) => String(value || "").trim();

const detectLanguage = async (text) => {
  const input = normalizeText(text);
  if (!input) return "";
  const response = await callOpenAi({
    input: [
      {
        role: "system",
        content: "Return only the ISO 639-1 language code.",
      },
      {
        role: "user",
        content: `Text:\n${input}`,
      },
    ],
  });
  const normalized = response.trim().toLowerCase();
  if (/^[a-z]{2}$/.test(normalized)) return normalized;
  const match = normalized.match(/[a-z]{2}/);
  return match ? match[0] : "";
};

const translateText = async ({ text, targetLang, sourceLang }) => {
  const input = normalizeText(text);
  if (!input) {
    throw createError("Missing text.", "missing_text", 400);
  }
  const target = String(targetLang || "").trim().toLowerCase();
  const source = String(sourceLang || "").trim().toLowerCase();
  const prompt = source
    ? `Source language: ${source}. Target language: ${target}.\n\n${input}`
    : `Target language: ${target}.\n\n${input}`;
  return callOpenAi({
    input: [
      {
        role: "system",
        content:
          "Translate faithfully; preserve names, numbers, addresses; do not add content; return only translated text.",
      },
      { role: "user", content: prompt },
    ],
  });
};

const translate = async ({ text, targetLang, sourceLang } = {}) => {
  const input = normalizeText(text);
  if (!input) {
    throw createError("Missing text.", "missing_text", 400);
  }
  const target = String(targetLang || "").trim().toLowerCase();
  if (!target) {
    throw createError("Missing target language.", "missing_target", 400);
  }
  const detected = sourceLang ? String(sourceLang).trim().toLowerCase() : "";
  const resolvedSource = detected || (await detectLanguage(input));
  const translatedText = await translateText({
    text: input,
    targetLang: target,
    sourceLang: resolvedSource,
  });
  return {
    translatedText,
    detectedSourceLang: resolvedSource || null,
  };
};

export { translate };
