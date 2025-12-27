import { handleEmailApi } from "../../email-store.mjs";

const jsonResponse = (statusCode, payload) => ({
  statusCode,
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify(payload),
});

const parseBody = (event) => {
  if (!event?.body) return {};
  const raw = event.isBase64Encoded
    ? Buffer.from(event.body, "base64").toString("utf8")
    : event.body;
  try {
    return JSON.parse(raw);
  } catch {
    return {};
  }
};

export const handler = async (event) => {
  const urlPath = String(event.path || "")
    .replace(/^\/\.netlify\/functions\/email/, "/api/email")
    .trim();
  const query = new URLSearchParams(event.queryStringParameters || {});
  const body = parseBody(event);

  const result = await handleEmailApi({
    method: event.httpMethod,
    urlPath,
    headers: event.headers,
    body,
    query,
  });

  if (!result) {
    return jsonResponse(404, {
      error: "Not found.",
      code: "not_found",
    });
  }

  return jsonResponse(result.statusCode, result.payload);
};
