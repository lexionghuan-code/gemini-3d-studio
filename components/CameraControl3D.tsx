
import React, { useMemo } from 'react';
import { Canvas, ThreeElements } from '@react-three/fiber';
import { OrbitControls, Grid, Line } from '@react-three/drei';
import * as THREE from 'three';
import { CameraParams } from '../types';

// Fix for JSX intrinsic element errors: Extend the JSX.IntrinsicElements interface with React Three Fiber types.
declare global {
  namespace React {
    namespace JSX {
      interface IntrinsicElements extends ThreeElements {}
    }
  }
}

interface Props {
  params: CameraParams;
  setParams: (p: CameraParams) => void;
  referenceImage: string | null;
  imageRatio: number;
}

const SubjectPlane = ({ url, ratio }: { url: string | null; ratio: number }) => {
  const texture = useMemo(() => (url ? new THREE.TextureLoader().load(url) : null), [url]);
  const planeSize = useMemo(() => {
    const base = 2.0;
    if (ratio >= 1) return [base, base / ratio] as [number, number];
    return [base * ratio, base] as [number, number];
  }, [ratio]);

  return (
    <group position={[0, planeSize[1] / 2, 0]}>
      <mesh>
        <planeGeometry args={planeSize} />
        {texture ? (
          <meshBasicMaterial map={texture} side={THREE.DoubleSide} transparent />
        ) : (
          <meshStandardMaterial color="#1e293b" wireframe />
        )}
      </mesh>
      {/* Dark back frame for the reference image plane */}
      <mesh position={[0, 0, -0.01]}>
        <planeGeometry args={[planeSize[0] + 0.05, planeSize[1] + 0.05]} />
        <meshStandardMaterial color="#020617" />
      </mesh>
    </group>
  );
};

const CameraControl3D: React.FC<Props> = ({ params, setParams, referenceImage, imageRatio }) => {
  const radius = params.distance * 5;
  
  // Calculate camera position in 3D space based on azimuth and elevation parameters.
  const cameraPos = useMemo(() => {
    const azRad = (params.azimuth) * (Math.PI / 180);
    const elRad = (params.elevation) * (Math.PI / 180);
    
    // Convert polar coordinates to Cartesian for 3D positioning.
    const x = radius * Math.sin(azRad) * Math.cos(elRad);
    const y = radius * Math.sin(elRad) + 1.0; 
    const z = radius * Math.cos(azRad) * Math.cos(elRad);
    
    return new THREE.Vector3(x, y, z);
  }, [params.azimuth, params.elevation, radius]);

  const hRingPoints = useMemo(() => {
    const pts = [];
    for (let i = 0; i <= 64; i++) {
      const a = (i / 64) * Math.PI * 2;
      pts.push(new THREE.Vector3(radius * Math.sin(a), 1.0, radius * Math.cos(a)));
    }
    return pts;
  }, [radius]);

  const vRingPoints = useMemo(() => {
    const pts = [];
    const azRad = (params.azimuth) * (Math.PI / 180);
    for (let i = -60; i <= 60; i++) {
      const el = (i) * (Math.PI / 180);
      pts.push(new THREE.Vector3(
        radius * Math.sin(azRad) * Math.cos(el),
        radius * Math.sin(el) + 1.0,
        radius * Math.cos(azRad) * Math.cos(el)
      ));
    }
    return pts;
  }, [params.azimuth, radius]);

  return (
    <div className="w-full h-full relative bg-[#020617]">
      <Canvas camera={{ position: [5, 4, 7], fov: 45 }}>
        <ambientLight intensity={0.6} />
        <pointLight position={[10, 10, 10]} intensity={2} />
        
        <SubjectPlane url={referenceImage} ratio={imageRatio} />
        
        {/* Visual guide: line from center to camera */}
        <Line points={[new THREE.Vector3(0, 1.0, 0), cameraPos]} color="#f472b6" lineWidth={1} transparent opacity={0.3} dashed />

        {/* 3D guide rings for spatial orientation */}
        <Line points={hRingPoints} color="#22d3ee" lineWidth={1} transparent opacity={0.3} />
        <Line points={vRingPoints} color="#f472b6" lineWidth={1} transparent opacity={0.3} />

        {/* Visual representation of the camera */}
        <group position={cameraPos}>
          <mesh>
            <boxGeometry args={[0.5, 0.35, 0.6]} />
            <meshStandardMaterial color="#3b82f6" emissive="#1d4ed8" emissiveIntensity={0.6} />
          </mesh>
          <mesh position={[0, 0, 0.4]}>
            <sphereGeometry args={[0.15, 16, 16]} />
            <meshStandardMaterial color="#f472b6" />
          </mesh>
        </group>

        <Grid infiniteGrid fadeDistance={15} fadeStrength={5} cellSize={0.5} sectionSize={2} cellColor="#1e293b" sectionColor="#334155" position={[0, 0, 0]} />
        <OrbitControls enablePan={false} makeDefault minDistance={4} maxDistance={12} />
      </Canvas>

      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 px-6 py-2 bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-full flex items-center gap-4 text-[11px] font-black uppercase tracking-widest">
        <span className={params.azimuth > 150 && params.azimuth < 210 ? "text-pink-400" : "text-cyan-400"}>
          {params.azimuth > 150 && params.azimuth < 210 ? "Rear View" : "Front View"}
        </span>
        <span className="w-px h-3 bg-white/20"></span>
        <span className="text-indigo-400">Eye Level</span>
        <span className="w-px h-3 bg-white/20"></span>
        <span className="text-orange-400">{params.distance > 1.1 ? "Wide" : "Close"}</span>
      </div>
    </div>
  );
};

export default CameraControl3D;
