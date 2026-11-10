export const chip = (on: boolean) =>
  `cursor-pointer rounded px-2.5 py-1 transition-colors ${
    on ? "bg-accent text-bg" : "text-muted hover:text-text"
  }`;

export const action =
  "cursor-pointer rounded border border-line bg-bg px-2.5 py-1 text-text transition-colors hover:border-accent hover:text-accent disabled:cursor-default disabled:opacity-40 disabled:hover:border-line disabled:hover:text-text";

export const panel =
  "flex flex-col gap-3 rounded border border-line bg-surface p-3 font-mono text-xs";
