/* DOM elements */
const chatForm = document.getElementById("chatForm");
const userInput = document.getElementById("userInput");
const chatWindow = document.getElementById("chatWindow");
const sendBtn = document.getElementById("sendBtn");

/* Cloudflare Worker setup */
const workerUrl = "https://round-meadow-ae4a.tooley24.workers.dev/";

// System prompt: keeps the assistant focused on L'Oreal beauty use cases only.
const systemPrompt =
  "You are a L'Oreal beauty assistant. You must only answer questions related to L'Oreal products, beauty routines, recommendations, and beauty topics such as skincare, haircare, makeup, fragrance, ingredients, and product usage. If a user asks anything outside this scope, politely refuse in 1-2 short sentences and redirect them to ask a L'Oreal beauty question.";

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
    const response = await fetch(workerUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messages,
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
      "Sorry, I could not get a response right now. Please check your Cloudflare Worker and try again.",
    );
    console.error(error);
  } finally {
    sendBtn.disabled = false;
    userInput.focus();
  }
});
