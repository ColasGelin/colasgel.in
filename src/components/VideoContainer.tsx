'use client'

import { forwardRef } from 'react';

interface VideoContainerProps {
  opacity: number;
  isDisplayingVideo: boolean;
  onButtonClick: () => void;
}

const VideoContainer = forwardRef<HTMLDivElement, VideoContainerProps>(
  ({ opacity, isDisplayingVideo, onButtonClick }, ref) => {
    return (
      <>
        <div className="absolute top-32 right-78 transform -translate-x-1/2 z-20">
          <button 
            className="website-button bg-[#fefae0] text-black px-6 py-3 rounded-3xl font-semibold shadow-lg transition-colors opacity-0 z-10 cursor-pointer"
            onClick={onButtonClick}
          >
            See the website
          </button>
        </div>
        <div 
          ref={ref}
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
            className={`absolute inset-0 w-full h-full object-cover rounded-4xl transition-opacity duration-1000 ${isDisplayingVideo ? 'opacity-100' : 'opacity-0'}`}
            muted
            loop
            autoPlay
          >
            <source src="/your-video.mp4" type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </div>
      </>
    );
  }
);

VideoContainer.displayName = 'VideoContainer';

export default VideoContainer;
