import { profile } from "@/content/profile";

export function Header({ compact }: { compact: boolean }) {
  const shared = "transition-all duration-300 motion-reduce:transition-none";

  return (
    <header
      data-compact={compact}
      className={`sticky top-0 z-10 flex justify-between gap-x-8 border-b border-line bg-bg ${shared} ${
        compact
          ? "mb-38 h-14 items-center motion-reduce:mb-0 md:mb-36 md:motion-reduce:mb-0"
          : "h-52 flex-col justify-center gap-y-2 md:h-50 md:flex-row md:items-center md:justify-between"
      }`}
    >
      <div className="min-w-0">
        <h1
          className={`font-semibold whitespace-nowrap ${shared} ${
            compact ? "text-lg" : "text-4xl md:text-6xl"
          }`}
        >
          {profile.name}
          <span
            className={`font-mono font-normal text-accent ${shared} ${
              compact
                ? "ml-3 hidden text-sm sm:inline"
                : "block text-base md:ml-4 md:inline md:text-xl"
            }`}
          >
            {profile.title}
          </span>
        </h1>
        <div
          aria-hidden={compact}
          className={`overflow-hidden ${shared} ${
            compact ? "max-h-0 opacity-0" : "mt-2 max-h-28 opacity-100"
          }`}
        >
          <p className="text-sm text-muted md:text-base">{profile.tagline}</p>
          <p className="mt-1 font-mono text-xs text-muted">
            {profile.availability}
          </p>
        </div>
      </div>
      <p
        className={`flex shrink-0 gap-3 font-mono text-xs ${shared} ${
          compact ? "" : "md:self-end md:pb-4"
        }`}
      >
        {profile.links.map((link) => (
          <a key={link.label} href={link.href} className="hover:text-accent">
            {link.label}
          </a>
        ))}
      </p>
    </header>
  );
}
