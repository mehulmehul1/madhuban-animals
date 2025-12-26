import React, { useEffect, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Environment, Grid } from '@react-three/drei';
import * as THREE from 'three';
import { QuadrupedSkeleton } from '../services/Skeleton';
import { Locomotion } from '../services/Locomotion';
import { HORSE_CONFIG, LIZARD_CONFIG, OSTRICH_CONFIG, CreatureConfig, GaitType } from '../services/CreatureConfig';
import { MorphRig } from '../morph/MorphRig';
import SDFLayer from './sdf/SDFLayer';

// --- 3D CONTENT COMPONENT ---
interface SceneContentProps {
  currentConfig: CreatureConfig;
  morphMode: boolean;
  gait: GaitType;
  isTreadmill: boolean;
  ikEnabled: boolean;
  showMuscle: boolean;
  blendEnabled: boolean;
  useAnatomicalMuscles: boolean;
  muscleQuality: 'low' | 'medium' | 'high';
  setMorphRig: (rig: MorphRig | null) => void;
}

const SceneContent: React.FC<SceneContentProps> = ({
  currentConfig, morphMode, gait, isTreadmill, ikEnabled, showMuscle, blendEnabled, useAnatomicalMuscles, muscleQuality, setMorphRig
}) => {
  const { scene } = useThree();
  const skeletonRef = useRef<QuadrupedSkeleton | null>(null);
  const locomotionRef = useRef<Locomotion | null>(null);
  const keys = useRef({ w: false, a: false, s: false, d: false });

  // Input Handling
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      if (k in keys.current) keys.current[k as keyof typeof keys.current] = true;
    };
    const onKeyUp = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      if (k in keys.current) keys.current[k as keyof typeof keys.current] = false;
    };
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, []);

  // Initialization & Config Switching
  useEffect(() => {
    // Cleanup previous
    if (skeletonRef.current) {
      scene.remove(skeletonRef.current.group);
      setMorphRig(null);
    }

    // Init new
    const config = morphMode ? LIZARD_CONFIG : currentConfig;
    const skel = new QuadrupedSkeleton(scene, config);
    const loco = new Locomotion(skel);

    if (morphMode) {
      const rig = new MorphRig(skel, loco);
      rig.setTarget(0);
      rig['applyMorph'](0); // Private method access for init
      setMorphRig(rig);
    }

    // Apply settings
    loco.setGait(gait);
    loco.treadmillMode = isTreadmill;
    loco.enabled = ikEnabled;

    skeletonRef.current = skel;
    locomotionRef.current = loco;

    return () => {
      scene.remove(skel.group);
    };
  }, [currentConfig, morphMode, scene]); // Re-init on config/mode change

  // Live Updates (Settings)
  useEffect(() => {
    if (locomotionRef.current) {
      locomotionRef.current.setGait(gait);
      locomotionRef.current.treadmillMode = isTreadmill;
      locomotionRef.current.enabled = ikEnabled;

      if (!ikEnabled && skeletonRef.current) {
        locomotionRef.current.reset();
        skeletonRef.current.reset();
      }
    }
  }, [gait, isTreadmill, ikEnabled]);

  // Frame Loop
  useFrame((state, dt) => {
    const loco = locomotionRef.current;
    if (loco && loco.enabled) {
      // Input -> Physics
      const k = keys.current;
      const targetSpeed = (k.w ? 1 : 0) - (k.s ? 0.5 : 0);
      const targetTurn = (k.a ? 1 : 0) - (k.d ? 1 : 0);

      loco.speed = THREE.MathUtils.lerp(loco.speed, targetSpeed, dt * 3.0);
      loco.turn = THREE.MathUtils.lerp(loco.turn, targetTurn, dt * 3.0);

      loco.update(dt);
    }

    // Store locomotion reference in skeleton for muscle system
    if (skeletonRef.current && locomotionRef.current) {
      (skeletonRef.current as any).locomotion = locomotionRef.current;
    }

    // Visibility
    if (skeletonRef.current) {
      // skeletonRef.current.group.visible = !showMuscle;
    }
  });

  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 20, 10]} intensity={1.5} castShadow />
      <gridHelper args={[200, 200, 0x333333, 0x1a1a1a]} />
      {/* Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
        <planeGeometry args={[500, 500]} />
        <meshStandardMaterial color="#080808" metalness={0.1} roughness={0.9} />
      </mesh>

      {/* SDF Layer */}
      {skeletonRef.current && (
        <SDFLayer
          skeleton={skeletonRef.current}
          enabled={showMuscle}
          blendEnabled={blendEnabled}
          useMuscles={useAnatomicalMuscles}
          quality={muscleQuality}
        />
      )}
    </>
  );
};

