import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import GitOps from "./GitOps";

const spec = { kind: "gitops", caption: "c" } as const;
const tick = (ms: number) =>
  act(async () => {
    await vi.advanceTimersByTimeAsync(ms);
  });
const pods = (container: HTMLElement, state: string) =>
  container.querySelectorAll(`[data-pod="${state}"]`).length;

describe("GitOps", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  test("shows the cluster in sync", () => {
    const { container } = render(<GitOps spec={spec} onError={vi.fn()} />);
    for (const label of ["git push", "K3s cluster", "ingress", "GitLab", "Argo CD · Synced"]) {
      expect(screen.getByText(label)).toBeInTheDocument();
    }
    expect(pods(container, "ready")).toBe(9);
    expect(screen.getByRole("status")).toHaveTextContent("Cluster matches Git.");
  });

  test("a push goes through GitLab and Argo CD to the pods", async () => {
    const { container } = render(<GitOps spec={spec} onError={vi.fn()} />);
    fireEvent.click(screen.getByRole("button", { name: "app 2" }));
    expect(screen.getByRole("status")).toHaveTextContent("git push: app 2 goes to v2.");
    expect(screen.getByRole("button", { name: "app 1" })).toBeDisabled();
    await tick(800);
    expect(screen.getByRole("status")).toHaveTextContent(/GitLab/);
    await tick(900);
    expect(screen.getByText("Argo CD · OutOfSync")).toBeInTheDocument();
    expect(pods(container, "old")).toBe(3);
    await tick(1100);
    expect(screen.getByText("Argo CD · Syncing")).toBeInTheDocument();
    expect(pods(container, "starting")).toBe(1);
    await tick(5000);
    expect(screen.getByText("Argo CD · Synced")).toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent("app 2 runs v2.");
    expect(pods(container, "ready")).toBe(9);
    expect(screen.getAllByText("v1")).toHaveLength(2);
    expect(screen.getByRole("button", { name: "app 1" })).toBeEnabled();
  });

  test("a killed pod is replaced", async () => {
    const { container } = render(<GitOps spec={spec} onError={vi.fn()} />);
    fireEvent.click(screen.getByRole("button", { name: "Kill a pod" }));
    expect(pods(container, "gone")).toBe(1);
    await tick(1100);
    expect(pods(container, "starting")).toBe(1);
    await tick(900);
    expect(pods(container, "ready")).toBe(9);
    expect(screen.getByRole("status")).toHaveTextContent("Cluster matches Git.");
  });

  test("unmounting mid-rollout clears the timers", async () => {
    const { unmount } = render(<GitOps spec={spec} onError={vi.fn()} />);
    fireEvent.click(screen.getByRole("button", { name: "app 1" }));
    await tick(100);
    expect(vi.getTimerCount()).toBeGreaterThan(0);
    unmount();
    expect(vi.getTimerCount()).toBe(0);
  });
});
