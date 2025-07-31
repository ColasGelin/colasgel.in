'use client'

interface ThirdPageProps {
  className?: string;
}

export default function ThirdPage({ className = '' }: ThirdPageProps) {
  return (
    <div className={`min-h-screen bg-slate-900 flex items-center justify-center ${className}`}>
      <h1 className="text-6xl font-bold text-white">Third Page</h1>
    </div>
  );
}
