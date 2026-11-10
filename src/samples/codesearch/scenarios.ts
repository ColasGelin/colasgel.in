// An illustrative codebase. File names and similarity scores are examples, not project output.
export const FILES = [
  "api/routes.py",
  "api/auth.py",
  "db/models.py",
  "db/session.py",
  "services/email.py",
  "services/payments.py",
  "utils/retry.py",
  "utils/logging.py",
  "tests/test_auth.py",
  "config.py",
  "http/client.py",
  "workers/queue.py",
];

type Hit = { file: number; score: number };
export type Scenario =
  | { kind: "ask"; prompt: string; hits: Hit[]; answer: string }
  | { kind: "change"; prompt: string; hits: Hit[]; patch: string; passes: boolean; result: string };

export const SCENARIOS: Scenario[] = [
  {
    kind: "ask",
    prompt: "Where do we check a password?",
    hits: [
      { file: 1, score: 0.91 },
      { file: 2, score: 0.78 },
      { file: 8, score: 0.74 },
    ],
    answer:
      "Passwords are checked in api/auth.py, which loads the user through db/models.py. tests/test_auth.py covers both the valid and the wrong-password case.",
  },
  {
    kind: "ask",
    prompt: "How are failed payments retried?",
    hits: [
      { file: 5, score: 0.89 },
      { file: 6, score: 0.84 },
      { file: 11, score: 0.71 },
    ],
    answer:
      "services/payments.py wraps the charge call with the helper in utils/retry.py. Payments that still fail are handed to workers/queue.py to try again later.",
  },
  {
    kind: "change",
    prompt: "Add a timeout to the HTTP client",
    hits: [
      { file: 10, score: 0.93 },
      { file: 9, score: 0.8 },
      { file: 6, score: 0.66 },
    ],
    patch: "http/client.py",
    passes: true,
    result: "Checks pass. The patch is kept.",
  },
  {
    kind: "change",
    prompt: "Rename the users table",
    hits: [
      { file: 2, score: 0.92 },
      { file: 3, score: 0.81 },
      { file: 8, score: 0.77 },
    ],
    patch: "db/models.py",
    passes: false,
    result: "Checks fail. The patch is rolled back and the code is unchanged.",
  },
];
