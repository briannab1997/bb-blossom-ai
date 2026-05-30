import assert from "node:assert/strict";
import { buildApiMessages, buildSystemPrompt, normalizeWorkflow } from "../api/request-utils.js";

assert.equal(normalizeWorkflow("decision"), "decision");
assert.equal(normalizeWorkflow("surprise"), "general");

const systemPrompt = buildSystemPrompt({
  base: "Base prompt.",
  persona: "Use a professional tone.",
  userName: "Brianna",
  workflow: "interview",
});

assert.match(systemPrompt, /interview preparation/);
assert.match(systemPrompt, /Brianna/);

const longContent = "x".repeat(2500);
const apiMessages = buildApiMessages({
  systemPrompt,
  limit: 2,
  messages: [
    { role: "user", content: "old" },
    { role: "assistant", content: "recent assistant" },
    { role: "user", content: longContent },
  ],
});

assert.equal(apiMessages.length, 3);
assert.equal(apiMessages[0].role, "system");
assert.equal(apiMessages[1].role, "assistant");
assert.equal(apiMessages[2].content.length, 2000);

console.log("request utility tests passed");
