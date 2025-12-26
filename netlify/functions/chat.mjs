const jsonResponse = (statusCode, payload) => ({
  statusCode,
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify(payload),
});

const chatModel =
  (process.env.OPENAI_CHAT_MODEL || "gpt-4.1").trim() || "gpt-4.1";
const chatReasoningEffort =
  (process.env.OPENAI_REASONING_EFFORT || "auto").trim().toLowerCase() ||
  "auto";

const getChatConfig = () => ({
  model: chatModel,
  reasoningEffort: chatReasoningEffort || "auto",
});

const normalizeChatMessages = (messages) => {
  if (!Array.isArray(messages)) return [];
  return messages
    .map((message) => {
      if (!message || typeof message !== "object") return null;
      const role = String(message.role || "").trim();
      if (!["user", "assistant"].includes(role)) return null;
      const content = String(message.content || "").trim();
      if (!content) return null;
      return { role, content };
    })
    .filter(Boolean);
};

const extractChatResponseText = (payload) => {
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

export const handler = async (event) => {
  if (event.httpMethod === "GET") {
    return jsonResponse(200, getChatConfig());
  }

  if (event.httpMethod !== "POST") {
    return jsonResponse(405, {
      error: "Method not allowed.",
      code: "method_not_allowed",
    });
  }

  let body = {};
  try {
    body = JSON.parse(event.body || "{}");
  } catch {
    body = {};
  }

  const messages = normalizeChatMessages(body?.messages);
  const context = typeof body?.context === "string" ? body.context.trim() : "";

  if (!messages.length) {
    return jsonResponse(400, {
      error: "Missing chat messages.",
      code: "missing_messages",
    });
  }

  const apiKey = String(process.env.OPENAI_API_KEY || "").trim();
  if (!apiKey) {
    return jsonResponse(400, {
      error: "Missing OpenAI API key.",
      code: "missing_api_key",
    });
  }

  const input = [];
  if (context) {
    input.push({
      role: "system",
      content: `Kontext: ${context}`,
    });
  }
  input.push(...messages);

  const payload = {
    model: chatModel,
    input,
  };
  if (chatReasoningEffort && chatReasoningEffort !== "auto") {
    payload.reasoning = { effort: chatReasoningEffort };
  }

  let upstream;
  try {
    upstream = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(payload),
    });
  } catch {
    return jsonResponse(502, {
      error: "Failed to reach OpenAI.",
      code: "openai_network_error",
    });
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
    return jsonResponse(upstream.status, {
      error: message,
      code: "openai_error",
    });
  }

  const responseText = extractChatResponseText(data);
  if (!responseText) {
    return jsonResponse(502, {
      error: "OpenAI response missing text output.",
      code: "missing_response",
    });
  }

  return jsonResponse(200, {
    message: responseText,
    ...getChatConfig(),
  });
};
