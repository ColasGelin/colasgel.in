'use client'

import Scene from "@/components/Scene";
import { useState, useEffect, useRef } from "react";
import { animate } from 'animejs';

export default function Home() {
  const [opacity, setOpacity] = useState(1);
  const [isDisplayingVideo, setIsDisplayingVideo] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const animateButtonIn = () => {
    animate('.website-button', {
      translateY: [100, 0],
      opacity: [0, 1],
      duration: 1000,
      delay: 500,
      ease: 'outElastic(1, 0.8)',
    });
  };

  const animateButtonOut = () => {
    animate('.website-button', {
      opacity: [1, 0],
      duration: 200,
      delay: 0,
      ease: 'easeInOut',
    });
  };

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

  return (
    <>
      <div className="min-h-screen bg-[#faedcd] flex items-center justify-center relative overflow-hidden">
        <div className="absolute flex items-center justify-center">
            <h1 className="text-[16rem] font-bold text-[#fefae0] select-none barber-font ">
            COLAS GELIN
            </h1>
        </div>
        <div className="absolute top-32 right-78 transform -translate-x-1/2 z-20">
            <button 
              className="website-button bg-white text-black px-6 py-3 rounded-3xl font-semibold shadow-lg hover:bg-gray-100 transition-colors opacity-0 z-10 cursor-pointer"
              onClick={handleButtonClick}
            >
            See the website
            </button>
          </div>
          <div 
            className="absolute right-40 top-1/2 transform -translate-y-1/2 w-160 h-90 rounded-4xl shadow-lg z-20 transition-opacity duration-500 overflow-hidden flex items-center justify-center cursor-none"
            style={{ 
              opacity,
              background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0))',
              backdropFilter: 'blur(10px)',
              WebkitBackdropFilter: 'blur(10px)',
              boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)'
            }}
          >
            <video
              ref={videoRef}
              className={`absolute inset-0 w-full h-full object-cover rounded-4xl transition-opacity duration-1000 ${isDisplayingVideo ? 'opacity-100' : 'opacity-0'}`}
              muted
              loop
              autoPlay
            >
              <source src="/your-video.mp4" type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </div>
        <Scene onWheel={handleWheel} />
      </div>
      {/* Additional sections to enable scrolling */}
      <div className="h-screen bg-gray-500"></div>
    </>
  );
}
