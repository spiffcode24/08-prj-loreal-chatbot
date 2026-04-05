/* DOM elements */
const chatForm = document.getElementById("chatForm");
const userInput = document.getElementById("userInput");
const chatWindow = document.getElementById("chatWindow");
const sendBtn = document.getElementById("sendBtn");

/* OpenAI API setup */
const apiUrl = "https://api.openai.com/v1/chat/completions";
const model = "gpt-4o";

// System prompt: keeps the assistant focused on L'Oreal use cases only.
const systemPrompt =
  "You are a L'Oreal beauty assistant. Only answer questions about L'Oreal products, routines, and recommendations. If a question is unrelated to L'Oreal beauty topics, politely decline and invite the user to ask about L'Oreal products, skincare, haircare, makeup, or fragrance.";

// Conversation starts with a system instruction.
const messages = [
  {
    role: "system",
    content: systemPrompt,
  },
];

/* UI helpers */
function addMessageToChat(role, text) {
  const messageDiv = document.createElement("div");
  messageDiv.classList.add("msg");

  if (role === "user") {
    messageDiv.classList.add("user");
    messageDiv.textContent = `You: ${text}`;
  } else {
    messageDiv.classList.add("ai");
    messageDiv.textContent = `Assistant: ${text}`;
  }

  chatWindow.appendChild(messageDiv);
  chatWindow.scrollTop = chatWindow.scrollHeight;
}

// Set initial greeting in the chat area.
chatWindow.innerHTML = "";
addMessageToChat(
  "assistant",
  "Hello! Ask me about L'Oreal products, routines, or recommendations.",
);

/* Handle form submit */
chatForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const prompt = userInput.value.trim();
  if (!prompt) {
    return;
  }

  // Show the user's message and add it to conversation history.
  addMessageToChat("user", prompt);
  messages.push({ role: "user", content: prompt });
  userInput.value = "";

  sendBtn.disabled = true;

  try {
    if (typeof OPENAI_API_KEY === "undefined") {
      throw new Error("Missing OPENAI_API_KEY. Add it in secrets.js.");
    }

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model,
        messages,
        max_completion_tokens: 300,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API request failed: ${errorText}`);
    }

    const data = await response.json();
    const assistantReply = data.choices[0].message.content;

    addMessageToChat("assistant", assistantReply);
    messages.push({ role: "assistant", content: assistantReply });
  } catch (error) {
    addMessageToChat(
      "assistant",
      "Sorry, I could not get a response right now. Please check your API key and try again.",
    );
    console.error(error);
  } finally {
    sendBtn.disabled = false;
    userInput.focus();
  }
});
