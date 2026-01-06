import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface Body3DProps {
  position?: [number, number, number];
}

// Low-poly victim body lying on the ground
export default function Body3D({ position = [0, 0, 0] }: Body3DProps) {
  const groupRef = useRef<THREE.Group>(null);
  const bloodPoolRef = useRef<THREE.Mesh>(null);
  
  // Subtle pulsing blood pool effect
  useFrame((state) => {
    if (bloodPoolRef.current) {
      const scale = 1 + Math.sin(state.clock.elapsedTime * 0.5) * 0.02;
      bloodPoolRef.current.scale.set(scale, scale, 1);
    }
  });

  return (
    <group ref={groupRef} position={position}>
      {/* Blood pool */}
      <mesh 
        ref={bloodPoolRef}
        position={[0, 0.01, 0]} 
        rotation={[-Math.PI / 2, 0, 0]}
        receiveShadow
      >
        <circleGeometry args={[0.6, 16]} />
        <meshStandardMaterial 
          color="#4A0000" 
          roughness={0.3}
          metalness={0.1}
        />
      </mesh>
      
      {/* Body - lying down torso */}
      <mesh position={[0, 0.12, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <boxGeometry args={[0.35, 0.7, 0.25]} />
        <meshStandardMaterial color="#3A3A3A" roughness={0.8} />
      </mesh>
      
      {/* Head - turned to side */}
      <mesh position={[-0.5, 0.1, 0]} castShadow>
        <dodecahedronGeometry args={[0.15, 0]} />
        <meshStandardMaterial color="#C4A882" roughness={0.9} />
      </mesh>
      
      {/* Arm outstretched */}
      <mesh position={[0.15, 0.08, 0.35]} rotation={[0, 0.5, Math.PI / 2]} castShadow>
        <boxGeometry args={[0.1, 0.4, 0.1]} />
        <meshStandardMaterial color="#3A3A3A" roughness={0.8} />
      </mesh>
      
      {/* Other arm */}
      <mesh position={[0.1, 0.08, -0.25]} rotation={[0, -0.3, Math.PI / 2]} castShadow>
        <boxGeometry args={[0.1, 0.35, 0.1]} />
        <meshStandardMaterial color="#3A3A3A" roughness={0.8} />
      </mesh>
      
      {/* Legs */}
      <mesh position={[0.5, 0.08, 0.1]} rotation={[0, 0.2, 0]} castShadow>
        <boxGeometry args={[0.5, 0.12, 0.12]} />
        <meshStandardMaterial color="#2A2520" roughness={0.8} />
      </mesh>
      <mesh position={[0.5, 0.08, -0.15]} rotation={[0, -0.15, 0]} castShadow>
        <boxGeometry args={[0.5, 0.12, 0.12]} />
        <meshStandardMaterial color="#2A2520" roughness={0.8} />
      </mesh>
      
      {/* Chalk outline effect */}
      <mesh position={[0, 0.005, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.9, 0.95, 32]} />
        <meshBasicMaterial color="#F5E6D3" transparent opacity={0.3} />
      </mesh>
    </group>
  );
}

