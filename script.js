/* DOM elements */
const chatForm = document.getElementById("chatForm");
const userInput = document.getElementById("userInput");
const chatWindow = document.getElementById("chatWindow");

// Set initial message
chatWindow.textContent = "👋 Hello! How can I help you today?";

/* Handle form submit */
chatForm.addEventListener("submit", (e) => {
  e.preventDefault();

  // When using Cloudflare, you'll need to POST a `messages` array in the body,
  // and handle the response using: data.choices[0].message.content
  const workerUrl = "https://round-meadow-ae4a.tooley24.workers.dev/"; // Replace with your Cloudflare Worker URL

  // Show message
  chatWindow.innerHTML = "Connect to the OpenAI API for a response!";
});
