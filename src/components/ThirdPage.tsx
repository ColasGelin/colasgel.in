'use client'
import { useState, useEffect, useRef, Suspense } from 'react';
import { Mail, Github, Linkedin } from 'lucide-react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, useGLTF } from '@react-three/drei';
import * as THREE from 'three';

interface ThirdPageProps {
  className?: string;
  onHoveredIconChange?: (icon: string | null) => void;
}

function FloatingModel() {
  const meshRef = useRef<THREE.Group>(null);
  const { scene } = useGLTF('/models/chainlink.glb');

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

  useEffect(() => {
    const animate = () => {
      if (meshRef.current) {
        meshRef.current.rotation.z += 0.01;
      }
      requestAnimationFrame(animate);
    };
    animate();
  }, []);

  return (
    <group ref={meshRef} scale={[1, 1, 1]} rotation={[Math.PI / 2, Math.PI / 5, 0]}>
      <primitive object={scene.clone()} />
    </group>
  );
}

export default function ThirdPage({ className = '', onHoveredIconChange }: ThirdPageProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isAtBottom, setIsAtBottom] = useState(false);
  const [hoveredIcon, setHoveredIcon] = useState<string | null>(null);
  const pageRef = useRef<HTMLDivElement>(null);

  // Debug console log for hover changes
  useEffect(() => {
    console.log('ThirdPage hoveredIcon changed:', hoveredIcon);
  }, [hoveredIcon]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      {
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px'
      }
    );

    if (pageRef.current) {
      observer.observe(pageRef.current);
    }

    return () => {
      if (pageRef.current) {
        observer.unobserve(pageRef.current);
      }
    };
  }, []);

  // Add scroll-based transition effect
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      
      // Check if we're at the bottom (within 100px)
      const isNearBottom = scrollTop + windowHeight >= documentHeight - 100;
      setIsAtBottom(isNearBottom);

      if (pageRef.current) {
        const rect = pageRef.current.getBoundingClientRect();
        
        // Calculate scroll progress (0 to 1) based on element position
        const progress = Math.max(0, Math.min(1, 
          (windowHeight - rect.top) / (windowHeight + rect.height * 0.3)
        ));
        
        setScrollProgress(progress);
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Initial call
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Calculate transform values based on scroll progress
  const translateY = (1 - scrollProgress);
  const opacity = Math.min(1, scrollProgress * 1.5);
  const scale = 0.8 + (scrollProgress * 0.15); // This already goes from 0.8 to 1.0

  const handleIconHover = (icon: string | null) => {
    setHoveredIcon(icon);
    onHoveredIconChange?.(icon);
  };

  return (
    <>
      <div 
        ref={pageRef}
        className={`min-h-screen ${className}`}
        style={{
          opacity: 0,
        }}
      >
      </div>

      {/* Contact Information Overlay */}
      <div 
        className={`louis-george-font fixed inset-0 flex items-center justify-center pointer-events-none z-50 transition-all duration-1000 ${
          isAtBottom ? 'opacity-100' : 'opacity-0'
        }`}
        style={{
          backdropFilter: isAtBottom ? 'blur(8px)' : 'blur(0px)',
          WebkitBackdropFilter: isAtBottom ? 'blur(8px)' : 'blur(0px)',
          transition: 'opacity 1000ms ease-in-out, backdrop-filter 1000ms ease-in-out, -webkit-backdrop-filter 1000ms ease-in-out'
        }}
      >
        <div 
          className="p-12 pointer-events-auto max-w-4xl mx-4 transition-all duration-1000"
          style={{
            backdropFilter: isAtBottom ? 'blur(4px)' : 'blur(0px)',
            WebkitBackdropFilter: isAtBottom ? 'blur(4px)' : 'blur(0px)',
          }}
        >
          <div className="text-center mb-12">
            <h1 className="text-4xl lg:text-5xl font-bold text-white mb-4 drop-shadow-lg">
              Let's <span className="text-blue-400">Connect</span>
            </h1>
            <p className="text-lg text-blue-400 drop-shadow-lg font-bold">
              Ready to collaborate? Let's create something new together.
            </p>
          </div>

          {/* Contact Items */}
          <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto drop-shadow-lg">
            <a 
              href="mailto:cgelin.pro@gmail.com"
              className="flex flex-col items-center space-y-4 group cursor-pointer hover:transform hover:scale-105 transition-transform p-4 rounded-xl"
              onMouseEnter={() => handleIconHover('email')}
              onMouseLeave={() => handleIconHover(null)}
            >
              <div className="p-6 bg-white/10 backdrop-blur-sm rounded-xl group-hover:bg-white/20 transition-colors w-20 h-20 flex items-center justify-center border border-white/20">
                <Mail className="w-8 h-8 text-blue-400" />
              </div>
              <div className="text-center">
                <p className="text-white font-medium text-lg mb-2 drop-shadow-lg">Email</p>
                <p className="text-blue-400 group-hover:text-white transition-colors text-sm break-all drop-shadow-lg">cgelin.pro@gmail.com</p>
              </div>
            </a>

            <a 
              href="https://github.com/ColasGelin"
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center space-y-4 group cursor-pointer hover:transform hover:scale-105 transition-transform p-4 rounded-xl"
              onMouseEnter={() => handleIconHover('github')}
              onMouseLeave={() => handleIconHover(null)}
            >
              <div className="p-6 bg-white/10 backdrop-blur-sm rounded-xl group-hover:bg-white/20 transition-colors w-20 h-20 flex items-center justify-center border border-white/20">
                <Github className="w-8 h-8 text-blue-400" />
              </div>
              <div className="text-center">
                <p className="text-white font-medium text-lg mb-2 drop-shadow-lg">GitHub</p>
                <p className="text-blue-400 group-hover:text-white transition-colors text-sm drop-shadow-lg">@ColasGelin</p>
              </div>
            </a>

            <a 
              href="https://www.linkedin.com/in/colas-gelin-8931b3189/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center space-y-4 group cursor-pointer hover:transform hover:scale-105 transition-transform p-4 rounded-xl"
              onMouseEnter={() => handleIconHover('linkedin')}
              onMouseLeave={() => handleIconHover(null)}
            >
              <div className="p-6 bg-white/10 backdrop-blur-sm rounded-xl group-hover:bg-white/20 transition-colors w-20 h-20 flex items-center justify-center border border-white/20">
                <Linkedin className="w-8 h-8 text-blue-400" />
              </div>
              <div className="text-center">
                <p className="text-white font-medium text-lg mb-2 drop-shadow-lg">LinkedIn</p>
                <p className="text-blue-400 group-hover:text-white transition-colors text-sm drop-shadow-lg">@ColasGelin</p>
              </div>
            </a>
          </div>
        </div>
      </div>

      {/* Pass hover state to Scene */}
      <style jsx global>{`
        :root {
          --hovered-icon: ${hoveredIcon ? `"${hoveredIcon}"` : 'null'};
        }
      `}</style>
    </>
  );
}