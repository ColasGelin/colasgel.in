import { describe, expect, test } from "vitest";
import { entries } from "./entries";
import { profile } from "./profile";
import {
  FILTERS,
  KIND_COLORS,
  entryColor,
  filterEntries,
  resolveSelection,
  sampleLabel,
} from "./select";

const ids = (filter: Parameters<typeof filterEntries>[1]) =>
  filterEntries(entries, filter).map((e) => e.id);

describe("entries", () => {
  test("lists 13 entries with CyberBridge first", () => {
    expect(entries).toHaveLength(13);
    expect(entries[0].id).toBe("cyberbridge");
  });

  test("every entry has the required fields", () => {
    for (const e of entries) {
      expect(e.name).not.toBe("");
      expect(e.summary).not.toBe("");
      expect(e.built.length).toBeGreaterThan(0);
      expect(e.filters.length).toBeGreaterThan(0);
    }
  });

  test("every entry stays short", () => {
    for (const e of entries) {
      expect(e.built.length).toBeLessThanOrEqual(3);
      expect(e.stack.length).toBeLessThanOrEqual(4);
      for (const line of e.built) {
        expect(line.length).toBeLessThanOrEqual(60);
      }
    }
  });

  test("every entry has a visual", () => {
    for (const e of entries) {
      expect(e.sample, e.id).toBeDefined();
    }
  });

  test("the supermarket project uses its new name", () => {
    const entry = entries.find((e) => e.id === "supermarket");
    expect(entry?.name).toBe("Supermarket-Queue-Manager");
    expect(entry?.link?.href).toContain("/Supermarket-Queue-Manager");
    expect(JSON.stringify(entries)).not.toContain("MLOps-Waiting-Queue");
  });

  test("the four simulations say what is simulated", () => {
    const kinds = { tpv: "eeg", iot: "gitops", supermarket: "queue", context: "codesearch" };
    for (const [id, kind] of Object.entries(kinds)) {
      const sample = entries.find((e) => e.id === id)?.sample;
      expect(sample?.kind, id).toBe(kind);
      expect(JSON.stringify(sample), id).toMatch(/simulation/i);
    }
  });

  test("simulated entries still show their real output", () => {
    const visuals = (id: string) => entries.find((e) => e.id === id)?.visuals ?? [];
    expect(visuals("tpv").map((image) => image.src)).toEqual([
      "/samples/tpv/traces.webp",
      "/samples/tpv/psd.webp",
    ]);
    expect(visuals("supermarket")).toHaveLength(2);
  });

  test("Total-Perspective-Vortex names the method the repo uses", () => {
    const tpv = JSON.stringify(entries.find((e) => e.id === "tpv"));
    expect(tpv).toMatch(/PCA and LDA/);
    expect(tpv).not.toMatch(/CSP/);
  });

  test("Inception-of-Things credits GitLab", () => {
    const text = JSON.stringify(entries.find((e) => e.id === "iot"));
    expect(text).toContain("GitLab");
  });

  test("CumarAI names its agents", () => {
    const text = JSON.stringify(entries.find((e) => e.id === "cumarai"));
    expect(text).toMatch(/document, content and statistics agents/i);
    expect(text).toContain("LangSmith");
  });

  test("every link is https", () => {
    for (const e of entries) {
      if (e.link) expect(e.link.href).toMatch(/^https:\/\//);
    }
  });
});

describe("content rules", () => {
  test("the title is Full-Stack AI Engineer", () => {
    expect(profile.title).toBe("Full-Stack AI Engineer");
  });

  test("no private data", () => {
    const text = JSON.stringify(entries) + JSON.stringify(profile);
    expect(text).not.toMatch(/salary/i);
    expect(text).not.toMatch(/\+\d{2}[\s\d]{7,}/);
  });

  test("Master only appears as RNCP 7 (Master's level)", () => {
    const text = JSON.stringify(entries);
    expect(text.replaceAll("RNCP 7 (Master's level)", "")).not.toContain(
      "Master",
    );
  });

  test("Re-Fresh is qualified", () => {
    const text = JSON.stringify(entries.find((e) => e.id === "refresh"));
    expect(text).toContain("Málaga");
    expect(text).toContain("approximate model");
  });
});

describe("filterEntries", () => {
  test("all returns everything", () => {
    expect(ids("all")).toHaveLength(13);
  });

  test("work returns the jobs and the school", () => {
    expect(ids("work")).toEqual(["cyberbridge", "cumarai", "school42"]);
  });

  test("hackathons returns 2", () => {
    expect(ids("hackathons")).toHaveLength(2);
  });

  test("projects returns 8", () => {
    expect(ids("projects")).toHaveLength(8);
  });

  test("there is no 42 filter", () => {
    expect(FILTERS.map((f) => f.label)).toEqual([
      "All",
      "Experience",
      "Projects",
      "Hackathons",
    ]);
  });

  test("42 School comes right after CumarAI", () => {
    const all = ids("all");
    expect(all.indexOf("school42")).toBe(all.indexOf("cumarai") + 1);
  });

  test("42 projects stay under Projects with their tag", () => {
    expect(ids("projects")).toContain("wisdom");
    expect(entries.find((e) => e.id === "wisdom")?.tag).toBe("42");
  });
});

describe("entryColor", () => {
  const color = (id: string) =>
    entryColor(entries.find((e) => e.id === id) as (typeof entries)[number]);

  test("colours an entry by its kind", () => {
    expect(color("cumarai")).toBe(KIND_COLORS.work);
    expect(color("wisdom")).toBe(KIND_COLORS.projects);
    expect(color("lanoria")).toBe(KIND_COLORS.hackathons);
  });

  test("colours a work project as a project", () => {
    expect(ids("projects")).toContain("benchmark");
    expect(ids("work")).not.toContain("benchmark");
    expect(entries.find((e) => e.id === "benchmark")?.tag).toBe("work");
    expect(color("benchmark")).toBe(KIND_COLORS.projects);
  });

  test("files 42 School under education with its own colour", () => {
    expect(entries.find((e) => e.id === "school42")?.tag).toBe("education");
    expect(color("school42")).toBe(KIND_COLORS.education);
  });
});

describe("resolveSelection", () => {
  test("moves to the first visible entry when the selection is hidden", () => {
    expect(resolveSelection(entries, "hackathons", "cyberbridge")).toBe(
      "refresh",
    );
  });

  test("keeps a selection that is still visible", () => {
    expect(resolveSelection(entries, "all", "wisdom")).toBe("wisdom");
  });
});

describe("sampleLabel", () => {
  test("names each kind", () => {
    expect(sampleLabel({ kind: "snake", caption: "" })).toBe("Live");
    expect(sampleLabel({ kind: "refresh", caption: "" })).toBe("Live");
    expect(sampleLabel({ kind: "replay", src: "", caption: "" })).toBe(
      "Recorded run",
    );
    expect(
      sampleLabel({ kind: "diagram", id: "wisdom", caption: "" }),
    ).toBe("Diagram");
    expect(sampleLabel({ kind: "walkthrough", caption: "" })).toBe(
      "Simulation",
    );
    for (const kind of ["eeg", "gitops", "queue", "codesearch"] as const) {
      expect(sampleLabel({ kind, caption: "" })).toBe("Simulation");
    }
  });

  test("gallery and no sample have no label", () => {
    expect(sampleLabel({ kind: "gallery", images: [] })).toBeNull();
    expect(sampleLabel(undefined)).toBeNull();
  });
});
