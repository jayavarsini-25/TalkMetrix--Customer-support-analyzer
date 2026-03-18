import { Suspense, useRef, Component, ReactNode } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Html } from "@react-three/drei";
import * as THREE from "three";

interface Agent3DPoint {
  name: string;
  score: number;
}

class ErrorBoundary extends Component<{ children: ReactNode; fallback: ReactNode }, { hasError: boolean }> {
  state = { hasError: false };
  static getDerivedStateFromError() { return { hasError: true }; }
  render() { return this.state.hasError ? this.props.fallback : this.props.children; }
}

function Bar({ position, height, color, name, score }: {
  position: [number, number, number];
  height: number;
  color: string;
  name: string;
  score: number;
}) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 0.8 + position[0]) * 0.05;
    }
  });

  return (
    <group>
      <mesh ref={meshRef} position={position}>
        <boxGeometry args={[0.6, height, 0.6]} />
        <meshStandardMaterial color={color} transparent opacity={0.85} roughness={0.2} metalness={0.3} />
      </mesh>
      <Html position={[position[0], -0.3, position[2]]} center style={{ pointerEvents: "none" }}>
        <div className="text-center whitespace-nowrap">
          <div className="text-[10px] font-semibold text-foreground">{name}</div>
          <div className="text-[10px] font-bold text-primary">{score}</div>
        </div>
      </Html>
    </group>
  );
}

function getColorByScore(score: number) {
  if (score >= 90) return "#0ea5e9";
  if (score >= 80) return "#22c55e";
  if (score >= 70) return "#eab308";
  return "#ef4444";
}

function Scene({ agentData }: { agentData: Agent3DPoint[] }) {
  const centeredOffset = ((agentData.length - 1) * 1.2) / 2;

  return (
    <>
      <ambientLight intensity={0.6} />
      <directionalLight position={[5, 8, 5]} intensity={0.8} />
      <pointLight position={[-3, 4, -3]} intensity={0.4} color="#0ea5e9" />
      {agentData.map((agent, i) => {
        const height = (agent.score / 100) * 2.5;
        return (
          <Bar
            key={agent.name}
            position={[i * 1.2 - centeredOffset, height / 2 - 0.5, 0]}
            height={height}
            color={getColorByScore(agent.score)}
            name={agent.name}
            score={agent.score}
          />
        );
      })}
      <OrbitControls
        enableZoom={false}
        enablePan={false}
        autoRotate
        autoRotateSpeed={0.5}
        maxPolarAngle={Math.PI / 2.2}
        minPolarAngle={Math.PI / 4}
      />
    </>
  );
}

const FallbackUI = () => (
  <div className="w-full h-[400px] glass rounded-xl flex items-center justify-center text-sm text-muted-foreground shadow-depth">
    3D visualization unavailable
  </div>
);

const Analytics3DView = ({ data }: { data: Agent3DPoint[] }) => {
  if (!data.length) {
    return (
      <div className="w-full h-[400px] glass rounded-xl flex items-center justify-center text-sm text-muted-foreground shadow-depth">
        No analytics data available
      </div>
    );
  }

  return (
    <ErrorBoundary fallback={<FallbackUI />}>
      <div className="w-full h-[400px] rounded-xl glass overflow-hidden shadow-depth">
        <Suspense fallback={<div className="w-full h-full flex items-center justify-center text-muted-foreground text-sm">Loading 3D visualization...</div>}>
          <Canvas camera={{ position: [4, 3, 5], fov: 45 }} gl={{ antialias: true, alpha: true }} style={{ background: "transparent" }}>
            <Scene agentData={data} />
          </Canvas>
        </Suspense>
      </div>
    </ErrorBoundary>
  );
};

export default Analytics3DView;
