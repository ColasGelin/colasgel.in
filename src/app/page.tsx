'use client'

import Scene from '../components/Scene';
import SecondPage from '../components/SecondPage';
import { useState, useEffect, Suspense } from 'react';
import { Power, Loader2 } from 'lucide-react';
import ThirdPage from '../components/ThirdPage';


export default function Home() {
  const [isLightOn, setIsLightOn] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [scrollDirection, setScrollDirection] = useState<'up' | 'down'>('down');
  const [hoveredIcon, setHoveredIcon] = useState<string | null>(null);

  useEffect(() => {
    // Prevent scrolling when light is off
    if (!isLightOn) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }

    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isLightOn]);

  useEffect(() => {
    let lastScrollY = 0;
    
    const handleScroll = () => {
      if (isLightOn) {
        const currentScrollY = window.scrollY;
        // console.log('Viewport scrollY:', currentScrollY);
        setScrollDirection(currentScrollY > lastScrollY ? 'down' : 'up');
        setScrollY(currentScrollY);
        lastScrollY = currentScrollY;
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isLightOn]);

  // Calculate opacity based on scroll position - only visible at top
  const buttonOpacity = scrollY === 0 ? 1 : 0;

  return (
    <>
      {/* First page - Scene with fixed position when light is on */}
      <div className={`${isLightOn ? 'fixed inset-0' : 'h-screen'} bg-[#00000000] flex items-center justify-center relative overflow-hidden z-0`}>
          <Scene
            activeTab=""
            sphereData={[]}
            onActiveSphereChange={() => {}}
            isLightOn={isLightOn}
            onModelsLoaded={setModelsLoaded}
            hoveredIcon={hoveredIcon}
          />
      </div>

      {/* Main Power Button - Fixed position */}
      <div
        className={`fixed left-1/2 transform -translate-x-1/2 z-30 ${
          isLightOn 
        ? 'bottom-8' 
        : 'bottom-1/2 translate-y-1/2'
        } ${
          isLightOn ? 'delay-0' : 'delay-500'
        }`}
        style={{ 
          opacity: isLightOn ? buttonOpacity : 1,
          transition: `all ${scrollY === 0 && buttonOpacity === 1 ? '1000ms' : '200ms'} ease-out`,
          transitionDelay: scrollY === 0 && buttonOpacity === 1 ? '500ms' : '0ms'
        }}
      >
        <button
          className="p-4 rounded-full cursor-pointer transition-all duration-300 hover:scale-105 bg-transparent shadow-none text-white drop-shadow-[0_0_8px_rgba(59,130,246,0.9)]"
          onClick={() => setIsLightOn(!isLightOn)}
          disabled={!modelsLoaded}
        >
            <Power size={50} className="text-white hover:scale-105 transition-all duration-300 cursor-pointer" />
        </button>
      </div>
      
      {/* Bottom Button - Fixed position */}
      <div className={`fixed bottom-40 left-1/2 transform -translate-x-1/2 z-30 ${
        isLightOn ? 'opacity-100' : 'opacity-0'
      } ${
        buttonOpacity < 1 ? 'delay-0' : 'delay-500'
      }`}
        style={{ 
          opacity: isLightOn ? buttonOpacity : 0,
          transition: `all ${scrollY === 0 && buttonOpacity === 1 ? '1000ms' : '200ms'} ease-out`,
          transitionDelay: scrollY === 0 && buttonOpacity === 1 ? '500ms' : '0ms'
        }}
      >
        <button 
          className="text-white text-xl lg:text-2xl font-mono hover:text-gray-300 transition-all duration-300 hover:scale-110 cursor-pointer"
          onClick={() => window.scrollTo({ top: window.innerHeight, behavior: 'smooth' })}
        >
          Explore my work
        </button>
      </div>

      {/* Content that appears when scrolling - starts right after the first viewport */}
      {isLightOn && (
        <div className="relative z-10" style={{ marginTop: '100vh' }}>
          <SecondPage />
          <ThirdPage onHoveredIconChange={setHoveredIcon} />
        </div>
      )}
    </>
  );
}