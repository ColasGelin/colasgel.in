'use client'

import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Text, Center, OrbitControls, useGLTF } from '@react-three/drei'
import { useRef, useState, useEffect } from 'react'
import { Group } from 'three'

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
  isLightOn?: boolean;
  onScrollUpdate?: (scrollY: number) => void;
  onModelsLoaded?: (loaded: boolean) => void;
}

interface ModelProps {
  modelPath: string;
}

function ModelWithText({ modelPath, onModelsLoaded }: ModelProps & { onModelsLoaded?: (loaded: boolean) => void }) {
  const { scene } = useGLTF(modelPath);
  const modelRef = useRef<Group>(null!);
  
  useEffect(() => {
    if (scene && onModelsLoaded) {
      onModelsLoaded(true);
    }
  }, [scene, onModelsLoaded]);
  
  return (
    <>

      {/* GLTF Model */}
      <primitive 
        ref={modelRef}
        object={scene} 
        position={[0, 2, 3]} 
        rotation={[0, 0, 0]}
        scale={[0.4, 0.4, 0.4]}
      />
      
      {/* 3D Text */}
      <Center position={[0.5, 0.8, 3]}>
        <Text
          fontSize={1.5}
          color="#343434"
          anchorX="center"
          anchorY="middle"
          font="/fonts/louis_george_cafe/Louis George Cafe.ttf"
        >
          Colas Gelin
          <meshStandardMaterial color="#343434" />
        </Text>
      </Center>

      {/* Subtitle */}
      <Center position={[0.5, 0, 3.05]}>
        <Text
          fontSize={0.4}
          color="#666666"
          anchorX="center"
          anchorY="middle"
          font="/fonts/louis_george_cafe/Louis George Cafe.ttf"
        >
          Freelance developer & designer
          <meshStandardMaterial color="#343434" />
        </Text>
      </Center>

      {/* Add orbit controls for interaction */}
      {/* <OrbitControls enablePan={true} enableZoom={true} enableRotate={true} /> */}
    </>
  );
}

function ScrollCameraController({ isLightOn, onScrollUpdate }: { isLightOn: boolean, onScrollUpdate?: (scrollY: number) => void }) {
  const { camera } = useThree();
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      if (isLightOn) {
        setScrollY(window.scrollY);
        onScrollUpdate?.(window.scrollY);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isLightOn, onScrollUpdate]);

  useFrame(() => {
    if (isLightOn) {
      // Convert scroll to camera Y movement (scroll down = camera goes down)
      const targetY = -scrollY * 0.01;
      camera.position.y = targetY;
      camera.lookAt(0, targetY, 0);
    }
  });

  return null;
}

export default function Scene({isLightOn = false, onScrollUpdate, onModelsLoaded }: SceneProps) {
  const [lightIntensity, setLightIntensity] = useState(isLightOn ? 800 : 0);
  const [currentLightState, setCurrentLightState] = useState(isLightOn);

  // Handle light state changes
  if (isLightOn !== currentLightState) {
    setCurrentLightState(isLightOn);
    
    if (isLightOn) {
      // Turning ON - gradual increase with delay
      setTimeout(() => {
        const startTime = Date.now();
        const duration = 1000;
        const startIntensity = 0;
        const targetIntensity = 800;
        
        const animate = () => {
          const elapsed = Date.now() - startTime;
          const progress = Math.min(elapsed / duration, 1);
          const easeOut = 1 - Math.pow(1 - progress, 3);
          const currentIntensity = startIntensity + (targetIntensity - startIntensity) * easeOut;
          
          setLightIntensity(currentIntensity);
          
          if (progress < 1) {
            requestAnimationFrame(animate);
          }
        };
        
        animate();
      }, 500);
    } else {
      // Turning OFF - gradual decrease
      const startTime = Date.now();
      const duration = 500;
      const startIntensity = lightIntensity;
      const targetIntensity = 0;
      
      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easeIn = Math.pow(progress, 2);
        const currentIntensity = startIntensity + (targetIntensity - startIntensity) * easeIn;
        
        setLightIntensity(currentIntensity);
        
        if (progress < 1) {
          requestAnimationFrame(animate);
        }
      };
      
      animate();
    }
  }

  return (
    <div 
      id="scene-container" 
      className="fixed inset-0 w-full h-screen"
    >
      
      <Canvas 
        camera={{ position: [0, 0, 9], fov: 45 }}
        style={{ background: 'transparent' }}
        gl={{ alpha: true, outputColorSpace: 'srgb' }}
        onCreated={({ camera }) => {
          camera.lookAt(0, 0, 0);
        }}
      >
        <ScrollCameraController isLightOn={isLightOn} onScrollUpdate={onScrollUpdate} />
        
        {lightIntensity > 0 && (
          <rectAreaLight
            width={6}
            height={0.3}
            color="#ccddff"
            intensity={lightIntensity}
            position={[0, 1, 3]}
            rotation={[-Math.PI / 2.5, 0, 0]}
            castShadow={false}
          />
        )}

        {/* Ground Plane with thickness */}
        <mesh position={[0, -1.4, -4.2]} receiveShadow>
          <boxGeometry args={[20, 0.2, 20]} />
          <meshStandardMaterial color="#111111" />
        </mesh>
        {/* Large vertical background plane */}
        <mesh position={[0, 3.5, -10]} rotation={[0, 0, 0]}>
          <planeGeometry args={[20, 10]} />
          <meshBasicMaterial color="#111111" />
        </mesh>
        <mesh position={[-10, 3.7, -5]} rotation={[0, Math.PI / 2, 0]}>
          <planeGeometry args={[20, 10]} />
          <meshBasicMaterial color="#111111" />
        </mesh>
        <mesh position={[10, 3.7, -5]} rotation={[0, -Math.PI / 2, 0]}>
          <planeGeometry args={[20, 10]} />
          <meshBasicMaterial color="#111111" />
        </mesh>
        <mesh position={[0, -9, 5.85]} rotation={[0, 0, 0]}>
          <planeGeometry args={[20, 10]} />
          <shaderMaterial
            vertexShader={`
              varying vec2 vUv;
              void main() {
                vUv = uv;
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
              }
            `}
            fragmentShader={`
              varying vec2 vUv;
              void main() {
                vec3 topColor = vec3(0.0, 0.0, 0.0); // #000000
                vec3 bottomColor = vec3(0.5, 0.5, 0.5); //rgb(146, 150, 163)
                vec3 color = mix(bottomColor, topColor, vUv.y);
                gl_FragColor = vec4(color, 1.0);
              }
            `}
          />
        </mesh>
        <ModelWithText 
          modelPath="models/low_poly_hanging_light/scene.gltf"
          onModelsLoaded={onModelsLoaded}
        />
      </Canvas>
    </div>
  )
}