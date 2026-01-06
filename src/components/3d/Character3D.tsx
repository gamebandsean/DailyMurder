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
}

// Low-poly stylized character - geometric/angular design - BIGGER version
export default function Character3D({ 
  position, 
  color, 
  name, 
  isSelected = false,
  onClick,
  itemEmoji,
  itemRevealed = false
}: Character3DProps) {
  const groupRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);
  
  // Gentle idle animation
  useFrame((state) => {
    if (groupRef.current) {
      // Subtle breathing motion
      groupRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 2) * 0.02;
      // Slight sway
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.05;
    }
  });

  const emissiveIntensity = isSelected ? 0.4 : hovered ? 0.25 : 0.05;
  const darkerColor = new THREE.Color(color).offsetHSL(0, 0, -0.15);
  const scale = 1.1; // Character scale

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
      
      {/* Eyes - simple dark spots */}
      <mesh position={[-0.06, 1.28, 0.18]}>
        <sphereGeometry args={[0.025, 8, 8]} />
        <meshBasicMaterial color="#1A1A1A" />
      </mesh>
      <mesh position={[0.06, 1.28, 0.18]}>
        <sphereGeometry args={[0.025, 8, 8]} />
        <meshBasicMaterial color="#1A1A1A" />
      </mesh>
      
      {/* Hat - fedora style */}
      <mesh position={[0, 1.48, 0]} castShadow>
        <cylinderGeometry args={[0.18, 0.25, 0.12, 8]} />
        <meshStandardMaterial color={darkerColor} roughness={0.5} />
      </mesh>
      <mesh position={[0, 1.42, 0]} rotation={[-Math.PI/2, 0, 0]} castShadow>
        <cylinderGeometry args={[0.32, 0.32, 0.03, 8]} />
        <meshStandardMaterial color={darkerColor} roughness={0.5} />
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
      <group position={[0, 1.9, 0]}>
        <mesh>
          <planeGeometry args={[0.7, 0.18]} />
          <meshBasicMaterial color="#1A0F0A" transparent opacity={0.85} side={THREE.DoubleSide} />
        </mesh>
      </group>
    </group>
  );
}
