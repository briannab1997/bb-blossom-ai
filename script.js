// ============================================================
// BlossomAI — Main Script
// ============================================================

// ── State ────────────────────────────────────────────────────
var state = {
  tone: "soft",
  userName: null,
  messages: [],           // [{role: "user"|"assistant", content: "..."}]
  isStreaming: false,
  sessions: [],
  currentSessionId: null,
};

var TONE_LABELS = { soft: "Soft", sassy: "Sassy", pro: "Pro", wise: "Wise" };
var MAX_HISTORY = 20;

// ── DOM references ────────────────────────────────────────────
var chatBox    = document.getElementById("chatBox");
var chatMain   = document.getElementById("chatMain");
var input      = document.getElementById("userInput");
var typing     = document.getElementById("typingIndicator");
var hero       = document.getElementById("hero");
var toneBar    = document.getElementById("toneBar");
var toneLabel  = document.getElementById("toneLabel");
var sidebar    = document.getElementById("sidebar");
var chatHistory= document.getElementById("chatHistory");

// ── Boot ──────────────────────────────────────────────────────
restorePreferences();
loadSessions();
startNewSession();
setupToneButtons();
setupInput();
setupPromptChips();
setupKeyboardShortcuts();
setupVoiceInput();
setupTopBarButtons();

// ── Sessions ──────────────────────────────────────────────────
function loadSessions() {
  try {
    state.sessions = JSON.parse(localStorage.getItem("blossom_sessions") || "[]");
  } catch (_) {
    state.sessions = [];
  }
}

function saveSessions() {
  try {
    localStorage.setItem("blossom_sessions", JSON.stringify(state.sessions.slice(0, 25)));
  } catch (_) {}
}

function startNewSession() {
  state.currentSessionId = Date.now().toString();
  state.messages = [];
  state.userName = null;
  chatBox.innerHTML = "";
  hero.classList.remove("hidden");
  toneBar.classList.add("hidden");
  input.value = "";
  autoResize();
  updateSidebarHistory();
}

function persistSession(firstMsg) {
  var title = (firstMsg || "Conversation").slice(0, 44);
  if (firstMsg && firstMsg.length > 44) title += "…";
  var idx = state.sessions.findIndex(function(s) { return s.id === state.currentSessionId; });
  var session = {
    id: state.currentSessionId,
    title: title,
    messages: state.messages.slice(),
    tone: state.tone,
    userName: state.userName,
    updatedAt: Date.now(),
  };
  if (idx >= 0) {
    state.sessions[idx] = session;
  } else {
    state.sessions.unshift(session);
  }
  saveSessions();
  updateSidebarHistory();
}

function loadSession(session) {
  state.currentSessionId = session.id;
  state.messages = (session.messages || []).slice();
  state.tone = session.tone || "soft";
  state.userName = session.userName || null;

  chatBox.innerHTML = "";
  hero.classList.add("hidden");
  toneBar.classList.remove("hidden");
  syncToneButtons(state.tone);
  document.body.dataset.tone = state.tone;

  state.messages.forEach(function(msg) {
    renderMessage(msg.content, msg.role === "user" ? "user" : "blossom", false);
  });

  closeSidebar();
  scrollToBottom();
  showToast("Conversation loaded");
}

function updateSidebarHistory() {
  chatHistory.innerHTML = "";
  if (state.sessions.length === 0) {
    chatHistory.innerHTML = '<p class="history-empty">No history yet</p>';
    return;
  }
  state.sessions.forEach(function(s) {
    var el = document.createElement("div");
    el.className = "history-item" + (s.id === state.currentSessionId ? " active" : "");
    el.textContent = s.title || "Conversation";
    el.title = s.title || "Conversation";
    el.onclick = function() { loadSession(s); };
    chatHistory.appendChild(el);
  });
}

// ── Tone ──────────────────────────────────────────────────────
function setupToneButtons() {
  document.querySelectorAll("[data-tone]").forEach(function(btn) {
    btn.onclick = function() {
      state.tone = btn.dataset.tone;
      syncToneButtons(state.tone);
      document.body.dataset.tone = state.tone;
    };
  });
}

function syncToneButtons(tone) {
  document.querySelectorAll("[data-tone]").forEach(function(btn) {
    var active = btn.dataset.tone === tone;
    btn.classList.toggle("active", active);
    if (btn.hasAttribute("aria-pressed")) btn.setAttribute("aria-pressed", String(active));
  });
  if (toneLabel) toneLabel.textContent = TONE_LABELS[tone] || tone;
}