// --- MAIN COMPONENT ---
const Scene: React.FC = () => {
  // State
  const [currentConfig, setCurrentConfig] = useState<CreatureConfig>(HORSE_CONFIG);
  const [morphMode, setMorphMode] = useState(false);
  const [gait, setGait] = useState<GaitType>('Walk'); // Default to Walk
  const [isTreadmill, setIsTreadmill] = useState(false);
  const [ikEnabled, setIkEnabled] = useState(true);
  const [showMuscle, setShowMuscle] = useState(false); // Toggle for SDF
  const [blendEnabled, setBlendEnabled] = useState(true); // Toggle for Smooth Blend
  const [useAnatomicalMuscles, setUseAnatomicalMuscles] = useState(false); // Toggle for muscle system
  const [muscleQuality, setMuscleQuality] = useState<'low' | 'medium' | 'high'>('high'); // Muscle quality setting

  // Force SDF layer on when specific muscle system is enabled
  useEffect(() => {
    if (useAnatomicalMuscles && !showMuscle) {
      setShowMuscle(true);
    }
  }, [useAnatomicalMuscles]);

  // Lifted MorphRig state to control via UI
  const [morphRig, setMorphRig] = useState<MorphRig | null>(null);

  const handleMorphChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (morphRig) {
      morphRig.setTarget(parseFloat(e.target.value));
    }
  };

  return (
    <div className="w-full h-full relative font-sans">
      <Canvas shadows className="bg-[#111]">
        <PerspectiveCamera makeDefault position={[4, 2, 4]} fov={45} />
        <OrbitControls target={[0, 1, 0]} />
        <color attach="background" args={['#111']} />
        <OrbitControls target={[0, 1, 0]} />

        <SceneContent
          currentConfig={currentConfig}
          morphMode={morphMode}
          gait={gait}
          isTreadmill={isTreadmill}
          ikEnabled={ikEnabled}
          showMuscle={showMuscle}
          blendEnabled={blendEnabled}
          useAnatomicalMuscles={useAnatomicalMuscles}
          muscleQuality={muscleQuality}
          setMorphRig={setMorphRig}
        />
      </Canvas>

      {/* UI Overlay */}
      <div className="absolute top-6 left-6 z-20 bg-black/60 backdrop-blur-md border border-white/10 p-4 rounded-xl text-white shadow-xl w-72">
        <h2 className="text-sm font-bold mb-4 border-b border-white/10 pb-2">Control Deck</h2>

        <div className="space-y-4">
          {/* SDF Toggle */}
          <div className="flex flex-col gap-2 bg-orange-500/20 p-2 rounded-lg border border-orange-500/30">
            <div className="flex items-center justify-between">
              <label className="text-sm text-orange-200 font-bold flex items-center gap-2">
                <span>🧬 Muscle Layer (SDF)</span>
              </label>
              <input
                type="checkbox"
                checked={showMuscle}
                onChange={(e) => setShowMuscle(e.target.checked)}
                className="w-5 h-5 accent-orange-500 cursor-pointer"
              />
            </div>



            {/* Anatomical Muscles Toggle */}
            <div className="flex items-center justify-between ml-4 mt-2">
              <label className="text-xs text-orange-200/80">Anatomical Muscles</label>
              <input
                type="checkbox"
                checked={useAnatomicalMuscles}
                onChange={(e) => {
                  setUseAnatomicalMuscles(e.target.checked);
                  if (e.target.checked) setShowMuscle(true);
                }}
                className="w-4 h-4 accent-orange-500 cursor-pointer"
              />
            </div>

            {/* Quality Selector */}
            {useAnatomicalMuscles && (
              <div className="flex items-center justify-between ml-4 mt-2">
                <label className="text-xs text-orange-200/80">Quality</label>
                <select
                  value={muscleQuality}
                  onChange={(e) => setMuscleQuality(e.target.value as any)}
                  className="px-2 py-1 text-xs rounded bg-white/10 border border-white/20 text-white"
                >
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>
            )}
          </div>

          {/* Morph Mode */}
          <div className="flex items-center justify-between">
            <label className="text-xs text-yellow-400 font-bold">Morph Mode</label>
            <button onClick={() => setMorphMode(!morphMode)} className={`w-10 h-5 rounded-full relative transition-colors ${morphMode ? 'bg-yellow-500' : 'bg-white/20'}`}>
              <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-transform ${morphMode ? 'left-6' : 'left-1'}`} />
            </button>
          </div>

          {morphMode ? (
            <div className="flex flex-col gap-2">
              <label className="text-xs text-white/60">Horse ⟷ Lizard</label>
              <input type="range" min="0" max="1" step="0.01" defaultValue="0" onChange={handleMorphChange} className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer" />
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              <label className="text-xs text-white/60">Creature</label>
              <div className="flex gap-1 bg-white/5 rounded-lg p-1">
                {['Horse', 'Lizard', 'Ostrich'].map(name => (
                  <button
                    key={name}
                    onClick={() => {
                      if (name === 'Horse') setCurrentConfig(HORSE_CONFIG);
                      if (name === 'Lizard') setCurrentConfig(LIZARD_CONFIG);
                      if (name === 'Ostrich') setCurrentConfig(OSTRICH_CONFIG);
                    }}
                    className={`flex-1 text-[10px] py-1.5 rounded-md transition-colors ${currentConfig.name === name ? 'bg-purple-600 text-white' : 'text-white/60 hover:bg-white/10'}`}
                  >
                    {name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Settings */}
          <div className="border-t border-white/10 pt-4 flex flex-col gap-3">
            <div className="flex flex-col gap-2">
              <label className="text-xs text-white/60">Gait</label>
              <div className="flex gap-1 bg-white/5 rounded-lg p-1">
                {['Walk', 'Gallop'].map(g => (
                  <button
                    key={g}
                    onClick={() => setGait(g as GaitType)}
                    className={`flex-1 text-[10px] py-1 rounded-md ${gait === g ? 'bg-blue-600 text-white' : 'text-white/60 hover:bg-white/10'}`}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="text-xs text-white/60">Treadmill</label>
              <button onClick={() => setIsTreadmill(!isTreadmill)} className={`w-8 h-4 rounded-full relative transition-colors ${isTreadmill ? 'bg-green-500' : 'bg-white/20'}`}>
                <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-transform ${isTreadmill ? 'left-4.5' : 'left-0.5'}`} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Scene;