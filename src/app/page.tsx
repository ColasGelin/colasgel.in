import { Portfolio } from "@/components/Portfolio";
import { ProfileBlock } from "@/components/ProfileBlock";

export default function Home() {
  return (
    <main className="mx-auto max-w-6xl px-4 pb-6 motion-safe:min-h-[calc(100vh+9rem)] md:px-6">
      <Portfolio />
      <ProfileBlock />
    </main>
  );
}
