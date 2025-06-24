'use client'

import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Sphere } from '@react-three/drei'
import { useRef, useEffect, useState } from 'react'
import * as THREE from 'three'

interface SphereData {
  id: number;
  videoSrc: string;
  website: string;
  color: string;
}

interface SceneProps {
  activeTab?: string;
  sphereData: SphereData[];
  onActiveSphereChange: (sphereIndex: number) => void;
}

function RotatingSpheres({ activeTab, sphereData, onActiveSphereChange }: SceneProps) {
    const group = useRef<THREE.Group>(null!)
    const sphereRefs = useRef<(THREE.Mesh | null)[]>([])
    const sphereColors = sphereData.map(data => data.color)
    const [cycleOffset, setCycleOffset] = useState(0)
    const [animationProgress, setAnimationProgress] = useState(1)
    const [prevCycleOffset, setPrevCycleOffset] = useState(0)
    const animationStartTime = useRef(0)
    const targetScales = useRef<number[]>(sphereColors.map(() => 1))
    const currentScales = useRef<number[]>(sphereColors.map(() => 1))
    const targetPositions = useRef<THREE.Vector3[]>(sphereColors.map(() => new THREE.Vector3()))
    const currentPositions = useRef<THREE.Vector3[]>(sphereColors.map(() => new THREE.Vector3()))
    
    // Simplified rotation state for click navigation
    const [currentRotation, setCurrentRotation] = useState(0)
    const [isRotating, setIsRotating] = useState(false)
    const rotationStartTime = useRef(0)
    const startRotation = useRef(0)
    const targetRotation = useRef(0)
    const rotationDuration = 800 // milliseconds
    
    const { gl } = useThree()

    // Track active sphere and notify parent
    const [currentActiveSphere, setCurrentActiveSphere] = useState(0)

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (animationProgress === 1 && !isRotating) {
        if (event.key === 'e') {
          // Forward direction
          setPrevCycleOffset(cycleOffset)
          setCycleOffset(prev => (prev + 1) % sphereColors.length)
          setAnimationProgress(0)
          animationStartTime.current = Date.now()
        } else if (event.key === 'r') {
          // Reverse direction
          setPrevCycleOffset(cycleOffset)
          setCycleOffset(prev => (prev - 1 + sphereColors.length) % sphereColors.length)
          setAnimationProgress(0)
          animationStartTime.current = Date.now()
        }
      }
    }

    // Click interaction handler
    const handleClick = (event: MouseEvent) => {
      if (activeTab === 'home' || isRotating) return;
      
      const rect = gl.domElement.getBoundingClientRect();
      const clickX = event.clientX - rect.left;
      const screenWidth = rect.width;
      const clickPosition = clickX / screenWidth; // 0 to 1
      
      // Determine direction based on click position
      const anglePerSphere = (Math.PI * 2) / sphereColors.length;
      
      if (clickPosition > 0.5) {
        // Right side - move to next sphere
        startRotation.current = currentRotation;
        targetRotation.current = currentRotation + anglePerSphere;
      } else {
        // Left side - move to previous sphere
        startRotation.current = currentRotation;
        targetRotation.current = currentRotation - anglePerSphere;
      }
      
      setIsRotating(true);
      rotationStartTime.current = Date.now();
    }

    document.addEventListener('keydown', handleKeyPress)
    gl.domElement.addEventListener('click', handleClick)

    // Set cursor style
    if (activeTab !== 'home') {
      gl.domElement.style.cursor = 'pointer'
    } else {
      gl.domElement.style.cursor = 'default'
    }

    return () => {
      document.removeEventListener('keydown', handleKeyPress)
      gl.domElement.removeEventListener('click', handleClick)
    }
  }, [sphereColors.length, cycleOffset, animationProgress, activeTab, gl, isRotating, currentRotation])

  // Function to calculate which sphere is currently at the front
  const calculateActiveSphere = (rotation: number): number => {
    if (activeTab === 'home') {
      return Math.floor(sphereColors.length / 2); // Middle sphere for home
    }

    const frontAngle = Math.PI;

    let closestSphereIndex = 0;
    let minDistance = Infinity;
    
    for (let i = 0; i < sphereColors.length; i++) {
      const oldPositionIndex = (i + prevCycleOffset) % sphereColors.length;
      const newPositionIndex = (i + cycleOffset) % sphereColors.length;
      
      const oldAngle = (oldPositionIndex - 1) * (Math.PI * 2 / sphereColors.length);
      const newAngle = (newPositionIndex - 1) * (Math.PI * 2 / sphereColors.length);
      
      let angleDiff = newAngle - oldAngle;
      if (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
      if (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
      
      const easedProgress = animationProgress;
      const currentAngle = oldAngle + angleDiff * easedProgress + rotation;
      const normalizedAngle = ((currentAngle % (Math.PI * 2)) + (Math.PI * 2)) % (Math.PI * 2);
      
      const distance = Math.min(
        Math.abs(normalizedAngle - frontAngle),
        Math.abs(normalizedAngle - frontAngle + Math.PI * 2),
        Math.abs(normalizedAngle - frontAngle - Math.PI * 2)
      );
      
      if (distance < minDistance) {
        minDistance = distance;
        closestSphereIndex = i;
      }
    }
    
    return closestSphereIndex;
  };

  // Function to calculate horizontal positioning for home/projects tabs
  const calculateHorizontalPosition = (index: number, floatX: number, floatY: number, floatZ: number) => {
    const spacing = 4;
    const totalWidth = (sphereColors.length - 1) * spacing;
    const startX = -totalWidth / 2;
    
    return new THREE.Vector3(
      startX + index * spacing + floatX,
      -3 + floatY,
      -10 + floatZ
    );
  };

  // Function to calculate circular positioning for other tabs
  const calculateCircularPosition = (index: number, floatX: number, floatY: number, floatZ: number, easedProgress: number, additionalRotation: number = 0) => {
    const oldPositionIndex = (index + prevCycleOffset) % sphereColors.length;
    const newPositionIndex = (index + cycleOffset) % sphereColors.length;
    
    const oldAngle = (oldPositionIndex - 1) * (Math.PI * 2 / sphereColors.length);
    const newAngle = (newPositionIndex - 1) * (Math.PI * 2 / sphereColors.length);
    
    let angleDiff = newAngle - oldAngle;
    if (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
    if (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
    
    const currentAngle = oldAngle + angleDiff * easedProgress + additionalRotation;
    
    const radius = 5;
    
    if (activeTab === 'projects') {
      // Horizontal circle (XZ plane) for projects - centered at camera position
      const centerX = 0; // Camera is at x=0, so center the circle here
      const centerZ = -10;
      const centerY = -3;
      
      // Offset by π/2 to put angle 0 at the front (center) instead of right side
      const adjustedAngle = currentAngle + Math.PI / 2;
      
      const baseX = centerX + Math.cos(adjustedAngle) * radius;
      const baseZ = centerZ + Math.sin(adjustedAngle) * radius;
      
      return new THREE.Vector3(
        baseX + floatX,
        centerY + floatY,
        baseZ + floatZ
      );
    } else {
      // Vertical circle (YZ plane) for contact
      const centerY = 0;
      const centerZ = -10;
      
      const baseY = centerY + Math.sin(currentAngle) * radius;
      const baseZ = centerZ + Math.cos(currentAngle) * radius;
      
      return new THREE.Vector3(
        0 + floatX, // Also center at x=0 for contact
        baseY + floatY,
        baseZ + floatZ
      );
    }
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
  const calculateTargetSphereSize = (index: number) => {
    if (activeTab === 'home') {
      const frontSphereIndex = Math.floor(sphereColors.length / 2);
      if (index === frontSphereIndex) {
        return 0.8;
      }
      return 0.4;
    } else if (activeTab === 'projects' || activeTab === 'contact') {
      // When rotating, keep all spheres the same size
      if (isRotating) {
        return 0.8;
      }
      
      // Calculate which sphere is currently active
      const activeSphere = calculateActiveSphere(currentRotation);
      
      if (index === activeSphere) {
        return 1.2;
      }
      return 0.6;
    }
    return 1;
  };

  useFrame((state) => {
    // Handle click rotation animation
    if (isRotating) {
      const elapsed = Date.now() - rotationStartTime.current;
      const progress = Math.min(elapsed / rotationDuration, 1);
      
      // Easing function for smooth rotation
      const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);
      const easedProgress = easeOutCubic(progress);
      
      const newRotation = startRotation.current + 
        (targetRotation.current - startRotation.current) * easedProgress;
      
      setCurrentRotation(newRotation);
      
      if (progress >= 1) {
        setIsRotating(false);
        setCurrentRotation(targetRotation.current);
      }
    }

    // Update animation progress
    if (animationProgress < 1) {
      const elapsed = Date.now() - animationStartTime.current
      const progress = Math.min(elapsed / 2000, 1) // 1 second animation
      setAnimationProgress(progress)
    }

    // Calculate and update active sphere
    const newActiveSphere = calculateActiveSphere(currentRotation);
    if (newActiveSphere !== currentActiveSphere) {
      setCurrentActiveSphere(newActiveSphere);
      onActiveSphereChange(newActiveSphere);
    }

    // Easing function for smooth animation
    const easeInOutCubic = (t: number) => {
      return t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1
    }

    // Animate individual spheres floating
    sphereRefs.current.forEach((sphere, index) => {
      if (sphere) {
        const time = state.clock.getElapsedTime();
        const { floatX, floatY, floatZ } = calculateFloatingAnimation(time, index);
        
        let position;
        
        if (activeTab === 'home') {
          // Horizontal layout for home tab
          position = calculateHorizontalPosition(index, floatX, floatY, floatZ);
        } else {
          // Circular layout for projects and contact tabs with rotation
          const easedProgress = easeInOutCubic(animationProgress);
          position = calculateCircularPosition(index, floatX, floatY, floatZ, easedProgress, currentRotation);
        }
        
        sphere.position.copy(position);
        currentPositions.current[index].copy(position);
      }
    });

    // Calculate target positions
    sphereColors.forEach((_, index) => {
      const time = state.clock.getElapsedTime();
      const { floatX, floatY, floatZ } = calculateFloatingAnimation(time, index);
      
      if (activeTab === 'home') {
        targetPositions.current[index] = calculateHorizontalPosition(index, floatX, floatY, floatZ);
      } else {
        const easedProgress = easeInOutCubic(animationProgress);
        targetPositions.current[index] = calculateCircularPosition(index, floatX, floatY, floatZ, easedProgress, currentRotation);
      }
    });

    // Update target scales
    sphereColors.forEach((_, index) => {
      targetScales.current[index] = calculateTargetSphereSize(index);
    });

    // Interpolate scales
    const scaleSpeed = 0.005;
    sphereRefs.current.forEach((sphere, index) => {
      if (sphere) {
        // Interpolate scale
        currentScales.current[index] = THREE.MathUtils.lerp(
          currentScales.current[index],
          targetScales.current[index],
          scaleSpeed
        );
        
        const scale = currentScales.current[index];
        sphere.scale.set(scale, scale, scale);
      }
    });
  })

  return (
    <group ref={group}>
      {sphereColors.map((color, index) => (
        <Sphere 
          key={index} 
          args={[1, 32, 32]} 
          ref={(ref) => (sphereRefs.current[index] = ref)}
        >
          <meshStandardMaterial color={color} />
        </Sphere>
      ))}
    </group>
  )
}

export default function Scene({ activeTab, sphereData, onActiveSphereChange }: SceneProps) {
  return (
    <div id="scene-container" className="fixed inset-0 w-full h-screen">
      <Canvas 
        camera={{ position: [0, -1.5, 6], fov: 45 }}
        style={{ background: 'transparent' }}
        gl={{ alpha: true }}
        onCreated={({ camera }) => {
          camera.lookAt(0, -0.8, 0);
        }}
      >
        <ambientLight intensity={1} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        
        <RotatingSpheres 
          activeTab={activeTab} 
          sphereData={sphereData}
          onActiveSphereChange={onActiveSphereChange}
        />
      </Canvas>
    </div>
  )
}