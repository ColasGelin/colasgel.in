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
  checks?: { title: string; items: string[]; lastFails?: boolean };
  grace?: number;
};

export type Scenario = { id: string; label: string; steps: Step[] };

const ATTEMPT_1 = "attempt 1 of 3";
const ATTEMPT_2 = "attempt 2 of 3";
const ATTEMPT_3 = "attempt 3 of 3";
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
    items: [
      "Service healed",
      "Pull request opened",
      "Waiting for human review",
    ],
  },
};

const BAD_URL = "ValueError: invalid database URL";

const failedRetry = (
  name: string,
  part: Step["part"],
  attempt: string,
  say: string,
  llmLine: string,
  grace: number,
): Step => ({
  name,
  part,
  llm: true,
  target: "crashed",
  attempt,
  say,
  lines: [
    { tag: "llm", text: llmLine },
    { tag: "loop", text: "patch checks passed, committed" },
    { text: BAD_URL, tone: "error" },
    CRASH_DURING_GRACE,
  ],
  checks: {
    title: BY_CODE,
    items: ["Patch checks passed", "Stayed up for grace period"],
    lastFails: true,
  },
  grace,
});

export const SCENARIOS: Scenario[] = [
  {
    id: "import",
    label: "missing import",
    steps: [
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
    ],
  },
  {
    id: "env",
    label: "bad env var",
    steps: [
      crash("KeyError: 'DATABASE_URL'"),
      detect,
      diagnose(
        "DATABASE_URL, environ",
        "app/config.py",
        "app/main.py",
        "reads DATABASE_URL, which is not set",
      ),
      patch(
        "app/config.py",
        'DB = os.environ["DATABASE_URL"]',
        'DB = os.environ.get("DATABASE_URL", "")',
      ),
      commit("default DATABASE_URL in config.py"),
      stillCrashing(
        BAD_URL,
        "An empty value does not help: the service needs the real secret.",
      ),
      failedRetry(
        "Try 2",
        "analyst",
        ATTEMPT_2,
        "The model tries again from the new error.",
        "new diagnosis and patch from the latest log",
        30,
      ),
      failedRetry(
        "Try 3",
        "loop",
        ATTEMPT_3,
        "One last try. Three is the hard limit.",
        "third diagnosis and patch",
        55,
      ),
      {
        name: "Rollback",
        part: "git",
        target: "crashed",
        attempt: "gave up",
        say: "A missing secret can't be fixed from code, so Git restores the original and a human takes over.",
        lines: [
          { tag: "git", text: "restoring 4f2a91c" },
          { tag: "loop", text: "target restarted on the original code" },
          { tag: "loop", text: "CLEAN FAILURE: human needed", tone: "error" },
        ],
        checks: {
          title: "Rollback",
          items: [
            "Tree matches the original commit",
            "Auto-heal commits unreachable",
            "Failure shown on the dashboard",
          ],
        },
      },
    ],
  },
  {
    id: "syntax",
    label: "syntax error",
    steps: [
      crash("SyntaxError: expected ':'"),
      detect,
      diagnose(
        "health, routes",
        "app/routes.py",
        "app/main.py",
        "function is missing its colon",
      ),
      patch("app/routes.py", "def health()", "def health():"),
      commit("fix syntax in routes.py"),
      healed(ATTEMPT_1, 1),
      pullRequest,
    ],
  },
];
