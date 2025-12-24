import { handleEvidenceApi } from "../../evidence-store.mjs";

const jsonResponse = (statusCode, payload) => ({
  statusCode,
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify(payload),
});

export const handler = async (event) => {
  const result = await handleEvidenceApi({
    method: event.httpMethod,
    urlPath: event.path,
    headers: event.headers,
    body: event.body,
  });

  if (!result) {
    return jsonResponse(404, {
      error: "Not found.",
      code: "not_found",
    });
  }

  return jsonResponse(result.statusCode, result.payload);
};
