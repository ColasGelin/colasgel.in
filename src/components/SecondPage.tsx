'use client'

import { Canvas, useFrame } from '@react-three/fiber'
import { useGLTF, OrbitControls } from '@react-three/drei'
import { useRef, useState, useEffect } from 'react'
import { Group } from 'three'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface SecondPageProps {
  className?: string;
}

interface Project {
  id: number;
  modelPath: string;
  title: string;
  description: string;
  scale: [number, number, number];
  offsetY?: number;
  website?: string;
}

const projects: Project[] = [
  {
    id: 1,
    modelPath: '/models/low_poly_hanging_light/scene.gltf',
    title: 'Pizza Popote',
    description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis a dignissim ante. Aenean et sem egestas, dictum felis in, posuere risus. Ut id augue eget leo vulputate sagittis vel nec augue. Vivamus vitae odio posuere, usenectus et netus et malesuada fames ac turpis egestas. Vestibulum auctor massa ac imperdiet condimentum. Vestibulum porttitor diam vitae vulputate feugiat. ',
    scale: [0.2, 0.2, 0.2],
    offsetY: -0.5,
    website: 'https://click.com'
  },
  {
    id: 2,
    modelPath: '/models/mug/scene.gltf',
    title: 'Long Distance Games', 
    description: 'Aenean iaculis blandit sapien, sit amet congue quam elementum quis. Sed a condimentum enim. Nulla tortor sapien, eleifend in velit sed, elementum sagittis mi. Praesent porta iaculis ex sit amet elementum. Nulla ornare orci ac augueroin at elit purus. Nulla risus augue, molestie ac erat nec, iaculis imperdiet nisl. Vestibulum condimentum arcu ac nisl aliquet malesuada. Donec tempor urna at augue fermentum fringilla. ',
    scale: [0.005, 0.005, 0.005],
    offsetY: 0,
    website: 'https://google.com'
  },
  {
    id: 3,
    modelPath: '/models/laptop_game_ready_low_poly/scene.gltf',
    title: 'Work in progress',
    description: 'Donec rhoncus, orci quis mollis mattis, nibh est matti. ',
    scale: [0.5, 0.5, 0.5],
    offsetY: 0,
  }
];

// Preload all models
projects.forEach(project => {
  useGLTF.preload(project.modelPath);
});

function Simple3DModel({ modelPath, projectId, scale, offsetY = 0, visible }: { 
  modelPath: string, 
  projectId: number, 
  scale: [number, number, number],
  offsetY?: number,
  visible: boolean 
}) {
  const { scene } = useGLTF(modelPath);
  const modelRef = useRef<Group>(null!);
  
  // Animation using useFrame
  useFrame((state) => {
    if (modelRef.current && visible) {
      // Floating animation (up and down movement) with custom offset
      modelRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.8) * 0.3 + offsetY;
      
      // Slow rotation around Y axis
      modelRef.current.rotation.y = state.clock.elapsedTime * 0.2 + projectId * 0.5;
    }
  });
  
  return (
    <primitive 
      ref={modelRef}
      object={scene.clone()}
      position={[0, 0, 0]} 
      scale={scale}
      visible={visible}
    />
  );
}

export default function SecondPage({ className = '' }: SecondPageProps) {
  const [currentProjectIndex, setCurrentProjectIndex] = useState(0);
  const currentProject = projects[currentProjectIndex];

  const nextProject = () => {
    setCurrentProjectIndex((prev) => (prev + 1) % projects.length);
  };

  const prevProject = () => {
    setCurrentProjectIndex((prev) => (prev - 1 + projects.length) % projects.length);
  };

  const goToProject = (index: number) => {
    setCurrentProjectIndex(index);
  };

  // Add keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        prevProject();
      } else if (event.key === 'ArrowRight') {
        event.preventDefault();
        nextProject();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    // Cleanup
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return (
    <div className={`h-screen bg-[#00000000] ${className} relative overflow-hidden`}>
      {/* Page Title */}
      <div className="absolute top-8 lg:top-20 left-1/2 transform -translate-x-1/2 z-10">
        <h1 className="text-white text-3xl lg:text-6xl tracking-wider text-center champagne-font">
          Build memorable experiences
        </h1>
      </div>

      {/* Main Content Container */}
      <div className="flex flex-col lg:flex-row items-center justify-center h-full px-4 lg:px-16 pt-20 lg:pt-24">
        {/* Left side - 3D Model */}
        <div className="w-full lg:w-[40%] h-[50vh] lg:h-[70vh] relative z-20">
          <Canvas 
            camera={{ position: [0, 0, 5], fov: 45 }}
            style={{ background: 'transparent' }}
            gl={{ alpha: true, outputColorSpace: 'srgb' }}
          >
            <ambientLight intensity={1} />
            <directionalLight position={[10, 10, 5]} intensity={1} />
            {projects.map((project, index) => (
              <Simple3DModel 
                key={project.id}
                modelPath={project.modelPath} 
                projectId={project.id} 
                scale={project.scale}
                offsetY={project.offsetY}
                visible={index === currentProjectIndex}
              />
            ))}
            <OrbitControls enablePan={false} enableZoom={false} enableRotate={false} />
          </Canvas>
        </div>

        {/* Right side - Project Info */}
        <div className="w-full lg:w-[40%] flex items-center justify-center">
          <div className="w-full max-w-md text-center">
            <h2 className="text-white text-3xl lg:text-4xl font-bold mb-6">{currentProject.title}</h2>
            <p className="text-gray-400 text-base lg:text-lg mb-8 leading-relaxed">
              {currentProject.description}
            </p>
            {currentProject.website && (
              <button 
                onClick={() => window.open(currentProject.website, '_blank')}
                className="text-white text-xl lg:text-2xl font-mono hover:text-gray-300 transition-all duration-300 hover:scale-110 cursor-pointer"
                style={{ textShadow: '0 0 15px rgba(118, 170, 255, 0.9), 0 0 30px rgba(59, 130, 246, 0.6), 0 0 45px rgba(59, 130, 246, 0.3)' }}
              >
                Visit Website
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Navigation Arrows */}
      {/* Left Arrow */}
      <button 
        onClick={prevProject}
        className="absolute left-4 lg:left-8 top-1/2 transform -translate-y-1/2 z-30 hover:scale-150 transition-all duration-300 cursor-pointer"
      >
        <ChevronLeft size={40} className="lg:w-[60px] lg:h-[60px] text-white hover:text-gray-300" />
      </button>

      {/* Right Arrow */}
      <button 
        onClick={nextProject}
        className="absolute right-4 lg:right-8 top-1/2 transform -translate-y-1/2 z-30 hover:scale-150 transition-all duration-300 cursor-pointer"
      >
        <ChevronRight size={40} className="lg:w-[60px] lg:h-[60px] text-white hover:text-gray-300" />
      </button>

      {/* Dots Indicator - Bottom Center of Page */}
      <div className="absolute bottom-10 lg:bottom-20 left-1/2 transform -translate-x-1/2 flex space-x-3 z-30">
        {projects.map((_, index) => (
          <button
            key={index}
            onClick={() => goToProject(index)}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              index === currentProjectIndex 
                ? 'bg-white shadow-[0_0_10px_rgba(255,255,255,0.8)]' 
                : 'bg-white/30 hover:bg-white/50'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
