export const WORKFLOWS = {
  general: {
    label: "Open Chat",
    prompt: "",
  },
  interview: {
    label: "Interview Prep",
    prompt: "Help me prepare for an interview. Here is the role or job description: ",
  },
  actionPlan: {
    label: "Action Plan",
    prompt: "Turn these messy notes into a clear action plan: ",
  },
  decision: {
    label: "Decision Brief",
    prompt: "Help me compare this decision and choose my next step: ",
  },
};

export function normalizeWorkflow(workflow) {
  return WORKFLOWS[workflow] ? workflow : "general";
}

export function inferWorkflow(message, requestedWorkflow) {
  var workflow = normalizeWorkflow(requestedWorkflow);
  if (workflow !== "general") return workflow;

  var lower = String(message || "").toLowerCase();
  if (lower.includes("interview") || lower.includes("resume") || lower.includes("job description")) return "interview";
  if (lower.includes("notes") || lower.includes("action plan") || lower.includes("to-do") || lower.includes("todo")) return "actionPlan";
  if (lower.includes("decision") || lower.includes("compare") || lower.includes("choose")) return "decision";
  return "general";
}

export function createDemoReply(options) {
  var message = String(options && options.message ? options.message : "");
  var tone = options && options.tone ? options.tone : "soft";
  var userName = options && options.userName ? options.userName : "";
  var workflow = inferWorkflow(message, options && options.workflow);
  var lower = message.toLowerCase();
  var name = userName ? userName + ", " : "";

  var opener = {
    soft: name + "I hear you. Let's slow it down and turn this into something you can actually move through.",
    sassy: name + "okay, let's get you unstuck because this does not get to run the show.",
    pro: name + "let's make this practical. The goal is to reduce the fog and identify the next best action.",
    wise: name + "there is a signal inside this situation. Let's listen for it before we rush into a fix.",
  }[tone] || "Let's work through this together.";

  var body = buildGeneralBody(lower);
  if (workflow === "interview") body = buildInterviewBody();
  if (workflow === "actionPlan") body = buildActionPlanBody();
  if (workflow === "decision") body = buildDecisionBody();

  var closer = {
    soft: "What part of this feels heaviest right now?",
    sassy: "Now tell me which part we are handling first.",
    pro: "What outcome would make the next 24 hours feel successful?",
    wise: "What is the smallest honest step you can take from here?",
  }[tone] || "Where should we start?";

  return opener + "\n\n" + body + "\n\n" + closer;
}

function buildGeneralBody(lower) {
  if (lower.includes("career") || lower.includes("job") || lower.includes("interview")) {
    return "For career questions, separate the choice into three pieces: what role you want next, what proof you can show, and what gap you can close this week. A strong next step would be updating one portfolio blurb, practicing one interview story, or reaching out to one person connected to the role.";
  }
  if (lower.includes("burn") || lower.includes("overwhelm") || lower.includes("stress") || lower.includes("anxious")) {
    return "When everything feels loud, pick one anchor: food, water, sleep, a short walk, or a single task. If the stress feels unsafe or unmanageable, it is worth bringing in a trusted person or professional support. You deserve help that is bigger than a browser tab.";
  }
  if (lower.includes("procrast") || lower.includes("habit") || lower.includes("routine")) {
    return "Make the habit almost too easy to dodge: two minutes, same place, same trigger. Track the start, not perfection. The win is teaching your brain, 'I am the kind of person who begins.'";
  }
  if (lower.includes("relationship") || lower.includes("difficult person") || lower.includes("boundary")) {
    return "Try naming the pattern without attacking the person: 'When this happens, I feel this, and I need this going forward.' A clean boundary is specific, calm, and attached to what you will do next if it keeps happening.";
  }
  if (lower.includes("money") || lower.includes("saving") || lower.includes("budget")) {
    return "A simple money reset is: list the fixed bills, decide a weekly spending number, automate even a tiny savings amount, and review it once a week. You do not need a perfect system; you need one you will actually look at.";
  }
  if (lower.includes("creative") || lower.includes("brainstorm") || lower.includes("project")) {
    return "Give yourself three lanes: useful, beautiful, and weird. Write five ideas in each lane, then pick the one that makes you curious enough to prototype it tonight.";
  }
  if (lower.includes("decision") || lower.includes("choice")) {
    return buildDecisionBody();
  }
  return "Start with a quick reset: write down what is bothering you, what you can control today, and what can wait. Then choose one tiny action that takes less than 15 minutes so momentum has somewhere to begin.";
}

function buildInterviewBody() {
  return [
    "**Interview prep plan:**",
    "- Pull 3 role keywords from the job description.",
    "- Match each keyword to one project, class, or work story.",
    "- Build 2 STAR stories: one technical problem and one teamwork/customer issue.",
    "- Practice a 30-second answer for: `Tell me about yourself` and `Why this role?`",
  ].join("\n");
}

function buildActionPlanBody() {
  return [
    "**Action plan:**",
    "- Outcome: name the result you want in one sentence.",
    "- Next 24 hours: choose one task small enough to finish today.",
    "- This week: group the rest into `research`, `build`, `send`, and `follow up`.",
    "- Friction check: remove one thing that will make you avoid starting.",
  ].join("\n");
}

function buildDecisionBody() {
  return [
    "**Decision brief:**",
    "- Best upside: what becomes easier if you choose it?",
    "- Main risk: what could cost time, money, energy, or trust?",
    "- Reversible or not: can you adjust later?",
    "- Next signal: what small test would make the decision clearer?",
  ].join("\n");
}
