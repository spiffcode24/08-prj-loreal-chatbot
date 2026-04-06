// Copy this code into your Cloudflare Worker script

export default {
  async fetch(request, env) {
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      "Content-Type": "application/json",
    };

    // Handle CORS preflight requests
    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    const apiKey =
      env.OPENAI_KEY ||
      env.OPENAI_API_KEY ||
      env.OPENAI_APIKEY ||
      env.openai_api_key;

    if (!apiKey || apiKey === "undefined" || apiKey === "null") {
      return new Response(
        JSON.stringify({
          error:
            "Missing OpenAI API key secret in Cloudflare Workers. Set OPENAI_KEY (or OPENAI_API_KEY) in the Worker secrets.",
        }),
        { status: 500, headers: corsHeaders },
      );
    }

    const apiUrl = "https://api.openai.com/v1/chat/completions";
    const userInput = await request.json();

    const requestBody = {
      model: "gpt-4o",
      messages: userInput.messages,
      max_completion_tokens: 300,
    };

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    const data = await response.json();

    if (!response.ok) {
      return new Response(
        JSON.stringify({
          error: data.error?.message || "OpenAI request failed.",
        }),
        { status: response.status, headers: corsHeaders },
      );
    }

    if (!data?.choices?.length) {
      return new Response(
        JSON.stringify({
          error: "OpenAI returned no choices in the response.",
          raw: data,
        }),
        { status: 502, headers: corsHeaders },
      );
    }

    return new Response(JSON.stringify(data), { headers: corsHeaders });
  },
};
