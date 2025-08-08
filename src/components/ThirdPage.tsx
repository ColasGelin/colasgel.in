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
      if (pageRef.current) {
        const rect = pageRef.current.getBoundingClientRect();
        const windowHeight = window.innerHeight;
        
        // Calculate how much of the ThirdPage section has been scrolled through
        // 0 = section just entering viewport from bottom
        // 1 = section completely passed through viewport
        const sectionTop = rect.top;
        const sectionHeight = rect.height;
        
        let progress = 0;
        
        if (sectionTop <= windowHeight && sectionTop > -sectionHeight) {
          // Section is in viewport - calculate progress based on how much has been revealed
          progress = Math.max(0, Math.min(1, (windowHeight - sectionTop) / (windowHeight + sectionHeight * 0.5)));
        } else if (sectionTop <= -sectionHeight) {
          // Section has completely passed through
          progress = 1;
        }
        
        setScrollProgress(progress);
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Initial call
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Calculate opacity and blur based on scroll progress
  const overlayOpacity = scrollProgress < 0.6 ? 0 : Math.min(1, (scrollProgress - 0.6) * 20); // Opacity starts at 0.5 progress, reaches 1 at 1.0 progress
  const blurAmount = scrollProgress * 8; // Blur: 0px → 8px

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
        className="louis-george-font fixed inset-0 flex items-center justify-center z-50"
        style={{
          opacity: overlayOpacity,
          backdropFilter: `blur(${blurAmount}px)`,
          WebkitBackdropFilter: `blur(${blurAmount}px)`,
          transition: 'none', // Remove transitions for immediate scroll response
          pointerEvents: overlayOpacity > 0 ? 'auto' : 'none'
        }}
      >
        <div 
          className="p-12 max-w-4xl mx-4"
          style={{
            backdropFilter: `blur(${blurAmount * 0.5}px)`,
            WebkitBackdropFilter: `blur(${blurAmount * 0.5}px)`,
          }}
        >
          <div className="text-center mb-12">
            <h1 className="text</div>-4xl lg:text-5xl font-bold text-white mb-4" style={{ textShadow: '0 4px 8px rgba(0, 0, 0, 0.8), 0 6px 20px rgba(0, 0, 0, 0.6)' }}>
              Let's <span className="text-blue-400">Connect</span>
            </h1>
            <p className="text-lg text-blue-400 font-bold" style={{ textShadow: '0 4px 8px rgba(0, 0, 0, 0.8), 0 6px 20px rgba(0, 0, 0, 0.6)' }}>
              Ready to collaborate? Let's create something new together.
            </p>
          </div>

          {/* Contact Items */}
          <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto">
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
                <p className="text-white font-medium text-lg mb-2" style={{ textShadow: '0 4px 8px rgba(0, 0, 0, 0.8), 0 6px 20px rgba(0, 0, 0, 0.6)' }}>Email</p>
                <p className="text-blue-400 group-hover:text-white transition-colors text-sm break-all" style={{ textShadow: '0 4px 8px rgba(0, 0, 0, 0.8), 0 6px 20px rgba(0, 0, 0, 0.6)' }}>cgelin.pro@gmail.com</p>
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
                <p className="text-white font-medium text-lg mb-2" style={{ textShadow: '0 4px 8px rgba(0, 0, 0, 0.8), 0 6px 20px rgba(0, 0, 0, 0.6)' }}>GitHub</p>
                <p className="text-blue-400 group-hover:text-white transition-colors text-sm" style={{ textShadow: '0 4px 8px rgba(0, 0, 0, 0.8), 0 6px 20px rgba(0, 0, 0, 0.6)' }}>@ColasGelin</p>
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
                <p className="text-white font-medium text-lg mb-2" style={{ textShadow: '0 4px 8px rgba(0, 0, 0, 0.8), 0 6px 20px rgba(0, 0, 0, 0.6)' }}>LinkedIn</p>
                <p className="text-blue-400 group-hover:text-white transition-colors text-sm" style={{ textShadow: '0 4px 8px rgba(0, 0, 0, 0.8), 0 6px 20px rgba(0, 0, 0, 0.6)' }}>@ColasGelin</p>
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