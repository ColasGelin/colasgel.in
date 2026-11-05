import { profile } from "@/content/profile";

export function ProfileBlock() {
  return (
    <section className="mt-8 border-t border-line pt-5">
      <dl className="grid gap-x-8 gap-y-2 font-mono text-xs sm:grid-cols-2">
        {profile.skills.map((skill) => (
          <div key={skill.group}>
            <dt className="text-muted">{skill.group}</dt>
            <dd>{skill.items.join(" · ")}</dd>
          </div>
        ))}
        <div>
          <dt className="text-muted">Spoken languages</dt>
          <dd>{profile.languages.join(" · ")}</dd>
        </div>
        <div>
          <dt className="text-muted">Certifications</dt>
          {profile.certifications.map((certification) => (
            <dd key={certification}>{certification}</dd>
          ))}
        </div>
      </dl>
    </section>
  );
}
