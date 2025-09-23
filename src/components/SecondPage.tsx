'use client'

import { Canvas, useFrame } from '@react-three/fiber'
import { useGLTF, OrbitControls } from '@react-three/drei'
import { useRef, useState, useEffect, useCallback } from 'react'
import { Group } from 'three'
import { ChevronLeft, ChevronRight, FolderOpen, GraduationCap, RotateCcw } from 'lucide-react'

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
  baseRotation?: [number, number, number];
}

interface Experience {
  id: number;
  modelPath: string;
  title: string;
  description: string;
  scale: [number, number, number];
  offsetY?: number;
  period?: string;
  location?: string;
  baseRotation?: [number, number, number];
}

type TabType = 'projects' | 'education';

const projects: Project[] = [
  {
    id: 1,
    modelPath: '/models/WholePlanetRendered.glb',
    title: 'Pizza Popote',
    description: 'By combining fun with functionality, PizzaPopote’s website succeeds in working to both consumer preferences and client needs. The platform creates an engaging customer experience through the 3D-world format and boasts a set-up that enables easeful updates to content. \n(On pause - business hiatus)',
    scale: [0.014, 0.014, 0.014],
    offsetY: 0.9,
    website: 'https://deploy-pizza-popote.vercel.app',
    baseRotation: [0, 0, 0]
  },
  {
    id: 2,
    modelPath: '/models/WIP.glb',
    title: 'Work in progress',
    description: 'Currently exploring new frontiers in interactive web design.',
    scale: [0.8, 0.8, 0.8],
    offsetY: 0,
    baseRotation: [0, 0, 0]
  }
];

const experiences: Experience[] = [
  {
    id: 1,
    modelPath: '/models/42 school.glb',
    title: 'Bachelor in Computer Science',
    description: 'Self-directed programming education including full-stack web development. Mastered independent learning and problem-solving through hands-on projects, with strong foundation in web technologies for client solutions.',
    scale: [0.3, 0.3, 0.3],
    offsetY: -0.4,
    period: '2022-2024',
    location: '42 Lyon',
    baseRotation: [Math.PI / 10, 0, 0]
  },
  {
    id: 2,
    modelPath: '/models/CumarAI.glb',
    title: 'AI automation & FullStack Developer Intern',
    description: 'Built AI-powered web platform automating business processes including email management, document processing, and content generation for improved operational efficiency.',
    scale: [0.6, 0.6, 0.6],
    offsetY: -0.8,
    period: 'September 2024 - March 2025',
    location: 'CumarAI',
    baseRotation: [0, Math.PI / 4, 0]
  },
   {
    id: 3,
    modelPath: '/models/hackathon.glb',
    title: 'Social Innovation Hackathon Winner',
    description: 'Developed award-winning AI assistant mobile app for visually impaired users. Created real-time image recognition system that captures photos and provides detailed audio descriptions, enhancing accessibility and independence.',
    scale: [1, 1, 1],
    offsetY: 0.3,
    period: 'June 2025',
    location: 'La Noria, Málaga',
    baseRotation: [0, 0, 0]
  },
  {
    id: 4,
    modelPath: '/models/WIP.glb',
    title: 'Master in Database architecture and data',
    description: 'Backend systems architecture and database optimization with AI/data science applications. Focus on scalable web backends and data processing systems.',
    scale: [0.8, 0.8, 0.8],
    offsetY: 0,
    baseRotation: [0, 0, 0],
    period: 'Since April 2025',
    location: '42 Málaga'
  }
];

// Preload all models
[...projects, ...experiences].forEach(item => {
  useGLTF.preload(item.modelPath);
});

