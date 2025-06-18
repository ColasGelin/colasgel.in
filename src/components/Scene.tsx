'use client'

import { Canvas, useFrame } from '@react-three/fiber'
import { Box} from '@react-three/drei'
import { useRef, useEffect, useState } from 'react'
import * as THREE from 'three'

interface SceneProps {
  onWheel?: (deltaY: number) => void;
}

function RotatingCubes({ onWheel }: SceneProps) {
    const group = useRef<THREE.Group>(null!)
    const cubeRefs = useRef<(THREE.Mesh | null)[]>([])
    const cubeColors = ['orange', 'red', 'green']
    const [cycleOffset, setCycleOffset] = useState(0)
    const [animationProgress, setAnimationProgress] = useState(1)
    const [prevCycleOffset, setPrevCycleOffset] = useState(0)
    const animationStartTime = useRef(0)
  
  // Consistent offset between cubes
  const CUBE_OFFSET = 5

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
          const time = state.clock.getElapsedTime()
          // Same floating parameters for all cubes
          const speedMultiplier = 1
          const amplitudeY = 0.3
          const amplitudeX = 0.2
          const amplitudeZ = 0.15
          const phaseOffset = index * Math.PI * 0.7 // Only timing varies between cubes
          
          // Different floating patterns for each cube (same amplitude, different timing)
          const floatY = Math.sin(time * speedMultiplier + phaseOffset) * amplitudeY
          const floatX = Math.cos(time * 0.8 * speedMultiplier + phaseOffset + 1) * amplitudeX
          const floatZ = Math.sin(time * 0.6 * speedMultiplier + phaseOffset + 2) * amplitudeZ
          
          // Calculate old and new position indices
          const oldPositionIndex = (index + prevCycleOffset) % cubeColors.length
          const newPositionIndex = (index + cycleOffset) % cubeColors.length
          
          // Calculate old and new positions for both Y and Z
          const oldTrianglePhase = (oldPositionIndex / cubeColors.length) * Math.PI * 2
          const newTrianglePhase = (newPositionIndex / cubeColors.length) * Math.PI * 2
          const oldBaseZ = Math.sin(oldTrianglePhase) * 5
          const newBaseZ = Math.sin(newTrianglePhase) * 5
          const oldBaseY = -oldPositionIndex * CUBE_OFFSET + 5
          const newBaseY = -newPositionIndex * CUBE_OFFSET + 5
          
          // Interpolate between old and new positions
          const easedProgress = easeInOutCubic(animationProgress)
          const baseZ = oldBaseZ + (newBaseZ - oldBaseZ) * easedProgress
          const baseY = oldBaseY + (newBaseY - oldBaseY) * easedProgress
          
          cube.position.x = -5 + floatX
          cube.position.z = baseZ + floatZ - 10
          cube.position.y = baseY + floatY
        }
      })
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

export default function Scene({ onWheel }: SceneProps) {
  return (
    <div id="scene-container" className="fixed inset-0 w-full h-screen">
      <Canvas 
        camera={{ position: [0, 0, 6], fov: 45 }}
        style={{ background: 'transparent' }}
        gl={{ alpha: true }}
      >
        <ambientLight intensity={0.6} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        <RotatingCubes onWheel={onWheel} />
      </Canvas>
    </div>
  )
}