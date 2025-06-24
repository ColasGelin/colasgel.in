'use client'

import { useState, useRef, useEffect } from 'react';
import Scene from '../components/Scene';
import Navigation from '../components/Navigation';
import VideoContainer from '../components/VideoContainer';
import TitleManager from '../components/TitleManager';

// Define page configuration
const PAGES = [
  { id: 'home', title: 'COLAS GELIN', bgColor: 'bg-[#faedcd]' },
  { id: 'projects', title: 'MY WORK', bgColor: 'bg-[#faedcd]' },
  { id: 'contact', title: 'BUILD\nWITH ME', bgColor: 'bg-[#faedcd]' }
];

// Define video/website data for each sphere
const SPHERE_DATA = [
  {
    id: 0,
    videoSrc: '/video1.mp4',
    website: 'https://pizzapopote.com',
    color: 'orange'
  },
  {
    id: 1,
    videoSrc: '/video2.mp4',
    website: 'https://example1.com',
    color: 'gray'
  },
  {
    id: 2,
    videoSrc: '/video3.mp4',
    website: 'https://example2.com',
    color: 'gray'
  }
];

export default function Home() {
  const [opacity, setOpacity] = useState(0);
  const [isDisplayingVideo, setIsDisplayingVideo] = useState(true);
  const [activeTab, setActiveTab] = useState('home');
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [activeSphereIndex, setActiveSphereIndex] = useState(0); // Track which sphere is active
  const lastWheelTime = useRef(0);
  const isNavigating = useRef(false);
  const wheelTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const videoContainerRef = useRef<HTMLDivElement>(null);

  // Get current page index when activeTab changes
  useEffect(() => {
    const pageIndex = PAGES.findIndex(page => page.id === activeTab);
    if (pageIndex !== -1) {
      setCurrentPageIndex(pageIndex);
    }
  }, [activeTab]);

  const scrollToSection = (sectionId: string) => {
    if (isNavigating.current) return;
    
    isNavigating.current = true;
    setActiveTab(sectionId);
    
    setTimeout(() => {
      isNavigating.current = false;
    }, 1000);
  };

  const handleWheel = (event: WheelEvent) => {
    event.preventDefault();
    
    const now = Date.now();
    if (now - lastWheelTime.current < 100) return;
    
    lastWheelTime.current = now;
    
    if (wheelTimeoutRef.current) {
      clearTimeout(wheelTimeoutRef.current);
    }
    
    wheelTimeoutRef.current = setTimeout(() => {
      if (isNavigating.current) return;
      
      const currentIndex = PAGES.findIndex(page => page.id === activeTab);
      let nextIndex;
      
      if (event.deltaY > 0) {
        nextIndex = Math.min(currentIndex + 1, PAGES.length - 1);
      } else {
        nextIndex = Math.max(currentIndex - 1, 0);
      }
      
      if (nextIndex !== currentIndex) {
        scrollToSection(PAGES[nextIndex].id);
      }
    }, 0);
  };

  useEffect(() => {
    window.addEventListener('wheel', handleWheel, { passive: false });
    return () => {
      window.removeEventListener('wheel', handleWheel);
      if (wheelTimeoutRef.current) {
        clearTimeout(wheelTimeoutRef.current);
      }
    };
  }, [activeTab]);

  const handleButtonClick = () => {
    if (videoContainerRef.current) {
      if (isDisplayingVideo) {
        setOpacity(0);
        setTimeout(() => setIsDisplayingVideo(false), 500);
      } else {
        setIsDisplayingVideo(true);
        setTimeout(() => setOpacity(1), 100);
      }
    }
  };

  // Callback to receive active sphere from Scene
  const handleActiveSphereChange = (sphereIndex: number) => {
    setActiveSphereIndex(sphereIndex);
  };

  return (
    <>
      <Navigation activeTab={activeTab} onTabChange={scrollToSection} />

      <div className="flex h-screen overflow-x-auto scroll-smooth snap-x snap-mandatory">
        <div className={`min-w-full h-screen ${PAGES[currentPageIndex].bgColor} flex items-center justify-center relative overflow-hidden pt-20 snap-start`}>
          <TitleManager activeTab={activeTab} pageTitles={PAGES} />
          
          {activeTab === 'projects' && (
            <VideoContainer
              ref={videoContainerRef}
              opacity={opacity}
              isDisplayingVideo={isDisplayingVideo}
              onButtonClick={handleButtonClick}
              sphereData={SPHERE_DATA[activeSphereIndex]}
            />
          )}
          
          <Scene 
            activeTab={activeTab} 
            sphereData={SPHERE_DATA}
            onActiveSphereChange={handleActiveSphereChange}
          />
        </div>
      </div>
    </>
  );
}