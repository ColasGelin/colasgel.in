import React, { useState, useEffect, useRef } from 'react';

const CustomSpinner = ({ 
  size = 48, 
  speed = 2,
  targetPosition = 315,
  isSpinning = true,
  strokeWidth = 4,
  className = ''
}) => {
  const [currentRotation, setCurrentRotation] = useState(0);
  const animationRef = useRef();
  const startTimeRef = useRef();
  const startRotationRef = useRef(0);

  useEffect(() => {
    if (isSpinning) {
      // Continuous spinning
      const animate = () => {
        setCurrentRotation(prev => (prev + speed) % 360);
        animationRef.current = requestAnimationFrame(animate);
      };
      animationRef.current = requestAnimationFrame(animate);
    } else {
      // Stop animation - gradually slow down to target position
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      
      startTimeRef.current = Date.now();
      startRotationRef.current = currentRotation;
      
      const animateStop = () => {
        const elapsed = Date.now() - startTimeRef.current;
        const duration = 2000; // 2 seconds to stop
        
        if (elapsed < duration) {
          const progress = elapsed / duration;
          // Ease-out function for smooth deceleration
          const easeProgress = 1 - Math.pow(1 - progress, 3);
          
          // Calculate clockwise path to target
          let startRot = startRotationRef.current % 360;
          let targetRot = targetPosition;
          let diff = targetRot - startRot;
          
          // Always go clockwise - if target is behind, go the long way around
          if (diff <= 0) diff += 360;
          
          const newRotation = startRot + (diff * easeProgress);
          setCurrentRotation(newRotation);
          
          animationRef.current = requestAnimationFrame(animateStop);
        } else {
          setCurrentRotation(targetPosition);
        }
      };
      
      animationRef.current = requestAnimationFrame(animateStop);
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isSpinning, speed, targetPosition]);

  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDasharray = `${circumference * 0.75} ${circumference * 0.25}`;

  return (
    <div className={`inline-block ${className}`}>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#ffffff"
          strokeWidth={strokeWidth}
          strokeDasharray={strokeDasharray}
          strokeLinecap="round"
          style={{
            transform: `rotate(${currentRotation}deg)`,
            transformOrigin: 'center',
          }}
        />
      </svg>
    </div>
  );
};

export default CustomSpinner;