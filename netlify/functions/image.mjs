const jsonResponse = (statusCode, payload) => ({
  statusCode,
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify(payload),
});

const imageModel =
  String(process.env.OPENAI_IMAGE_MODEL || "dall-e-3").trim() || "dall-e-3";

const parseDataUrl = (value = "") => {
  const match = String(value).match(/^data:([^;]+);base64,(.+)$/);
  if (!match) return null;
  const [, mime, payload] = match;
  try {
    return { mime, buffer: Buffer.from(payload, "base64") };
  } catch {
    return null;
  }
};

export const handler = async (event) => {
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

  const prompt = String(body.prompt || "").trim();
  if (!prompt) {
    return jsonResponse(400, {
      error: "Missing prompt.",
      code: "missing_prompt",
    });
  }

  const apiKey = String(process.env.OPENAI_API_KEY || "").trim();
  if (!apiKey) {
    return jsonResponse(400, {
      error: "Missing OpenAI API key.",
      code: "missing_api_key",
    });
  }

  let upstream;
  try {
    if (body.image) {
      const imageData = parseDataUrl(body.image);
      if (!imageData) {
        return jsonResponse(400, {
          error: "Invalid image data.",
          code: "invalid_image_data",
        });
      }
      const form = new FormData();
      form.append("model", imageModel);
      form.append("prompt", prompt);
      form.append("size", "1024x1024");
      form.append("response_format", "b64_json");
      form.append(
        "image",
        new Blob([imageData.buffer], { type: imageData.mime }),
        `image.${imageData.mime.split("/")[1] || "png"}`,
      );
      if (body.mask) {
        const maskData = parseDataUrl(body.mask);
        if (!maskData) {
          return jsonResponse(400, {
            error: "Invalid mask data.",
            code: "invalid_mask_data",
          });
        }
        form.append(
          "mask",
          new Blob([maskData.buffer], { type: maskData.mime }),
          `mask.${maskData.mime.split("/")[1] || "png"}`,
        );
      }
      upstream = await fetch("https://api.openai.com/v1/images/edits", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
        body: form,
      });
    } else {
      upstream = await fetch("https://api.openai.com/v1/images/generations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: imageModel,
          prompt,
          size: "1024x1024",
          response_format: "b64_json",
        }),
      });
    }
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

  const b64 = data?.data?.[0]?.b64_json;
  const url = data?.data?.[0]?.url;
  if (!b64 && !url) {
    return jsonResponse(502, {
      error: "OpenAI response missing image data.",
      code: "missing_image_data",
    });
  }

  const imageUrl = b64 ? `data:image/png;base64,${b64}` : url;
  return jsonResponse(200, { imageUrl });
};
