import { profile } from "@/content/profile";

export function ProfileBlock() {
  return (
    <section className="mt-8 border-t border-line pt-5">
      <dl className="flex flex-col gap-1 font-mono text-xs">
        <div className="flex flex-wrap gap-x-3">
          <dt className="text-muted">Main stack</dt>
          <dd>{profile.stack.join(" · ")}</dd>
        </div>
        <div className="flex flex-wrap gap-x-3">
          <dt className="text-muted">Languages</dt>
          <dd>{profile.languages.join(" · ")}</dd>
        </div>
      </dl>
    </section>
  );
}
