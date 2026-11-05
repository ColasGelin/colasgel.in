import { profile } from "@/content/profile";

export function Header() {
  return (
    <header className="flex flex-wrap items-end justify-between gap-x-8 gap-y-3 border-b border-line pb-5">
      <div>
        <h1 className="text-2xl font-semibold">
          {profile.name}
          <span className="ml-3 font-mono text-base font-normal text-accent">
            {profile.title}
          </span>
        </h1>
        <p className="mt-1 text-sm text-muted">{profile.tagline}</p>
      </div>
      <div className="font-mono text-xs text-muted md:text-right">
        <p>{profile.availability}</p>
        <p className="mt-1 flex gap-3 md:justify-end">
          {profile.links.map((link) => (
            <a key={link.label} href={link.href} className="text-text hover:text-accent">
              {link.label}
            </a>
          ))}
        </p>
      </div>
    </header>
  );
}
