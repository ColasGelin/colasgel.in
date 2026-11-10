"use client";

import { useState } from "react";
import type { SampleSpec } from "@/content/types";
import type { SampleProps } from ".";
import { action, panel } from "./controls";
import { useWait } from "./motion";

type Pod = "ready" | "old" | "starting" | "gone";
type App = { version: number; pods: Pod[] };
type Argo = "Synced" | "OutOfSync" | "Syncing";

const APPS = [0, 1, 2];
const PODS = [0, 1, 2];
const SYNCED = "Cluster matches Git.";
const box = "rounded border bg-bg px-3 py-2 text-center transition-colors";
const lit = "border-accent text-accent";
const waitingTone = "border-[#fcd34d] text-[#fcd34d]";

const podClass: Record<Pod, string> = {
  ready: "border-accent bg-accent",
  old: "border-line bg-line",
  starting: "border-dashed border-[#fcd34d]",
  gone: "border-dashed border-[#fda4af]",
};

export default function GitOps({}: SampleProps<Extract<SampleSpec, { kind: "gitops" }>>) {
  const [apps, setApps] = useState<App[]>(() =>
    APPS.map(() => ({ version: 1, pods: PODS.map(() => "ready") })),
  );
  const [argo, setArgo] = useState<Argo>("Synced");
  const [active, setActive] = useState<"push" | "gitlab" | null>(null);
  const [status, setStatus] = useState(SYNCED);
  const [busy, setBusy] = useState(false);
  const wait = useWait();

  function setPods(app: number, change: (pod: Pod, index: number) => Pod) {
    setApps((current) =>
      current.map((entry, index) =>
        index === app ? { ...entry, pods: entry.pods.map(change) } : entry,
      ),
    );
  }

  async function push(app: number) {
    const name = `app ${app + 1}`;
    const version = apps[app].version + 1;
    setBusy(true);
    setActive("push");
    setStatus(`git push: ${name} goes to v${version}.`);
    await wait(800);
    setActive("gitlab");
    setStatus("GitLab, inside the cluster, has the new commit.");
    await wait(900);
    setActive(null);
    setArgo("OutOfSync");
    setPods(app, () => "old");
    setStatus("Argo CD sees Git ahead of the cluster.");
    await wait(1100);
    setArgo("Syncing");
    setStatus(`Rolling out ${name}, one pod at a time.`);
    for (const pod of PODS) {
      setPods(app, (state, index) => (index === pod ? "starting" : state));
      await wait(650);
      setPods(app, (state, index) => (index === pod ? "ready" : state));
      await wait(250);
    }
    setApps((current) =>
      current.map((entry, index) => (index === app ? { ...entry, version } : entry)),
    );
    setArgo("Synced");
    setStatus(`${SYNCED} ${name} runs v${version}.`);
    setBusy(false);
  }

  async function kill() {
    const app = Math.floor(Math.random() * APPS.length);
    const pod = Math.floor(Math.random() * PODS.length);
    setBusy(true);
    setPods(app, (state, index) => (index === pod ? "gone" : state));
    setStatus(`A pod of app ${app + 1} died. Git still asks for 3.`);
    await wait(1100);
    setPods(app, (state, index) => (index === pod ? "starting" : state));
    setStatus("The cluster starts a replacement.");
    await wait(900);
    setPods(app, (state, index) => (index === pod ? "ready" : state));
    setStatus(SYNCED);
    setBusy(false);
  }

  return (
    <div className={panel}>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <div className={`${box} shrink-0 ${active === "push" ? lit : "border-line"}`}>
          git push
        </div>
        <span className="hidden text-muted sm:inline">→</span>
        <div className="min-w-0 flex-1 rounded-lg border border-dashed border-line p-3">
          <p className="mb-2 flex justify-between text-muted">
            <span>K3s cluster</span>
            <span>ingress</span>
          </p>
          <div className="mb-2 flex items-center gap-2">
            <div className={`${box} flex-1 ${active === "gitlab" ? lit : "border-line"}`}>
              GitLab
            </div>
            <span className="text-muted">→</span>
            <div className={`${box} flex-1 ${argo === "Synced" ? lit : waitingTone}`}>
              Argo CD · {argo}
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {apps.map((app, index) => (
              <div key={index} className="rounded border border-line bg-bg p-2">
                <p className="mb-2 flex justify-between gap-1 text-muted">
                  <span>app {index + 1}</span>
                  <span className="text-text">v{app.version}</span>
                </p>
                <div className="flex gap-1">
                  {app.pods.map((pod, podIndex) => (
                    <span
                      key={podIndex}
                      data-pod={pod}
                      className={`size-2.5 shrink-0 rounded-sm border transition-colors sm:size-4 ${podClass[pod]}`}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-1.5">
        <span className="text-muted">Push a new version of</span>
        {APPS.map((app) => (
          <button
            key={app}
            type="button"
            disabled={busy}
            onClick={() => push(app)}
            className={action}
          >
            app {app + 1}
          </button>
        ))}
        <button
          type="button"
          disabled={busy}
          onClick={kill}
          className={`${action} ml-auto`}
        >
          Kill a pod
        </button>
      </div>
      <p role="status" className="min-h-4 text-muted">
        {status}
      </p>
    </div>
  );
}