// ── Message rendering ──────────────────────────────────────────
function renderMessage(text, who, animate) {
  if (animate === undefined) animate = true;

  var row = document.createElement("div");
  row.className = "message-row " + who;
  if (!animate) row.style.animation = "none";

  // Avatar
  var avatar = document.createElement("div");
  avatar.className = "msg-avatar";
  avatar.setAttribute("aria-hidden", "true");
  if (who === "blossom") {
    avatar.textContent = "🌸";
  } else {
    avatar.textContent = (state.userName || "U").charAt(0).toUpperCase();
  }

  // Bubble wrap
  var wrap = document.createElement("div");
  wrap.className = "bubble-wrap";

  // Bubble
  var bubble = document.createElement("div");
  bubble.className = "bubble " + who;
  if (who === "blossom") {
    bubble.innerHTML = renderMarkdown(text);
  } else {
    bubble.textContent = text;
  }

  // Meta
  var meta = buildBubbleMeta(text);
  wrap.appendChild(bubble);
  wrap.appendChild(meta);
  row.appendChild(avatar);
  row.appendChild(wrap);
  chatBox.appendChild(row);
  scrollToBottom();
  return bubble;
}

function buildBubbleMeta(text) {
  var meta = document.createElement("div");
  meta.className = "bubble-meta";

  var time = document.createElement("span");
  time.className = "bubble-time";
  time.textContent = formatTime(new Date());

  var actions = document.createElement("div");
  actions.className = "bubble-actions";

  var copyBtn = document.createElement("button");
  copyBtn.className = "bubble-action";
  copyBtn.title = "Copy";
  copyBtn.setAttribute("aria-label", "Copy message");
  copyBtn.innerHTML = "📋";
  copyBtn.onclick = function() { copyText(text, copyBtn); };

  actions.appendChild(copyBtn);
  meta.appendChild(time);
  meta.appendChild(actions);
  return meta;
}

function copyText(text, btn) {
  navigator.clipboard.writeText(text).then(function() {
    btn.innerHTML = "✅";
    btn.classList.add("copied");
    setTimeout(function() {
      btn.innerHTML = "📋";
      btn.classList.remove("copied");
    }, 1600);
  }).catch(function() {
    showToast("Copy failed", "error");
  });
}

function formatTime(date) {
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function scrollToBottom() {
  chatMain.scrollTop = chatMain.scrollHeight;
}

// ── Minimal markdown renderer ──────────────────────────────────
function renderMarkdown(text) {
  return text
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/`(.+?)`/g, "<code>$1</code>")
    .replace(/^[-*]\s+(.+)$/gm, "<li>$1</li>")
    .replace(/((?:<li>.*<\/li>\n?)+)/g, "<ul>$1</ul>")
    .replace(/\n/g, "<br>");
}

// ── Name detection ─────────────────────────────────────────────
function detectName(message) {
  var patterns = [
    /^(?:my name is|i'm|i am|call me|it's|its)\s+([a-zA-Z]+)/i,
    /^([a-zA-Z]{2,20})[\s.!?]*$/,
  ];
  for (var i = 0; i < patterns.length; i++) {
    var match = message.match(patterns[i]);
    if (match) {
      var name = match[1].trim();
      if (name.length >= 2 && name.length <= 24) {
        return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
      }
    }
  }
  return null;
}

// ── Send ───────────────────────────────────────────────────────
function send() {
  var msg = input.value.trim();
  if (!msg || state.isStreaming) return;

  input.value = "";
  autoResize();

  // Show chat, hide hero
  if (!hero.classList.contains("hidden")) {
    hero.classList.add("hidden");
    toneBar.classList.remove("hidden");
  }

  // Name detection (early messages only)
  if (!state.userName && state.messages.length <= 2) {
    var name = detectName(msg);
    if (name) state.userName = name;
  }

  renderMessage(msg, "user");
  state.messages.push({ role: "user", content: msg });

  var firstMsg = state.messages[0] ? state.messages[0].content : msg;
  persistSession(firstMsg);

  streamReply();
}

function isStaticDemoHost() {
  return window.location.hostname.endsWith("github.io");
}

function demoReply() {
  return [
    "This GitHub Pages version is running in demo mode, so the live chat API is not connected here.",
    "",
    "The full version is designed to run with a Vercel serverless function, streaming responses, saved sessions, export tools, voice input, and tone switching.",
    "",
    "You can still explore the interface, try the tone modes, use prompt chips, save local sessions, and review the project structure on GitHub."
  ].join("\n");
}

