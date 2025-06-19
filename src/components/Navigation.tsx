'use client'

interface NavigationProps {
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

export default function Navigation({ activeTab, onTabChange }: NavigationProps) {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50">
      <div className="flex justify-center px-6 py-4">
        <div className="flex space-x-2">
          {[
            { id: 'home', label: 'Home' },
            { id: 'project', label: 'Project' },
            { id: 'contact', label: 'Contact' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`px-6 py-3 rounded-3xl font-semibold shadow-lg transition-all duration-200 ${
                activeTab === tab.id
                  ? 'bg-[#fefae0] text-black shadow-xl'
                  : 'bg-[#e9c46a] bg-opacity-50 text-[#6f4e37] hover:bg-[#fefae0] hover:text-black'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
}
