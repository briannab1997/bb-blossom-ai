const WORKFLOW_PROMPTS = {
  general: "",
  interview: "Focus this response on interview preparation. Help map the user's input to role keywords, STAR stories, practice questions, and next prep steps.",
  actionPlan: "Focus this response on turning rough notes into a practical action plan with priorities, next actions, and follow-up checkpoints.",
  decision: "Focus this response on decision support. Compare tradeoffs, risks, reversibility, and the next signal that would make the decision clearer.",
};

export function normalizeWorkflow(workflow) {
  return WORKFLOW_PROMPTS[workflow] !== undefined ? workflow : "general";
}

export function buildSystemPrompt({ base, persona, userName, workflow }) {
  const normalizedWorkflow = normalizeWorkflow(workflow);
  const nameContext = userName ? `The user's name is ${userName}. Use it warmly when it feels natural.` : "";
  const workflowContext = WORKFLOW_PROMPTS[normalizedWorkflow]
    ? `Workflow: ${WORKFLOW_PROMPTS[normalizedWorkflow]}`
    : "";

  return `${base}\nTone: ${persona}\n${workflowContext}\n${nameContext}`.trim();
}

export function buildApiMessages({ messages, systemPrompt, limit = 20 }) {
  return [
    { role: "system", content: systemPrompt },
    ...messages.slice(-limit).map((m) => ({
      role: m.role === "user" ? "user" : "assistant",
      content: String(m.content || "").slice(0, 2000),
    })),
  ];
}
