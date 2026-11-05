const BARS = [0, 1, 2, 3, 4, 5, 6];

export function Phone() {
  return (
    <div className="flex items-center justify-center gap-6 p-4 font-mono text-xs">
      <div className="flex h-72 w-40 flex-col gap-2 rounded-[1.5rem] border-2 border-line bg-bg p-2.5">
        <div className="relative flex-1 rounded-xl bg-surface">
          <span className="absolute top-3 left-3 size-4 border-t-2 border-l-2 border-accent" />
          <span className="absolute top-3 right-3 size-4 border-t-2 border-r-2 border-accent" />
          <span className="absolute bottom-3 left-3 size-4 border-b-2 border-l-2 border-accent" />
          <span className="absolute right-3 bottom-3 size-4 border-r-2 border-b-2 border-accent" />
          <span className="absolute inset-0 flex items-center justify-center text-muted">
            camera
          </span>
        </div>
        <div className="flex h-8 items-center justify-center gap-1">
          {BARS.map((bar) => (
            <span
              key={bar}
              className="voice-bar w-1 rounded-full bg-accent"
              style={{ animationDelay: `${bar * 0.12}s` }}
            />
          ))}
        </div>
        <p className="danger-flash rounded bg-surface py-1 text-center">
          Danger alert
        </p>
      </div>
      <ul className="flex flex-col gap-3 text-muted">
        <li>Reads the camera</li>
        <li>Asks Gemini</li>
        <li>Speaks in Spanish</li>
        <li>Vibrates on danger</li>
      </ul>
    </div>
  );
}
