const APPS = ["app 1", "app 2", "app 3"];
const PODS = [0, 1, 2];
const box = "rounded border bg-bg px-3 py-2 text-center";

export function Cluster() {
  return (
    <div className="flex items-center gap-2 p-4 font-mono text-xs">
      <div className={`${box} shrink-0 border-line`}>git push</div>
      <span className="text-muted">→</span>
      <div className="min-w-0 flex-1 rounded-lg border border-dashed border-line p-3">
        <p className="mb-2 flex justify-between text-muted">
          <span>K3s cluster</span>
          <span>ingress</span>
        </p>
        <div className="mb-2 flex items-center gap-2">
          <div className={`${box} flex-1 border-line`}>GitLab</div>
          <span className="text-muted">→</span>
          <div className={`${box} flex-1 border-accent text-accent`}>Argo CD</div>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {APPS.map((app, appIndex) => (
            <div key={app} className="rounded border border-line bg-bg p-2">
              <p className="mb-2 text-muted">{app}</p>
              <div className="flex gap-1">
                {PODS.map((pod) => (
                  <span
                    key={pod}
                    className="rollout-pod size-2.5 shrink-0 rounded-sm sm:size-4"
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
