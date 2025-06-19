import { useRef } from 'react';
import { animate } from 'animejs';

export function useAnimations() {
  const videoContainerRef = useRef<HTMLDivElement>(null);

  const animateButtonIn = (delay = 500) => {
    animate('.website-button', {
      translateY: [100, 0],
      opacity: [0, 1],
      duration: 1000,
      delay: delay,
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

  const slideVideoContainerOut = () => {
    animateButtonOut();
    animate(videoContainerRef.current, {
      translateX: window.innerWidth + 400,
      duration: 500,
      easing: 'easeInOutQuad'
    });
  };

  const slideVideoContainerIn = () => {
    animateButtonIn();
    animate(videoContainerRef.current, {
      translateX: 0,
      duration: 500,
      easing: 'easeInOutQuad'
    });
  };

  return {
    videoContainerRef,
    animateButtonIn,
    animateButtonOut,
    slideVideoContainerOut,
    slideVideoContainerIn
  };
}
