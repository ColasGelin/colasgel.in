import { describe, expect, test } from "vitest";
import { entries } from "./entries";
import { profile } from "./profile";
import { filterEntries, resolveSelection, sampleLabel } from "./select";

const ids = (filter: Parameters<typeof filterEntries>[1]) =>
  filterEntries(entries, filter).map((e) => e.id);

describe("entries", () => {
  test("lists 12 entries with CyberBridge first", () => {
    expect(entries).toHaveLength(12);
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

  test("every link is https", () => {
    for (const e of entries) {
      if (e.link) expect(e.link.href).toMatch(/^https:\/\//);
    }
  });
});

describe("content rules", () => {
  test("no private data", () => {
    const text = JSON.stringify(entries) + JSON.stringify(profile);
    for (const banned of ["salary"]) {
      expect(text).not.toContain(banned);
    }
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
    expect(ids("all")).toHaveLength(12);
  });

  test("work returns the two jobs", () => {
    expect(ids("work")).toEqual(["cyberbridge", "cumarai"]);
  });

  test("hackathons returns 2", () => {
    expect(ids("hackathons")).toHaveLength(2);
  });

  test("projects returns 7", () => {
    expect(ids("projects")).toHaveLength(7);
  });

  test("42 returns 6 including the school", () => {
    expect(ids("42")).toHaveLength(6);
    expect(ids("42")).toContain("school42");
    expect(ids("42")).toContain("wisdom");
  });

  test("an entry can sit in several filters", () => {
    expect(ids("projects")).toContain("wisdom");
    expect(ids("42")).toContain("wisdom");
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
  });

  test("gallery and no sample have no label", () => {
    expect(sampleLabel({ kind: "gallery", images: [] })).toBeNull();
    expect(sampleLabel(undefined)).toBeNull();
  });
});
