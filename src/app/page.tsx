'use client'

import Scene from "@/components/Scene";
import Navigation from "@/components/Navigation";
import VideoContainer from "@/components/VideoContainer";
import { useAnimations } from "@/hooks/useAnimations";
import { useState, useEffect } from "react";

export default function Home() {
  const [opacity, setOpacity] = useState(1);
  const [isDisplayingVideo, setIsDisplayingVideo] = useState(false);
  const [activeTab, setActiveTab] = useState('home');
  
  const {
    videoContainerRef,
    animateButtonIn,
    animateButtonOut,
    slideVideoContainerOut,
    slideVideoContainerIn
  } = useAnimations();

  const handleWheel = () => {
    animateButtonOut()
    setIsDisplayingVideo(false);
    setOpacity(0);
    setTimeout(() => {
      setOpacity(1);
      animateButtonIn();
    }, 1000);
    setTimeout(() => {
      setIsDisplayingVideo(true);
    }, 1100);
  };

  const handleButtonClick = () => {
    window.open('https://pizzapopote.com', '_blank');
  };

  const scrollToSection = (sectionId: string) => {
    const previousTab = activeTab;
    setActiveTab(sectionId);
    
    if (previousTab === 'project' && sectionId !== 'project') {
      slideVideoContainerOut();
    }
    
    if (previousTab !== 'project' && sectionId === 'project') {
      slideVideoContainerIn();
    }
  };

  const navigateToSection = (direction: 'left' | 'right') => {
    const sections = ['home', 'project', 'contact'];
    const currentIndex = sections.indexOf(activeTab);
    
    let newIndex;
    if (direction === 'left') {
      newIndex = currentIndex > 0 ? currentIndex - 1 : sections.length - 1;
    } else {
      newIndex = currentIndex < sections.length - 1 ? currentIndex + 1 : 0;
    }
    
    const newSection = sections[newIndex];
    scrollToSection(newSection);
  };

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key === 'ArrowLeft') {
        navigateToSection('left');
      } else if (event.key === 'ArrowRight') {
        navigateToSection('right');
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [activeTab]);

  return (
    <>
      <Navigation activeTab={activeTab} onTabChange={scrollToSection} />

      <div className="flex h-screen overflow-x-auto scroll-smooth snap-x snap-mandatory">
        <div id="project" className="min-w-full h-screen bg-[#faedcd] flex items-center justify-center relative overflow-hidden pt-20 snap-start">
          <div className="absolute flex items-center justify-center">
            <h1 className="text-[16rem] font-bold text-[#fefae0] select-none barber-font ">
              COLAS GELIN
            </h1>
          </div>
          
          <VideoContainer
            ref={videoContainerRef}
            opacity={opacity}
            isDisplayingVideo={isDisplayingVideo}
            onButtonClick={handleButtonClick}
          />
          
          <Scene onWheel={handleWheel} activeTab={activeTab} />
        </div>
      </div>
    </>
  );
}