export type Line = {
  tag?: string;
  text: string;
  tone?: "error" | "success";
};

export type Step = {
  name: string;
  part: "target" | "observer" | "analyst" | "loop" | "git";
  llm?: boolean;
  target: "crashed" | "healed";
  attempt: string;
  say: string;
  lines: Line[];
  checks?: {
    title: string;
    items: string[];
    lastFails?: boolean;
    plain?: boolean;
  };
  grace?: number;
};

const ATTEMPT_1 = "attempt 1 of 3";
const ATTEMPT_2 = "attempt 2 of 3";
const BY_CODE = "Validated by code";
const CRASH_DURING_GRACE: Line = {
  tag: "verify",
  text: "crash event during grace period",
  tone: "error",
};

const crash = (error: string): Step => ({
  name: "Crash",
  part: "target",
  target: "crashed",
  attempt: "crash",
  say: "A bug is planted and the service dies on start.",
  lines: [
    { tag: "$", text: 'git commit -m "plant bug"' },
    { tag: "$", text: "docker restart target" },
    { text: error, tone: "error" },
    { text: "target exited with code 1", tone: "error" },
  ],
});

const detect: Step = {
  name: "Detect",
  part: "observer",
  target: "crashed",
  attempt: "crash",
  say: "Log patterns and HTTP checks raise the event.",
  lines: [
    { tag: "observer", text: "state: exited (1)" },
    { tag: "observer", text: "GET /health: connection refused" },
    { tag: "observer", text: "crash event raised, 4 duplicates merged" },
  ],
  checks: {
    title: "Observer",
    items: [
      "Non-zero exit",
      "HTTP check failed",
      "Deduplicated to one event",
      "No heal already running",
    ],
  },
};

const diagnose = (
  identifiers: string,
  file: string,
  runnerUp: string,
  reason: string,
): Step => ({
  name: "Diagnose",
  part: "analyst",
  llm: true,
  target: "crashed",
  attempt: ATTEMPT_1,
  say: "Code retrieves the candidates, then the model picks the file.",
  lines: [
    { tag: "analyst", text: `identifiers: ${identifiers}` },
    { tag: "analyst", text: `chroma top-k  0.91 ${file}  0.62 ${runnerUp}` },
    { tag: "llm", text: `"${file}": ${reason}` },
  ],
  checks: {
    title: BY_CODE,
    items: ["Valid JSON", "Summary not empty", "File exists in the index"],
  },
});

const patch = (file: string, before: string, after: string): Step => ({
  name: "Patch",
  part: "loop",
  llm: true,
  target: "crashed",
  attempt: ATTEMPT_1,
  say: "The model writes the fix, then code decides if it is safe.",
  lines: [
    { tag: "llm", text: `writing ${file} as a JSON patch` },
    { text: `- ${before}`, tone: "error" },
    { text: `+ ${after}`, tone: "success" },
  ],
  checks: {
    title: BY_CODE,
    items: [
      "3 files or fewer",
      "No placeholder content",
      "Not shrunk over 60%",
      "No retrieval markers",
    ],
  },
});

const commit = (message: string): Step => ({
  name: "Commit",
  part: "git",
  target: "crashed",
  attempt: ATTEMPT_1,
  say: "The original commit is saved first, so a rollback is exact.",
  lines: [
    { tag: "git", text: "snapshot 4f2a91c" },
    { tag: "git", text: `commit on iow/auto-heal: ${message}` },
  ],
  checks: {
    title: "Git",
    plain: true,
    items: [
      "Original commit saved",
      "Patch applied atomically",
      "On its own branch",
    ],
  },
});

const healed = (attempt: string, count: number): Step => ({
  name: "Verify",
  part: "target",
  target: "healed",
  attempt,
  say: "The model has no say here: the service must stay up.",
  lines: [
    { tag: "loop", text: "docker restart target" },
    { tag: "verify", text: "GET /health 200, no new crash" },
    { tag: "verify", text: `HEALED on attempt ${count}`, tone: "success" },
  ],
  checks: {
    title: "Verify",
    items: [
      "Container started",
      "Stayed up for grace period",
      "No new crash event",
    ],
  },
  grace: 100,
});

const stillCrashing = (error: string, say: string): Step => ({
  name: "Verify",
  part: "target",
  target: "crashed",
  attempt: ATTEMPT_1,
  say,
  lines: [
    { tag: "loop", text: "docker restart target" },
    { text: error, tone: "error" },
    CRASH_DURING_GRACE,
  ],
  checks: {
    title: "Verify",
    items: ["Container started", "Stayed up for grace period"],
    lastFails: true,
  },
  grace: 45,
});

const pullRequest: Step = {
  name: "PR",
  part: "git",
  target: "healed",
  attempt: "healed",
  say: "The agent proposes. A human decides.",
  lines: [{ tag: "git", text: "pull request: iow/auto-heal -> main" }],
  checks: {
    title: "Result",
    plain: true,
    items: [
      "Service healed",
      "Pull request opened",
      "Waiting for human review",
    ],
  },
};

export const STEPS: Step[] = [
  crash("ModuleNotFoundError: No module named 'helpers'"),
  detect,
  diagnose(
    "helpers, greet",
    "app/main.py",
    "app/utils.py",
    "imports a module that does not exist",
  ),
  patch(
    "app/main.py",
    "from helpers import greet",
    "from utils import greet",
  ),
  commit("fix import in main.py"),
  stillCrashing(
    "ImportError: cannot import name 'greet' from 'utils'",
    "The first fix was wrong: a new error appears.",
  ),
  {
    name: "Try 2",
    part: "analyst",
    llm: true,
    target: "crashed",
    attempt: ATTEMPT_2,
    say: "The new error goes back to the model, which writes a second fix.",
    lines: [
      { tag: "llm", text: "new error: greet lives in app/text.py" },
      { text: "- from utils import greet", tone: "error" },
      { text: "+ from text import greet", tone: "success" },
      { tag: "git", text: "commit on iow/auto-heal: fix greet import" },
    ],
    checks: {
      title: BY_CODE,
      items: [
        "Valid JSON",
        "File exists in the index",
        "Patch checks passed",
      ],
    },
  },
  healed(ATTEMPT_2, 2),
  pullRequest,
];