// ── Stream reply ───────────────────────────────────────────────
async function streamReply() {
  state.isStreaming = true;
  document.getElementById("sendBtn").disabled = true;
  typing.classList.remove("hidden");
  scrollToBottom();

  try {
    if (isStaticDemoHost()) {
      typing.classList.add("hidden");
      var demo = demoReply();
      renderMessage(demo, "blossom");
      state.messages.push({ role: "assistant", content: demo });
      return;
    }

    var response = await fetch("/api/blossom", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages: state.messages.slice(-MAX_HISTORY),
        tone: state.tone,
        userName: state.userName,
        stream: true,
      }),
    });

    typing.classList.add("hidden");

    if (!response.ok) {
      throw new Error("HTTP " + response.status);
    }

    var contentType = response.headers.get("content-type") || "";

    if (contentType.includes("text/event-stream")) {
      await handleStream(response);
    } else {
      // Non-streaming fallback
      var data = await response.json();
      var reply = data.reply || data.error || "Something went wrong.";
      renderMessage(reply, "blossom");
      state.messages.push({ role: "assistant", content: reply });
    }

  } catch (err) {
    typing.classList.add("hidden");
    var errMsg = err && err.message && err.message.includes("Failed to fetch")
      ? "Hmm, I can't reach the server right now. If you're running locally, make sure to use `vercel dev` instead of a static file server 🌸"
      : "Oops! Something went wrong on my end — try sending that again? 🌸";
    var errBubble = renderMessage(errMsg, "blossom");
    console.error("[BlossomAI]", err);
  } finally {
    state.isStreaming = false;
    document.getElementById("sendBtn").disabled = false;
    scrollToBottom();
    persistSession(state.messages[0] ? state.messages[0].content : "");
  }
}

async function handleStream(response) {
  // Build streaming message row
  var row = document.createElement("div");
  row.className = "message-row blossom";
  row.style.animation = "bubbleIn 240ms cubic-bezier(0.34, 1.56, 0.64, 1) both";

  var avatar = document.createElement("div");
  avatar.className = "msg-avatar";
  avatar.setAttribute("aria-hidden", "true");
  avatar.textContent = "🌸";

  var wrap = document.createElement("div");
  wrap.className = "bubble-wrap";

  var bubble = document.createElement("div");
  bubble.className = "bubble blossom streaming";

  wrap.appendChild(bubble);
  row.appendChild(avatar);
  row.appendChild(wrap);
  chatBox.appendChild(row);
  scrollToBottom();

  var fullText = "";
  var reader = response.body.getReader();
  var decoder = new TextDecoder();

  try {
    while (true) {
      var result = await reader.read();
      if (result.done) break;

      var chunk = decoder.decode(result.value, { stream: true });
      var lines = chunk.split("\n");

      for (var i = 0; i < lines.length; i++) {
        var line = lines[i];
        if (!line.startsWith("data: ")) continue;
        var data = line.slice(6).trim();
        if (data === "[DONE]") break;
        try {
          var parsed = JSON.parse(data);
          var token = parsed.content || "";
          fullText += token;
          bubble.innerHTML = renderMarkdown(fullText);
          scrollToBottom();
        } catch (_) {}
      }
    }
  } finally {
    bubble.classList.remove("streaming");
    state.messages.push({ role: "assistant", content: fullText });

    // Add meta row
    var meta = buildBubbleMeta(fullText);
    wrap.appendChild(meta);
  }
}

// ── Input ──────────────────────────────────────────────────────
function setupInput() {
  input.addEventListener("keydown", function(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  });
  input.addEventListener("input", autoResize);
  document.getElementById("sendBtn").onclick = send;
}

function autoResize() {
  input.style.height = "auto";
  input.style.height = Math.min(input.scrollHeight, 130) + "px";
}

// ── Prompt chips ───────────────────────────────────────────────
function setupPromptChips() {
  document.querySelectorAll(".prompt-chip").forEach(function(chip) {
    chip.onclick = function() {
      input.value = chip.dataset.prompt;
      input.focus();
      autoResize();
    };
  });
}

// ── Keyboard shortcuts ─────────────────────────────────────────
function setupKeyboardShortcuts() {
  document.addEventListener("keydown", function(e) {
    var mod = e.metaKey || e.ctrlKey;
    if (mod && e.key === "k") { e.preventDefault(); clearChat(); }
    if (mod && e.key === "d") { e.preventDefault(); toggleDark(); }
    if (mod && e.key === "e") { e.preventDefault(); exportChat(); }
    if (mod && e.key === "b") { e.preventDefault(); toggleSidebar(); }
    if (e.key === "Escape")   { closeSidebar(); }
  });
}

