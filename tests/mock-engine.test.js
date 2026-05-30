import assert from "node:assert/strict";
import { createDemoReply, inferWorkflow, normalizeWorkflow } from "../mock-engine.js";

assert.equal(normalizeWorkflow("interview"), "interview");
assert.equal(normalizeWorkflow("unknown"), "general");
assert.equal(inferWorkflow("Can you help with interview prep?", "general"), "interview");
assert.equal(inferWorkflow("Turn these notes into a plan", "general"), "actionPlan");
assert.equal(inferWorkflow("Help me compare this decision", "general"), "decision");

const interviewReply = createDemoReply({
  message: "I have an interview tomorrow",
  tone: "pro",
  workflow: "interview",
});

assert.match(interviewReply, /Interview prep plan/);
assert.match(interviewReply, /STAR stories/);

const actionReply = createDemoReply({
  message: "Here are messy notes",
  tone: "soft",
  workflow: "actionPlan",
});

assert.match(actionReply, /Action plan/);
assert.match(actionReply, /Next 24 hours/);

console.log("mock engine tests passed");
