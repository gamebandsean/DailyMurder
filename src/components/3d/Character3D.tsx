import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface Character3DProps {
  position: [number, number, number];
  color: string;
  name: string;
  isSelected?: boolean;
  onClick?: () => void;
  itemEmoji?: string;
  itemRevealed?: boolean;
  characterIndex?: number; // To determine unique features
}

// Hair colors for variety (5 characters now)
const HAIR_COLORS = [
  '#2C1810', // Dark brown
  '#D4A574', // Blonde
  '#1A1A1A', // Black
  '#8B4513', // Auburn/red
  '#4A4A4A', // Gray
];

// Low-poly stylized character - geometric/angular design with unique features
export default function Character3D({ 
  position, 
  color, 
  name, 
  isSelected = false,
  onClick,
  itemEmoji,
  itemRevealed = false,
  characterIndex = 0
}: Character3DProps) {
  const groupRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);
  
  // Gentle idle animation
  useFrame((state) => {
    if (groupRef.current) {
      // Subtle breathing motion
      groupRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 2 + characterIndex) * 0.02;
      // Slight sway - different phase for each character
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5 + characterIndex * 0.5) * 0.05;
    }
  });

  const emissiveIntensity = isSelected ? 0.4 : hovered ? 0.25 : 0.05;
  const darkerColor = new THREE.Color(color).offsetHSL(0, 0, -0.15);
  const scale = 1.1;
  const hairColor = HAIR_COLORS[characterIndex % HAIR_COLORS.length];
  
  // Character 2 (index 1) wears a hat (detective/fedora style)
  const hasHat = characterIndex === 1;
  // Character 3 (index 2) has a bowler hat
  const hasBowlerHat = characterIndex === 2;

  return (
    <group 
      ref={groupRef} 
      position={position}
      scale={[scale, scale, scale]}
      onClick={(e) => {
        e.stopPropagation();
        onClick?.();
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(true);
        document.body.style.cursor = 'pointer';
      }}
      onPointerOut={() => {
        setHovered(false);
        document.body.style.cursor = 'default';
      }}
    >
      {/* Body - angular torso with jacket */}
      <mesh position={[0, 0.65, 0]} castShadow>
        <boxGeometry args={[0.5, 0.7, 0.3]} />
        <meshStandardMaterial 
          color={color} 
          emissive={color}
          emissiveIntensity={emissiveIntensity}
          roughness={0.6}
        />
      </mesh>
      
      {/* Collar/lapel detail */}
      <mesh position={[0, 0.9, 0.12]} castShadow>
        <boxGeometry args={[0.35, 0.15, 0.08]} />
        <meshStandardMaterial color={darkerColor} roughness={0.7} />
      </mesh>
      
      {/* Head - slightly angular sphere */}
      <mesh position={[0, 1.25, 0]} castShadow>
        <dodecahedronGeometry args={[0.22, 1]} />
        <meshStandardMaterial 
          color="#E8D5C4" 
          roughness={0.7}
          emissive="#E8D5C4"
          emissiveIntensity={emissiveIntensity * 0.3}
        />
      </mesh>
      
      {/* Hair - different styles based on character */}
      {!hasHat && !hasBowlerHat && (
        <mesh position={[0, 1.38, -0.02]} castShadow>
          <boxGeometry args={[0.28, 0.12, 0.26]} />
          <meshStandardMaterial color={hairColor} roughness={0.9} />
        </mesh>
      )}
      
      {/* Character 0: Slicked back hair */}
      {characterIndex === 0 && (
        <mesh position={[0, 1.42, -0.08]} rotation={[0.3, 0, 0]} castShadow>
          <boxGeometry args={[0.24, 0.08, 0.18]} />
          <meshStandardMaterial color={hairColor} roughness={0.8} />
        </mesh>
      )}
      
      {/* Character 3: Longer wavy hair */}
      {characterIndex === 3 && (
        <>
          <mesh position={[0, 1.38, 0]} castShadow>
            <boxGeometry args={[0.32, 0.14, 0.3]} />
            <meshStandardMaterial color={hairColor} roughness={0.9} />
          </mesh>
          {/* Side hair */}
          <mesh position={[-0.18, 1.28, 0]} castShadow>
            <boxGeometry args={[0.08, 0.2, 0.18]} />
            <meshStandardMaterial color={hairColor} roughness={0.9} />
          </mesh>
          <mesh position={[0.18, 1.28, 0]} castShadow>
            <boxGeometry args={[0.08, 0.2, 0.18]} />
            <meshStandardMaterial color={hairColor} roughness={0.9} />
          </mesh>
        </>
      )}
      
      {/* Fedora hat for character 1 */}
      {hasHat && (
        <>
          {/* Hat crown */}
          <mesh position={[0, 1.48, 0]} castShadow>
            <cylinderGeometry args={[0.16, 0.2, 0.14, 8]} />
            <meshStandardMaterial color="#2A2520" roughness={0.5} />
          </mesh>
          {/* Hat brim */}
          <mesh position={[0, 1.41, 0]} rotation={[-Math.PI/2, 0, 0]} castShadow>
            <cylinderGeometry args={[0.3, 0.3, 0.025, 8]} />
            <meshStandardMaterial color="#2A2520" roughness={0.5} />
          </mesh>
          {/* Hat band */}
          <mesh position={[0, 1.43, 0]} castShadow>
            <cylinderGeometry args={[0.21, 0.21, 0.03, 8]} />
            <meshStandardMaterial color="#8B0000" roughness={0.6} />
          </mesh>
        </>
      )}
      
      {/* Bowler hat for character 2 */}
      {hasBowlerHat && (
        <>
          {/* Hat dome */}
          <mesh position={[0, 1.48, 0]} castShadow>
            <sphereGeometry args={[0.16, 8, 6, 0, Math.PI * 2, 0, Math.PI / 2]} />
            <meshStandardMaterial color="#1A1A1A" roughness={0.4} />
          </mesh>
          {/* Hat base */}
          <mesh position={[0, 1.40, 0]} castShadow>
            <cylinderGeometry args={[0.16, 0.16, 0.06, 8]} />
            <meshStandardMaterial color="#1A1A1A" roughness={0.4} />
          </mesh>
          {/* Hat brim */}
          <mesh position={[0, 1.38, 0]} rotation={[-Math.PI/2, 0, 0]} castShadow>
            <ringGeometry args={[0.15, 0.26, 16]} />
            <meshStandardMaterial color="#1A1A1A" roughness={0.4} side={THREE.DoubleSide} />
          </mesh>
        </>
      )}
      
      {/* Eyes - simple dark spots */}
      <mesh position={[-0.06, 1.28, 0.18]}>
        <sphereGeometry args={[0.025, 8, 8]} />
        <meshBasicMaterial color="#1A1A1A" />
      </mesh>
      <mesh position={[0.06, 1.28, 0.18]}>
        <sphereGeometry args={[0.025, 8, 8]} />
        <meshBasicMaterial color="#1A1A1A" />
      </mesh>
      
      {/* Eyebrows for more expression */}
      <mesh position={[-0.06, 1.32, 0.19]} rotation={[0, 0, characterIndex === 2 ? 0.2 : -0.1]}>
        <boxGeometry args={[0.05, 0.012, 0.01]} />
        <meshBasicMaterial color={hairColor} />
      </mesh>
      <mesh position={[0.06, 1.32, 0.19]} rotation={[0, 0, characterIndex === 2 ? -0.2 : 0.1]}>
        <boxGeometry args={[0.05, 0.012, 0.01]} />
        <meshBasicMaterial color={hairColor} />
      </mesh>
      
      {/* Left Arm */}
      <mesh position={[-0.35, 0.6, 0]} rotation={[0, 0, 0.15]} castShadow>
        <boxGeometry args={[0.14, 0.5, 0.14]} />
        <meshStandardMaterial color={color} roughness={0.7} />
      </mesh>
      {/* Left hand */}
      <mesh position={[-0.38, 0.32, 0]} castShadow>
        <boxGeometry args={[0.1, 0.1, 0.08]} />
        <meshStandardMaterial color="#E8D5C4" roughness={0.7} />
      </mesh>
      
      {/* Right Arm */}
      <mesh position={[0.35, 0.6, 0]} rotation={[0, 0, -0.15]} castShadow>
        <boxGeometry args={[0.14, 0.5, 0.14]} />
        <meshStandardMaterial color={color} roughness={0.7} />
      </mesh>
      {/* Right hand */}
      <mesh position={[0.38, 0.32, 0]} castShadow>
        <boxGeometry args={[0.1, 0.1, 0.08]} />
        <meshStandardMaterial color="#E8D5C4" roughness={0.7} />
      </mesh>
      
      {/* Legs */}
      <mesh position={[-0.12, 0.18, 0]} castShadow>
        <boxGeometry args={[0.16, 0.36, 0.16]} />
        <meshStandardMaterial color="#2A2520" roughness={0.8} />
      </mesh>
      <mesh position={[0.12, 0.18, 0]} castShadow>
        <boxGeometry args={[0.16, 0.36, 0.16]} />
        <meshStandardMaterial color="#2A2520" roughness={0.8} />
      </mesh>
      
      {/* Shoes */}
      <mesh position={[-0.12, 0.03, 0.03]} castShadow>
        <boxGeometry args={[0.14, 0.06, 0.22]} />
        <meshStandardMaterial color="#1A1412" roughness={0.4} metalness={0.2} />
      </mesh>
      <mesh position={[0.12, 0.03, 0.03]} castShadow>
        <boxGeometry args={[0.14, 0.06, 0.22]} />
        <meshStandardMaterial color="#1A1412" roughness={0.4} metalness={0.2} />
      </mesh>
      
      {/* Selection ring when hovered/selected */}
      {(hovered || isSelected) && (
        <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.4, 0.55, 32]} />
          <meshBasicMaterial 
            color={isSelected ? "#FFD700" : "#FFFFFF"} 
            transparent 
            opacity={0.7}
            side={THREE.DoubleSide}
          />
        </mesh>
      )}
      
      {/* Floating name plate */}
      <group position={[0, hasHat || hasBowlerHat ? 1.75 : 1.65, 0]}>
        <mesh>
          <planeGeometry args={[0.7, 0.18]} />
          <meshBasicMaterial color="#1A0F0A" transparent opacity={0.85} side={THREE.DoubleSide} />
        </mesh>
      </group>
    </group>
  );
}