// ── Top bar buttons ────────────────────────────────────────────
function setupTopBarButtons() {
  document.getElementById("sidebarToggle").onclick  = toggleSidebar;
  document.getElementById("sidebarClose").onclick   = closeSidebar;
  document.getElementById("sidebarBackdrop").onclick= closeSidebar;
  document.getElementById("clearChat").onclick      = clearChat;
  document.getElementById("darkToggle").onclick     = toggleDark;
  document.getElementById("exportBtn").onclick      = exportChat;
  document.getElementById("newChatBtn").onclick     = function() {
    startNewSession();
    closeSidebar();
    showToast("New conversation started 🌸");
  };
}

// ── Actions ────────────────────────────────────────────────────
function clearChat() {
  if (state.messages.length === 0) return;
  startNewSession();
  showToast("Chat cleared ✨");
}

function toggleDark() {
  document.body.classList.toggle("dark");
  var dark = document.body.classList.contains("dark");
  document.getElementById("moonIcon").style.display = dark ? "none" : "block";
  document.getElementById("sunIcon").style.display  = dark ? "block" : "none";
  try { localStorage.setItem("blossom_dark", dark ? "1" : "0"); } catch (_) {}
}

function toggleSidebar() {
  document.body.classList.toggle("sidebar-open");
}

function closeSidebar() {
  document.body.classList.remove("sidebar-open");
}

function exportChat() {
  if (state.messages.length === 0) {
    showToast("Nothing to export yet 😊");
    return;
  }

  var lines = [
    "# BlossomAI Conversation",
    "Date: " + new Date().toLocaleDateString(),
    "Tone: " + (TONE_LABELS[state.tone] || state.tone),
    "",
  ];

  state.messages.forEach(function(msg) {
    var who = msg.role === "user" ? (state.userName || "You") : "Blossom";
    lines.push("**" + who + ":** " + msg.content, "");
  });

  var blob = new Blob([lines.join("\n")], { type: "text/markdown" });
  var url = URL.createObjectURL(blob);
  var a = document.createElement("a");
  a.href = url;
  a.download = "blossom-" + new Date().toISOString().split("T")[0] + ".md";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  showToast("Chat exported 📥");
}

// ── Voice input ────────────────────────────────────────────────
function setupVoiceInput() {
  var voiceBtn = document.getElementById("voiceBtn");
  var SR = window.SpeechRecognition || window.webkitSpeechRecognition;

  if (!SR) {
    voiceBtn.style.display = "none";
    return;
  }

  var recognition = new SR();
  recognition.continuous = false;
  recognition.interimResults = true;
  recognition.lang = "en-US";

  recognition.onresult = function(e) {
    var transcript = Array.from(e.results).map(function(r) { return r[0].transcript; }).join("");
    input.value = transcript;
    autoResize();
    if (e.results[e.results.length - 1].isFinal) {
      voiceBtn.classList.remove("recording");
    }
  };

  recognition.onerror = function() {
    voiceBtn.classList.remove("recording");
    showToast("Voice input unavailable", "error");
  };

  recognition.onend = function() {
    voiceBtn.classList.remove("recording");
  };

  voiceBtn.onclick = function() {
    if (voiceBtn.classList.contains("recording")) {
      recognition.stop();
    } else {
      voiceBtn.classList.add("recording");
      recognition.start();
    }
  };
}

// ── Toast ──────────────────────────────────────────────────────
function showToast(message, type, duration) {
  if (!type) type = "default";
  if (!duration) duration = 2600;

  var container = document.getElementById("toastContainer");
  var toast = document.createElement("div");
  toast.className = "toast " + type;
  toast.textContent = message;
  container.appendChild(toast);

  setTimeout(function() {
    toast.style.opacity = "0";
    toast.style.transform = "translateX(20px)";
    toast.style.transition = "opacity 280ms ease, transform 280ms ease";
    setTimeout(function() { toast.remove(); }, 300);
  }, duration);
}

// ── Preferences ────────────────────────────────────────────────
function restorePreferences() {
  try {
    if (localStorage.getItem("blossom_dark") === "1") {
      document.body.classList.add("dark");
      var moon = document.getElementById("moonIcon");
      var sun  = document.getElementById("sunIcon");
      if (moon) moon.style.display = "none";
      if (sun)  sun.style.display  = "block";
    }
  } catch (_) {}
}
