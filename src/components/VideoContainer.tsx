'use client'

import { forwardRef, useEffect, useState } from 'react';

interface SphereData {
  id: number;
  videoSrc: string;
  website: string;
  color: string;
}

interface VideoContainerProps {
  opacity: number;
  isDisplayingVideo: boolean;
  onButtonClick: () => void;
  sphereData: SphereData;
}

const VideoContainer = forwardRef<HTMLDivElement, VideoContainerProps>(
  ({ isDisplayingVideo, sphereData }, ref) => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
      // Trigger entrance animation
      setTimeout(() => {
        setIsVisible(true);
      }, 100);
    }, []);

    const handleVideoClick = () => {
      // Open the website associated with the current active sphere
      window.open(sphereData.website, '_blank');
    };

    return (
      <>
        <div 
          ref={ref}
          className={`absolute left-1/2 top-24 transform -translate-x-1/2 w-160 h-90 rounded-4xl shadow-lg z-20 transition-all duration-700 ease-out overflow-hidden flex items-center justify-center cursor-pointer hover:scale-105 ${
            isVisible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-12 scale-95'
          }`}
          style={{ 
            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0))',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)'
          }}
          onClick={handleVideoClick}
        >
          <video
            key={sphereData.id} // Force re-render when sphere changes
            className={`absolute inset-0 w-full h-full object-cover rounded-4xl transition-opacity duration-1000 ${isDisplayingVideo ? 'opacity-100' : 'opacity-0'}`}
            muted
            loop
            autoPlay
          >
            <source src={sphereData.videoSrc} type="video/mp4" />
          </video>
        </div>
      </>
    );
  }
);

VideoContainer.displayName = 'VideoContainer';

export default VideoContainer;