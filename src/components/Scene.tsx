'use client'

import { Canvas, useFrame } from '@react-three/fiber'
import { Box, Text, OrbitControls} from '@react-three/drei'
import { useRef, useEffect, useState } from 'react'
import * as THREE from 'three'

interface SceneProps {
  onWheel?: (deltaY: number) => void;
  activeTab?: string;
}

function RotatingCubes({ onWheel, activeTab }: SceneProps) {
    const group = useRef<THREE.Group>(null!)
    const cubeRefs = useRef<(THREE.Mesh | null)[]>([])
    const cubeColors = ['orange', 'red', 'green', 'blue', 'purple']
    const [cycleOffset, setCycleOffset] = useState(0)
    const [animationProgress, setAnimationProgress] = useState(1)
    const [prevCycleOffset, setPrevCycleOffset] = useState(0)
    const animationStartTime = useRef(0)
    const targetScales = useRef<number[]>(cubeColors.map(() => 1))
    const currentScales = useRef<number[]>(cubeColors.map(() => 1))

  useEffect(() => {
    const handleWheel = (event: WheelEvent) => {
        event.preventDefault()
        console.log('Wheel event:', event.deltaY)
      if (animationProgress === 1) {
        // Trigger parent wheel handler only when animation starts
        onWheel?.(event.deltaY)
        
        setPrevCycleOffset(cycleOffset)
        
        if (event.deltaY > 0) {
          // Scroll down - forward direction (like 'e' key)
          setCycleOffset(prev => (prev + 1) % cubeColors.length)
        } else {
          // Scroll up - reverse direction (like 'w' key)
          setCycleOffset(prev => (prev - 1 + cubeColors.length) % cubeColors.length)
        }
        
        setAnimationProgress(0)
        animationStartTime.current = Date.now()
      }
    }

    document.addEventListener('wheel', handleWheel, { passive: false })
    return () => document.removeEventListener('wheel', handleWheel)
  }, [cubeColors.length, cycleOffset, animationProgress, onWheel])

  // Log cube positions after animation completes

  // Function to calculate horizontal positioning for home/project tabs
  const calculateHorizontalPosition = (index: number, floatX: number, floatY: number, floatZ: number) => {
    const spacing = 4;
    const totalWidth = (cubeColors.length - 1) * spacing;
    const startX = -totalWidth / 2;
    
    return {
      x: startX + index * spacing + floatX,
      y: -3 + floatY,
      z: -10 + floatZ
    };
  };

  // Function to calculate circular positioning for other tabs
  const calculateCircularPosition = (index: number, floatX: number, floatY: number, floatZ: number, easedProgress: number) => {
    const oldPositionIndex = (index + prevCycleOffset) % cubeColors.length;
    const newPositionIndex = (index + cycleOffset) % cubeColors.length;
    
    const oldAngle = (oldPositionIndex - 1) * (Math.PI * 2 / cubeColors.length);
    const newAngle = (newPositionIndex - 1) * (Math.PI * 2 / cubeColors.length);
    
    let angleDiff = newAngle - oldAngle;
    if (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
    if (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
    
    const currentAngle = oldAngle + angleDiff * easedProgress;
    
    const radius = 5;
    const centerY = 0;
    const centerZ = -10;
    
    const baseY = centerY + Math.sin(currentAngle) * radius;
    const baseZ = centerZ + Math.cos(currentAngle) * radius;
    
    return {
      x: -5 + floatX,
      y: baseY + floatY,
      z: baseZ + floatZ
    };
  };

  // Function to calculate floating animation
  const calculateFloatingAnimation = (time: number, index: number) => {
    const speedMultiplier = 1;
    const amplitudeY = 0.3;
    const amplitudeX = 0.2;
    const amplitudeZ = 0.15;
    const phaseOffset = index * Math.PI * 0.7;
    
    return {
      floatY: Math.sin(time * speedMultiplier + phaseOffset) * amplitudeY,
      floatX: Math.cos(time * 0.8 * speedMultiplier + phaseOffset + 1) * amplitudeX,
      floatZ: Math.sin(time * 0.6 * speedMultiplier + phaseOffset + 2) * amplitudeZ
    };
  };

  // Function to calculate cube size based on active tab and position
  const calculateTargetCubeSize = (index: number) => {
    if (activeTab === 'home') {
      // For home tab, make all cubes small but front one slightly bigger
      const frontCubeIndex = Math.floor(cubeColors.length / 2); // Middle cube is front
      if (index === frontCubeIndex) {
        return 0.8; // Front cube bigger
      }
      return 0.4; // Others smaller
    } else if (activeTab === 'project' || activeTab === 'contact') {
      // For circular layout, make the front cube (closest to camera) bigger
      const positionIndex = (index + cycleOffset) % cubeColors.length;
      const frontCubeIndex = 1; // Index 1 is positioned at angle 0 (front)
      
      if (positionIndex === frontCubeIndex) {
        return 1.2; // Front cube bigger
      }
      return 0.6; // Others smaller
    }
    return 1; // Default size
  };

  useFrame((state) => {
    // Update animation progress
    if (animationProgress < 1) {
      const elapsed = Date.now() - animationStartTime.current
      const progress = Math.min(elapsed / 2000, 1) // 1 second animation
      setAnimationProgress(progress)
    }

    // Easing function for smooth animation
    const easeInOutCubic = (t: number) => {
      return t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1
    }

    // Animate individual cubes floating
    cubeRefs.current.forEach((cube, index) => {
      if (cube) {
        const time = state.clock.getElapsedTime();
        const { floatX, floatY, floatZ } = calculateFloatingAnimation(time, index);
        
        let position;
        
        if (activeTab === 'home') {
          // Horizontal layout for home and project tabs
          position = calculateHorizontalPosition(index, floatX, floatY, floatZ);
        } else {
          // Circular layout for other tabs
          const easedProgress = easeInOutCubic(animationProgress);
          position = calculateCircularPosition(index, floatX, floatY, floatZ, easedProgress);
        }
        
        cube.position.x = position.x;
        cube.position.y = position.y;
        cube.position.z = position.z;
      }
    });

    // Update target scales
    cubeColors.forEach((_, index) => {
      targetScales.current[index] = calculateTargetCubeSize(index);
    });

    // Gradually interpolate cube sizes
    const scaleSpeed = 0.005; // Adjust this for faster/slower transitions
    cubeRefs.current.forEach((cube, index) => {
      if (cube) {
        // Interpolate towards target scale
        currentScales.current[index] = THREE.MathUtils.lerp(
          currentScales.current[index],
          targetScales.current[index],
          scaleSpeed
        );
        
        const scale = currentScales.current[index];
        cube.scale.set(scale, scale, scale);
      }
    });
  })

  return (
    <group ref={group}>
      {cubeColors.map((color, index) => (
        <Box 
          key={index} 
          args={[2, 2, 2]} 
          ref={(ref) => (cubeRefs.current[index] = ref)}
        >
          <meshStandardMaterial color={color} />
        </Box>
      ))}
    </group>
  )
}

export default function Scene({ onWheel, activeTab }: SceneProps) {
  return (
    <div id="scene-container" className="fixed inset-0 w-full h-screen">
      <Canvas 
        camera={{ position: [0, 0, 6], fov: 45 }}
        style={{ background: 'transparent' }}
        gl={{ alpha: true }}
      >
        <ambientLight intensity={1} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        
        {/* <OrbitControls /> */}
        <RotatingCubes onWheel={onWheel} activeTab={activeTab} />
      </Canvas>
    </div>
  )
}