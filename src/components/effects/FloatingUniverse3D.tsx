"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { Float } from "@react-three/drei";
import { useEffect, useRef } from "react";
import * as THREE from "three";

/** Pointer parallax rig: the camera drifts gently toward the cursor.
 *  Reads window pointer events (the canvas itself is pointer-events-none),
 *  lerps for softness, and stays still when reduced motion is preferred. */
function Rig() {
  const pointer = useRef({ x: 0, y: 0 });
  const reduce =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  useEffect(() => {
    function onMove(e: PointerEvent) {
      pointer.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.current.y = -((e.clientY / window.innerHeight) * 2 - 1);
    }
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  useFrame((state) => {
    if (reduce) return;
    const { x, y } = pointer.current;
    state.camera.position.x = THREE.MathUtils.lerp(state.camera.position.x, x * 0.85, 0.035);
    state.camera.position.y = THREE.MathUtils.lerp(state.camera.position.y, y * 0.55, 0.035);
    state.camera.lookAt(0, 0, 0);
  });
  return null;
}

function Orb({
  position,
  color,
  scale,
  speed,
}: {
  position: [number, number, number];
  color: string;
  scale: number;
  speed: number;
}) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (!ref.current) return;
    ref.current.rotation.x = state.clock.elapsedTime * 0.12 * speed;
    ref.current.rotation.y = state.clock.elapsedTime * 0.18 * speed;
  });
  return (
    <Float speed={speed} rotationIntensity={0.6} floatIntensity={1.4}>
      <mesh ref={ref} position={position} scale={scale}>
        <sphereGeometry args={[1, 48, 48]} />
        <meshPhysicalMaterial
          color={color}
          roughness={0.15}
          metalness={0.05}
          transmission={0.55}
          thickness={1.2}
          transparent
          opacity={0.92}
        />
      </mesh>
    </Float>
  );
}

/** The golden sun: a warm emissive sphere with a soft halo. */
function GoldenSun({ position }: { position: [number, number, number] }) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (!ref.current) return;
    ref.current.rotation.y = state.clock.elapsedTime * 0.1;
  });
  return (
    <Float speed={1.1} rotationIntensity={0.2} floatIntensity={0.9}>
      <mesh ref={ref} position={position} scale={1.5}>
        <sphereGeometry args={[1, 48, 48]} />
        <meshStandardMaterial color="#FFC93C" emissive="#FF9F1C" emissiveIntensity={0.9} roughness={0.3} />
      </mesh>
      <mesh position={position} scale={2.1}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshBasicMaterial color="#FFD166" transparent opacity={0.18} />
      </mesh>
    </Float>
  );
}

function Bubble({ position, scale, speed }: { position: [number, number, number]; scale: number; speed: number }) {
  return (
    <Float speed={speed} rotationIntensity={0.4} floatIntensity={1.8}>
      <mesh position={position} scale={scale}>
        <sphereGeometry args={[1, 24, 24]} />
        <meshPhysicalMaterial color="#E8F4FC" roughness={0.05} transmission={0.85} thickness={0.6} transparent opacity={0.7} />
      </mesh>
    </Float>
  );
}

/** Golden sun + translucent sea bubbles floating in 3D, with a soft parallax rig. */
export function FloatingUniverse3D() {
  return (
    <Canvas
      dpr={[1, 1.75]}
      camera={{ position: [0, 0, 9], fov: 45 }}
      gl={{ antialias: true, alpha: true }}
      aria-hidden="true"
    >
      <ambientLight intensity={1.1} />
      <directionalLight position={[5, 5, 5]} intensity={1.4} />
      <pointLight position={[5, 3, 4]} intensity={14} color="#FFC93C" />
      <pointLight position={[-5, -3, 4]} intensity={10} color="#4DB2E8" />
      <Rig />
      {/* Sun and orbs stay at the margins: the center belongs to the title. */}
      <GoldenSun position={[4.9, 2.1, -1]} />
      <Orb position={[-4.6, 1.4, -1]} color="#0E5A8A" scale={1.35} speed={1.4} />
      <Orb position={[-5.4, -2.2, -2]} color="#7CC8F0" scale={0.7} speed={2.2} />
      <Orb position={[5.2, -2.4, -2]} color="#4DB2E8" scale={0.8} speed={1.6} />
      <Orb position={[-3.2, 2.8, -2.5]} color="#FFD166" scale={0.5} speed={2.6} />
      <Orb position={[3.4, -2.9, -2.2]} color="#0E5A8A" scale={0.55} speed={2.4} />
      <Bubble position={[-5.8, -1.2, 0.5]} scale={0.45} speed={2.4} />
      <Bubble position={[1.8, -3.0, -0.5]} scale={0.35} speed={2.8} />
      <Bubble position={[-1.6, 3.1, -1]} scale={0.3} speed={2.2} />
    </Canvas>
  );
}
