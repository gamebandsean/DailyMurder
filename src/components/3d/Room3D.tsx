import React from 'react';
import * as THREE from 'three';

// Victorian study / noir crime scene room
export default function Room3D() {
  const wallColor = "#2C1810";
  const floorColor = "#1A0F0A";
  const trimColor = "#4A3228";
  
  return (
    <group>
      {/* Floor - wooden planks effect */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[8, 8]} />
        <meshStandardMaterial 
          color={floorColor} 
          roughness={0.9}
          metalness={0.1}
        />
      </mesh>
      
      {/* Floor pattern - planks */}
      {[-3, -2, -1, 0, 1, 2, 3].map((x) => (
        <mesh 
          key={x} 
          rotation={[-Math.PI / 2, 0, 0]} 
          position={[x, 0.001, 0]}
          receiveShadow
        >
          <planeGeometry args={[0.02, 8]} />
          <meshStandardMaterial color="#0D0705" roughness={0.9} />
        </mesh>
      ))}
      
      {/* Back wall */}
      <mesh position={[0, 2, -4]} receiveShadow>
        <planeGeometry args={[8, 4]} />
        <meshStandardMaterial color={wallColor} roughness={0.8} />
      </mesh>
      
      {/* Left wall */}
      <mesh position={[-4, 2, 0]} rotation={[0, Math.PI / 2, 0]} receiveShadow>
        <planeGeometry args={[8, 4]} />
        <meshStandardMaterial color={new THREE.Color(wallColor).offsetHSL(0, 0, -0.05)} roughness={0.8} />
      </mesh>
      
      {/* Right wall */}
      <mesh position={[4, 2, 0]} rotation={[0, -Math.PI / 2, 0]} receiveShadow>
        <planeGeometry args={[8, 4]} />
        <meshStandardMaterial color={new THREE.Color(wallColor).offsetHSL(0, 0, -0.05)} roughness={0.8} />
      </mesh>
      
      {/* Wainscoting / wall trim */}
      <mesh position={[0, 0.5, -3.99]}>
        <boxGeometry args={[8, 1, 0.05]} />
        <meshStandardMaterial color={trimColor} roughness={0.7} />
      </mesh>
      
      {/* Bookshelf - left wall */}
      <group position={[-3.8, 1.2, -1]}>
        <mesh castShadow>
          <boxGeometry args={[0.4, 2.4, 1.2]} />
          <meshStandardMaterial color="#3D2817" roughness={0.8} />
        </mesh>
        {/* Books */}
        {[0.3, 0, -0.3].map((y, i) => (
          <mesh key={i} position={[0.15, y, 0]} castShadow>
            <boxGeometry args={[0.15, 0.25, 1]} />
            <meshStandardMaterial 
              color={['#8B0000', '#006400', '#00008B'][i]} 
              roughness={0.9} 
            />
          </mesh>
        ))}
      </group>
      
      {/* Fireplace - back wall */}
      <group position={[0, 0, -3.9]}>
        {/* Mantle */}
        <mesh position={[0, 1.4, 0.15]} castShadow>
          <boxGeometry args={[1.8, 0.15, 0.4]} />
          <meshStandardMaterial color="#4A3228" roughness={0.6} />
        </mesh>
        {/* Fireplace opening */}
        <mesh position={[0, 0.6, 0.1]}>
          <boxGeometry args={[1.2, 1.2, 0.3]} />
          <meshStandardMaterial color="#0A0505" roughness={1} />
        </mesh>
        {/* Embers glow */}
        <pointLight 
          position={[0, 0.3, 0.3]} 
          color="#FF4500" 
          intensity={0.3} 
          distance={2}
        />
      </group>
      
      {/* Desk - right side */}
      <group position={[2.5, 0, -2.5]}>
        <mesh position={[0, 0.4, 0]} castShadow receiveShadow>
          <boxGeometry args={[1.2, 0.08, 0.6]} />
          <meshStandardMaterial color="#3D2817" roughness={0.7} />
        </mesh>
        {/* Desk legs */}
        {[[-0.5, -0.2], [0.5, -0.2], [-0.5, 0.2], [0.5, 0.2]].map(([x, z], i) => (
          <mesh key={i} position={[x, 0.2, z]} castShadow>
            <boxGeometry args={[0.08, 0.4, 0.08]} />
            <meshStandardMaterial color="#2D1F12" roughness={0.8} />
          </mesh>
        ))}
        {/* Papers on desk */}
        <mesh position={[0, 0.45, 0]} rotation={[-Math.PI / 2, 0, 0.1]}>
          <planeGeometry args={[0.3, 0.4]} />
          <meshStandardMaterial color="#F5E6D3" roughness={0.9} />
        </mesh>
      </group>
      
      {/* Grandfather clock - right wall */}
      <group position={[3.7, 0, 1]}>
        <mesh position={[0, 1.2, 0]} castShadow>
          <boxGeometry args={[0.5, 2.4, 0.4]} />
          <meshStandardMaterial color="#2D1F12" roughness={0.7} />
        </mesh>
        {/* Clock face */}
        <mesh position={[-0.2, 1.8, 0]}>
          <circleGeometry args={[0.15, 16]} />
          <meshStandardMaterial color="#F5E6D3" roughness={0.8} />
        </mesh>
      </group>
      
      {/* Rug under the body */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
        <planeGeometry args={[3, 2.5]} />
        <meshStandardMaterial 
          color="#4A1A1A" 
          roughness={0.95}
        />
      </mesh>
      
      {/* Rug border */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.012, 0]}>
        <ringGeometry args={[1.1, 1.2, 4]} />
        <meshStandardMaterial color="#8B7355" roughness={0.9} />
      </mesh>
      
      {/* Chandelier */}
      <group position={[0, 3.5, 0]}>
        <mesh>
          <cylinderGeometry args={[0.05, 0.05, 0.5, 8]} />
          <meshStandardMaterial color="#8B7355" metalness={0.8} roughness={0.3} />
        </mesh>
        <mesh position={[0, -0.3, 0]}>
          <cylinderGeometry args={[0.3, 0.2, 0.1, 8]} />
          <meshStandardMaterial color="#8B7355" metalness={0.8} roughness={0.3} />
        </mesh>
      </group>
    </group>
  );
}

