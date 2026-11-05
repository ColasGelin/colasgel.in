const APPS = ["app 1", "app 2", "app 3"];
const PODS = [0, 1, 2];

export function Cluster() {
  return (
    <div className="grid gap-3 p-4 font-mono text-xs sm:grid-cols-[7rem_1fr]">
      <div className="flex gap-2 sm:flex-col sm:justify-center">
        <div className="flex-1 rounded border border-line bg-bg p-3 text-center sm:flex-none">
          Git repo
        </div>
        <div className="self-center text-muted">
          <span className="sm:hidden">→</span>
          <span className="hidden text-center sm:block">↓</span>
        </div>
        <div className="flex-1 rounded border border-accent bg-bg p-3 text-center text-accent sm:flex-none">
          Argo CD
        </div>
      </div>
      <div className="rounded-lg border border-dashed border-line p-3">
        <p className="mb-2 flex justify-between text-muted">
          <span>K3s cluster</span>
          <span>ingress</span>
        </p>
        <div className="grid grid-cols-3 gap-2">
          {APPS.map((app, appIndex) => (
            <div key={app} className="rounded border border-line bg-bg p-2">
              <p className="mb-2 text-muted">{app}</p>
              <div className="flex gap-1.5">
                {PODS.map((pod) => (
                  <span
                    key={pod}
                    className="rollout-pod size-4 rounded-sm"
                    style={{ animationDelay: `${appIndex * 0.9 + pod * 0.25}s` }}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
