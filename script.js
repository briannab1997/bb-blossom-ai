let tone = "soft";
let userName = null;

const chatBox = document.getElementById("chatBox");
const input = document.getElementById("userInput");
const typing = document.getElementById("typingIndicator");

document.querySelectorAll(".wheel-option").forEach((o) => {
  o.onclick = () => {
    document
      .querySelectorAll(".wheel-option")
      .forEach((a) => a.classList.remove("active"));
    o.classList.add("active");
    tone = o.dataset.tone;
  };
});

function addMessage(text, who) {
  const el = document.createElement("div");
  el.className = "bubble " + who;
  el.textContent = text;
  chatBox.appendChild(el);
  chatBox.scrollTop = chatBox.scrollHeight;
}

function detectName(message) {
  const m = message.toLowerCase();
  if (m.startsWith("my name is ")) return message.substring(11).trim();
  if (m.startsWith("call me ")) return message.substring(8).trim();
  if (!userName && /^[a-zA-Z]+$/.test(message.trim()) && message.length < 20) {
    return message.trim();
  }
  return null;
}

async function blossomReply(message) {
  const possibleName = detectName(message);
  if (possibleName) {
    userName = possibleName.charAt(0).toUpperCase() + possibleName.slice(1);
    addMessage(`Thanks, ${userName}. How can I support you today?`, "blossom");
    return;
  }

  typing.classList.remove("hidden");

  const response = await fetch("/api/blossom", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      message,
      tone,
      userName,
    }),
  });

  const data = await response.json();

  typing.classList.add("hidden");
  addMessage(data.reply, "blossom");
}

document.getElementById("sendBtn").onclick = send;
input.onkeypress = (e) => {
  if (e.key === "Enter") send();
};

function send() {
  const msg = input.value.trim();
  if (!msg) return;
  addMessage(msg, "user");
  input.value = "";
  blossomReply(msg);
}
