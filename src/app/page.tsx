import { Header } from "@/components/Header";
import { Portfolio } from "@/components/Portfolio";
import { ProfileBlock } from "@/components/ProfileBlock";

export default function Home() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-6 md:px-6">
      <Header />
      <Portfolio />
      <ProfileBlock />
    </main>
  );
}
