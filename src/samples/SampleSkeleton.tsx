export function SampleSkeleton({ className }: { className: string }) {
  return (
    <div
      role="status"
      aria-label="Loading sample"
      className={`w-full rounded border border-line bg-surface ${className}`}
    />
  );
}
