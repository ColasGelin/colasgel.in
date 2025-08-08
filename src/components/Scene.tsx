'use client'

import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Text, Center, OrbitControls, useGLTF } from '@react-three/drei'
import { useRef, useState, useEffect } from 'react'
import { Group } from 'three'
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
  isLightOn?: boolean;
  onScrollUpdate?: (scrollY: number) => void;
  onModelsLoaded?: (loaded: boolean) => void;
  hoveredIcon?: string | null;
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

function ChainlinkModel() {
  const { scene } = useGLTF('/models/chainlink.glb');
  const meshRef = useRef<Group>(null!);
  const particlesRef = useRef<THREE.Points>(null!);
  
  // Move particle creation to useRef so it's only created once
  const particlePositions = useRef<Float32Array>();
  
  // Initialize particles only once
  useEffect(() => {
    if (!particlePositions.current) {
      const particleCount = 300;
      const positions = new Float32Array(particleCount * 3);
      
      for (let i = 0; i < particleCount; i++) {
        const i3 = i * 3;
        const radius = Math.random() * 10 + 1;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.random() * Math.PI;
        
        positions[i3] = radius * Math.sin(phi) * Math.cos(theta);
        positions[i3 + 1] = radius * Math.cos(phi);
        positions[i3 + 2] = radius * Math.sin(phi) * Math.sin(theta);
      }
      
      particlePositions.current = positions;
    }
  }, []);

  useEffect(() => {
    // Apply white basic material to all meshes in the scene
    scene.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.material = new THREE.MeshBasicMaterial({ 
          color: '#ffffff'
        });
      }
    });

    // Center the model
    const box = new THREE.Box3().setFromObject(scene);
    const center = box.getCenter(new THREE.Vector3());
    scene.position.sub(center);
  }, [scene]);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.z += 0.01;
    }
    
    // Animate particles
    if (particlesRef.current && particlePositions.current) {
      const positions = particlesRef.current.geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < positions.length; i += 3) {
        positions[i + 1] += Math.sin(state.clock.elapsedTime + i) * 0.001; // Y movement
        positions[i] += Math.cos(state.clock.elapsedTime + i) * 0.001; // X movement
      }
      particlesRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  // Don't render particles until they're initialized
  if (!particlePositions.current) {
    return null;
  }

  return (
    <group position={[0, -15.3, 5]}>
      {/* Chainlink model */}
      <group ref={meshRef} scale={[0.5, 0.5, 0.5]} rotation={[Math.PI / 2, Math.PI / 5, 0]}>
        <primitive object={scene.clone()} />
      </group>
      
      {/* Mystical particles */}
      <points ref={particlesRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={particlePositions.current.length / 3}
            array={particlePositions.current}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.05}
          color="#87CEEB"
          transparent
          opacity={0.6}
          blending={THREE.AdditiveBlending}
          sizeAttenuation={true}
        />
      </points>
      
    </group>
  );
}

export default function Scene({isLightOn = false, onScrollUpdate, onModelsLoaded, hoveredIcon }: SceneProps) {
  const [lightIntensity, setLightIntensity] = useState(isLightOn ? 800 : 0);
  const [currentLightState, setCurrentLightState] = useState(isLightOn);
  const [targetPointLightIntensity, setTargetPointLightIntensity] = useState(50);
  const [currentPointLightIntensity, setCurrentPointLightIntensity] = useState(50);

  // Update target intensity when hoveredIcon changes
  useEffect(() => {
    setTargetPointLightIntensity(hoveredIcon ? 100 : 50);
  }, [hoveredIcon]);

  // Track prop changes
  useEffect(() => {
    console.log('Scene hoveredIcon prop changed:', hoveredIcon);
  }, [hoveredIcon]);

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
        
        {/* Smooth Point Light Animation Component */}
        <SmoothPointLight 
          targetIntensity={targetPointLightIntensity}
          onIntensityChange={setCurrentPointLightIntensity}
        />
        
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
        <mesh position={[0, -8, 5.85]} rotation={[0, 0, 0]}>
          <planeGeometry args={[20, 11.3]} />
          <meshBasicMaterial color="#000000" />
        </mesh>

        <mesh position={[0, -13.7, -4.2]} receiveShadow>
          <boxGeometry args={[20, 0.2, 20]} rotateZ={Math.PI / 2} />
          <meshStandardMaterial color="#000000" />
        </mesh>
        <mesh position={[0, -17, -4.2]} receiveShadow>
          <boxGeometry args={[20, 0.2, 20]} />
          <meshStandardMaterial color="#000000" />
        </mesh>
        {/* Large vertical background plane */}
        <mesh position={[0, -15.5, 2]} rotation={[0, 0, 0]}>
          <planeGeometry args={[20, 10]} />
          <meshStandardMaterial color="#000000" />
        </mesh>
        <mesh position={[-3, -15.3, -3]} rotation={[0, Math.PI / 2, 0]}>
          <planeGeometry args={[20, 5]} />
          <meshStandardMaterial color="#000000" />
        </mesh>
        <mesh position={[3, -15.3, -3]} rotation={[0, -Math.PI / 2, 0]}>
          <planeGeometry args={[20, 5]} />
          <meshStandardMaterial color="#000000" />
        </mesh>

          <pointLight
            color="#ffffff"
            intensity={currentPointLightIntensity}
            position={[0, -15.4, 3]}
            rotation={[-Math.PI / 2, 0, 0]}
            castShadow={false}
          />

        <ModelWithText 
          modelPath="models/WIP.glb"
          onModelsLoaded={onModelsLoaded}
        />

        <ChainlinkModel />

        {/* <ambientLight intensity={10} /> */}
      </Canvas>
    </div>
  )
}

function SmoothPointLight({ targetIntensity, onIntensityChange }: { 
  targetIntensity: number; 
  onIntensityChange: (intensity: number) => void; 
}) {
  const currentIntensityRef = useRef(50);

  useFrame(() => {
    const current = currentIntensityRef.current;
    const difference = targetIntensity - current;
    
    if (Math.abs(difference) > 0.1) {
      const newIntensity = current + difference * 0.05; // Smooth interpolation
      currentIntensityRef.current = newIntensity;
      onIntensityChange(newIntensity);
    } else if (Math.abs(difference) > 0.01) {
      currentIntensityRef.current = targetIntensity;
      onIntensityChange(targetIntensity);
    }
  });

  return null;
}