function Simple3DModel({ modelPath, projectId, scale, offsetY = 0, baseRotation = [0, 0, 0], visible }: { 
  modelPath: string, 
  projectId: number, 
  scale: [number, number, number],
  offsetY?: number,
  baseRotation?: [number, number, number],
  visible: boolean 
}) {
  const { scene } = useGLTF(modelPath);
  const modelRef = useRef<Group>(null!);
  
  // Set base rotation once when component mounts or baseRotation changes
  useEffect(() => {
    if (modelRef.current) {
      modelRef.current.rotation.x = baseRotation[0];
      modelRef.current.rotation.z = baseRotation[2];
    }
  });
  
  // Animation using useFrame
  useFrame((state) => {
    if (modelRef.current && visible) {
      // Floating animation (up and down movement) with custom offset
      modelRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.8) * 0.05 + offsetY;
      
      // Only animate Y rotation
      modelRef.current.rotation.y = state.clock.elapsedTime * 0.2 + projectId * 0.5 + baseRotation[1];
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
  const [activeTab, setActiveTab] = useState<TabType>('projects');
  const [currentProjectIndex, setCurrentProjectIndex] = useState(0);
  const [currentExperienceIndex, setCurrentExperienceIndex] = useState(0);
  
  const currentProject = projects[currentProjectIndex];
  const currentExperience = experiences[currentExperienceIndex];
  const currentItems = activeTab === 'projects' ? projects : experiences;
  const currentIndex = activeTab === 'projects' ? currentProjectIndex : currentExperienceIndex;
  const currentItem = activeTab === 'projects' ? currentProject : currentExperience;

  const nextItem = useCallback(() => {
    if (activeTab === 'projects') {
      setCurrentProjectIndex((prev) => (prev + 1) % projects.length);
    } else {
      setCurrentExperienceIndex((prev) => (prev + 1) % experiences.length);
    }
  }, [activeTab]);

  const prevItem = useCallback(() => {
    if (activeTab === 'projects') {
      setCurrentProjectIndex((prev) => (prev - 1 + projects.length) % projects.length);
    } else {
      setCurrentExperienceIndex((prev) => (prev - 1 + experiences.length) % experiences.length);
    }
  }, [activeTab]);

  const goToItem = (index: number) => {
    if (activeTab === 'projects') {
      setCurrentProjectIndex(index);
    } else {
      setCurrentExperienceIndex(index);
    }
  };

  // Add keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        prevItem();
      } else if (event.key === 'ArrowRight') {
        event.preventDefault();
        nextItem();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [activeTab, nextItem, prevItem]);

  return (
    <div className={`h-screen bg-[#00000000] ${className} relative`}>
      {/* Page Title */}
      <div className="absolute top-8 lg:top-10 left-1/2 transform -translate-x-1/2 z-10 whitespace-nowrap">
        <h1 className="text-white text-3xl lg:text-6xl text-center champagne-font">
          Build memorable experiences
        </h1>
      </div>

      {/* Tab Navigation */}
      <div className="absolute top-24 lg:top-40 left-1/2 transform -translate-x-1/2 z-20">
        <div className="flex space-x-8">
          <button
        onClick={() => setActiveTab('projects')}
        className={`flex items-center space-x-2 text-lg lg:text-2xl font-semibold transition-all duration-300 outline-none focus:outline-none cursor-pointer ${
          activeTab === 'projects'
            ? 'text-white border-b-2 border-white pb-1'
            : 'text-gray-400 hover:text-gray-200'
        }`}
          >
        <FolderOpen size={24} className="lg:w-[28px] lg:h-[28px]" />
        <span>Projects</span>
          </button>
          <button
        onClick={() => setActiveTab('education')}
        className={`flex items-center space-x-2 text-lg lg:text-2xl font-semibold transition-all duration-300 outline-none focus:outline-none cursor-pointer ${
          activeTab === 'education'
            ? 'text-white border-b-2 border-white pb-1'
            : 'text-gray-400 hover:text-gray-200'
        }`}
          >
        <GraduationCap size={24} className="lg:w-[28px] lg:h-[28px]" />
        <span>Journey</span>
          </button>
        </div>
      </div>

      {/* Main Content Container */}
      <div className="flex flex-col lg:flex-row items-center justify-center h-full px-4 lg:px-16 pt-32 lg:pt-48">
        {/* Left side - 3D Model */}
        <div className="w-full lg:w-[40%] h-[50vh] lg:h-[70vh] relative z-20">
          <Canvas 
            camera={{ position: [0, 0, 5], fov: 45 }}
            style={{ background: 'transparent' }}
            gl={{ alpha: true, outputColorSpace: 'srgb' }}
          >
            <ambientLight intensity={1} />
            <directionalLight position={[10, 10, 5]} intensity={1} />
            {activeTab === 'projects' && projects.map((project, index) => (
              <Simple3DModel 
                key={project.id}
                modelPath={project.modelPath} 
                projectId={project.id} 
                scale={project.scale}
                offsetY={project.offsetY}
                baseRotation={project.baseRotation}
                visible={index === currentProjectIndex}
              />
            ))}
            {activeTab === 'education' && experiences.map((experience, index) => (
              <Simple3DModel 
                key={experience.id}
                modelPath={experience.modelPath} 
                projectId={experience.id} 
                scale={experience.scale}
                offsetY={experience.offsetY}
                baseRotation={experience.baseRotation}
                visible={index === currentExperienceIndex}
              />
            ))}
            <OrbitControls 
              enableZoom={false}
              enablePan={false}
              enableRotate={true}>

              </OrbitControls>
          </Canvas>
          {/* Rotation Hint */}
          <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex items-center space-x-2 text-white/60 text-sm group">
            <RotateCcw size={16} className="animate-pulse" />
            <span className="hidden lg:inline">Drag to rotate</span>
            <span className="lg:hidden">Drag</span>
          </div>
        </div>

        {/* Right side - Item Info */}
        <div className="w-full lg:w-[40%] flex items-center justify-center">
          <div className="w-full max-w-md text-center">
            <h2 className="text-white text-3xl lg:text-4xl font-bold mb-6">{currentItem.title}</h2>
            {activeTab === 'education' && 'period' in currentItem && (
              <p className="text-blue-400 text-lg lg:text-xl font-semibold">{currentItem.period}</p>
            )}
            {activeTab === 'education' && 'location' in currentItem && currentItem.location && (
              <p className="text-gray-300 text-base lg:text-lg mb-4 italic">{currentItem.location}</p>
            )}
            <p className="text-gray-400 text-base lg:text-lg mb-8 leading-relaxed">
              {currentItem.description.split('\n').map((line, index) => (
                <span key={index}>
                  {line}
                  {index < currentItem.description.split('\n').length - 1 && <br />}
                </span>
              ))}
            </p>
            {activeTab === 'projects' && 'website' in currentItem && currentItem.website && (
              <button 
                onClick={() => window.open(currentItem.website, '_blank')}
                className="text-white text-xl lg:text-2xl font-mono hover:text-gray-300 transition-all duration-300 hover:scale-110 cursor-pointer"
                style={{ textShadow: '0 0 15px rgba(118, 170, 255, 0.9), 0 0 30px rgba(59, 130, 246, 0.6), 0 0 45px rgba(59, 130, 246, 0.3)' }}
              >
                Visit Website
              </button>
            )}
          </div>
        </div>

        {/* Dots Indicator - In container for mobile/tablet */}
        <div className="block lg:hidden w-full mt-6">
          <div className="flex flex-col items-center space-y-2">
            <div className="flex space-x-3">
              {currentItems.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToItem(index)}
                  className={`w-3 h-3 transition-all duration-500 ease-in-out outline-none focus:outline-none ${
                    index === currentIndex 
                      ? 'bg-white shadow-[0_0_10px_rgba(255,255,255,0.8)]' 
                      : 'bg-white/30 hover:bg-white/50'
                  }`}
                  style={{
                    borderRadius: activeTab === 'education' ? '0%' : '50%',
                    transform: 'rotate(45deg)',
                  }}
                />
              ))}
            </div>
            <div className="flex items-center justify-center">
              {activeTab === 'projects' ? (
                <FolderOpen size={16} className="text-white/60" />
              ) : (
                <GraduationCap size={16} className="text-white/60" />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Arrows */}
      <button 
        onClick={prevItem}
        className="absolute left-4 lg:left-8 top-1/2 transform -translate-y-1/2 z-30 hover:scale-150 transition-all duration-300 cursor-pointer outline-none focus:outline-none"
      >
        <ChevronLeft size={40} className="lg:w-[60px] lg:h-[60px] text-white hover:text-gray-300" />
      </button>

      <button 
        onClick={nextItem}
        className="absolute right-4 lg:right-8 top-1/2 transform -translate-y-1/2 z-30 hover:scale-150 transition-all duration-300 cursor-pointer outline-none focus:outline-none"
      >
        <ChevronRight size={40} className="lg:w-[60px] lg:h-[60px] text-white hover:text-gray-300" />
      </button>

      {/* Dots Indicator - Bottom Center of Page (large screens only) */}
      <div className="hidden lg:block absolute bottom-2 left-1/2 transform -translate-x-1/2 z-30">
        <div className="flex flex-col items-center space-y-2">
          <div className="flex space-x-3">
            {currentItems.map((_, index) => (
              <button
                key={index}
                onClick={() => goToItem(index)}
                className={`w-3 h-3 transition-all duration-500 ease-in-out outline-none focus:outline-none ${
                  index === currentIndex 
                    ? 'bg-white shadow-[0_0_10px_rgba(255,255,255,0.8)]' 
                    : 'bg-white/30 hover:bg-white/50'
                }`}
                style={{
                  borderRadius: activeTab === 'education' ? '0%' : '50%',
                  transform: 'rotate(45deg)',
                }}
              />
            ))}
          </div>
          <div className="flex items-center justify-center">
            {activeTab === 'projects' ? (
              <FolderOpen size={16} className="text-white/60" />
            ) : (
              <GraduationCap size={16} className="text-white/60" />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
