import React, { Suspense, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import Room3D from './Room3D';
import Body3D from './Body3D';
import Character3D from './Character3D';
import { CharacterState } from '../../types';

interface Scene3DProps {
  characters: CharacterState[];
  selectedCharacterId: string | null;
  onCharacterClick: (character: CharacterState) => void;
  revealedItems: string[];
}

// Character colors - distinct noir palette
const CHARACTER_COLORS = [
  '#8B4513', // Saddle brown
  '#2F4F4F', // Dark slate gray
  '#8B0000', // Dark red
  '#2E4E2E', // Dark green
];

// Character positions around the body in a semi-circle
const CHARACTER_POSITIONS: [number, number, number][] = [
  [-2, 0, 1.2],     // Front left
  [-0.7, 0, 1.8],   // Front center-left
  [0.7, 0, 1.8],    // Front center-right
  [2, 0, 1.2],      // Front right
];

// Simple camera controls
function CameraController() {
  const { camera, gl } = useThree();
  const isDragging = useRef(false);
  const previousMousePosition = useRef({ x: 0, y: 0 });
  const spherical = useRef({ theta: 0, phi: Math.PI / 3.2 });
  const radius = 7;

  React.useEffect(() => {
    const domElement = gl.domElement;

    const handleMouseDown = (e: MouseEvent) => {
      isDragging.current = true;
      previousMousePosition.current = { x: e.clientX, y: e.clientY };
    };

    const handleMouseUp = () => {
      isDragging.current = false;
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging.current) return;

      const deltaX = e.clientX - previousMousePosition.current.x;
      const deltaY = e.clientY - previousMousePosition.current.y;

      spherical.current.theta -= deltaX * 0.005;
      spherical.current.phi = Math.max(
        0.3,
        Math.min(Math.PI / 2.2, spherical.current.phi + deltaY * 0.005)
      );

      previousMousePosition.current = { x: e.clientX, y: e.clientY };
    };

    domElement.addEventListener('mousedown', handleMouseDown);
    domElement.addEventListener('mouseup', handleMouseUp);
    domElement.addEventListener('mouseleave', handleMouseUp);
    domElement.addEventListener('mousemove', handleMouseMove);

    return () => {
      domElement.removeEventListener('mousedown', handleMouseDown);
      domElement.removeEventListener('mouseup', handleMouseUp);
      domElement.removeEventListener('mouseleave', handleMouseUp);
      domElement.removeEventListener('mousemove', handleMouseMove);
    };
  }, [gl]);

  useFrame(() => {
    const { theta, phi } = spherical.current;
    camera.position.x = radius * Math.sin(phi) * Math.sin(theta);
    camera.position.y = radius * Math.cos(phi);
    camera.position.z = radius * Math.sin(phi) * Math.cos(theta);
    camera.lookAt(0, 0.5, 0);
  });

  return null;
}

export default function Scene3D({ 
  characters, 
  selectedCharacterId,
  onCharacterClick,
  revealedItems
}: Scene3DProps) {
  return (
    <Canvas
      shadows
      camera={{ 
        position: [0, 3, 5], 
        fov: 50,
        near: 0.1,
        far: 100
      }}
      style={{ background: '#1A0F0A' }}
    >
      <Suspense fallback={null}>
        {/* Camera controls */}
        <CameraController />
        
        {/* Ambient light - brighter for visibility */}
        <ambientLight intensity={0.6} color="#FFF5E6" />
        
        {/* Main overhead light */}
        <directionalLight
          position={[0, 10, 5]}
          intensity={1.2}
          color="#FFFFFF"
          castShadow
        />
        
        {/* Main dramatic spotlight from above */}
        <spotLight
          position={[0, 8, 4]}
          angle={0.6}
          penumbra={0.4}
          intensity={3}
          color="#FFF5E6"
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
        />
        
        {/* Front fill light for visibility */}
        <pointLight
          position={[0, 2, 6]}
          intensity={1.5}
          color="#FFE4C4"
        />
        
        {/* Left fill */}
        <pointLight
          position={[-4, 3, 2]}
          intensity={0.8}
          color="#B8860B"
        />
        
        {/* Right fill */}
        <pointLight
          position={[4, 3, 2]}
          intensity={0.8}
          color="#D4AF37"
        />
        
        {/* Rim light from behind - red accent */}
        <pointLight
          position={[0, 2, -3]}
          intensity={0.6}
          color="#8B0000"
        />
        
        {/* The room environment */}
        <Room3D />
        
        {/* Dramatic spotlight on the body */}
        <spotLight
          position={[0, 5, 0.5]}
          angle={0.35}
          penumbra={0.3}
          intensity={4}
          color="#FFFAF0"
          castShadow
          target-position={[0, 0, 0]}
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
        />
        
        {/* Volumetric light cone effect (visible light beam) */}
        <mesh position={[0, 2.5, 0.25]} rotation={[0.05, 0, 0]}>
          <coneGeometry args={[1.2, 5, 32, 1, true]} />
          <meshBasicMaterial 
            color="#FFFAF0" 
            transparent 
            opacity={0.03} 
            side={THREE.DoubleSide}
            depthWrite={false}
          />
        </mesh>
        
        {/* The victim's body */}
        <Body3D position={[0, 0, 0]} />
        
        {/* The suspects */}
        {characters.map((character, index) => (
          <Character3D
            key={character.suspect.id}
            position={CHARACTER_POSITIONS[index]}
            color={CHARACTER_COLORS[index]}
            name={character.suspect.name}
            isSelected={selectedCharacterId === character.suspect.id}
            onClick={() => onCharacterClick(character)}
            itemEmoji={character.currentItem?.emoji || '❓'}
            itemRevealed={revealedItems.includes(character.suspect.id)}
            characterIndex={index}
          />
        ))}
      </Suspense>
    </Canvas>
  );
}
