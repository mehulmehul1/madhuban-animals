import React, { useRef, useMemo, useEffect, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { QuadrupedSkeleton } from '../../services/Skeleton';
import { MuscleGenerator } from '../../systems/muscle/MuscleGenerator';
import { ForceDeformer } from '../../systems/physics/ForceDeformer';
import { HORSE_MUSCLE_GROUPS } from '../../configs/HorseMuscles';

import { fragmentShader, vertexShader, sdfCommon, sdfMain } from './HorseSDFShader';

interface SDFLayerProps {
    skeleton: QuadrupedSkeleton;
    enabled: boolean;
    blendEnabled: boolean;
    useMuscles?: boolean;
    quality?: 'low' | 'medium' | 'high';
}

const SDFLayer: React.FC<SDFLayerProps> = ({
    skeleton,
    enabled,
    blendEnabled,
    useMuscles = false,
    quality = 'high'
}) => {
    const meshRef = useRef<THREE.Mesh>(null);
    const { camera } = useThree();

    // Muscle system refs
    const muscleGeneratorRef = useRef<MuscleGenerator>();
    const forceDeformerRef = useRef<ForceDeformer>();
    const [currentQuality, setCurrentQuality] = useState(quality);
    const [shaderKey, setShaderKey] = useState(0); // Force shader regeneration

    // Performance monitoring
    const frameCountRef = useRef(0);
    const lastTimeRef = useRef(performance.now());

    console.log("SDFLayer Render. Enabled:", enabled, "UseMuscles:", useMuscles, "Skeleton:", !!skeleton, "ShaderKey:", shaderKey);

    // LAZY INIT - use useEffect to avoid setting state during render
    useEffect(() => {
        if (useMuscles && !muscleGeneratorRef.current) {
            console.log("Lazy initializing MuscleGenerator...");
            try {
                console.log("Muscle Groups:", HORSE_MUSCLE_GROUPS?.length);
                muscleGeneratorRef.current = new MuscleGenerator(HORSE_MUSCLE_GROUPS);
                forceDeformerRef.current = new ForceDeformer(HORSE_MUSCLE_GROUPS);
                // Force shader regeneration after init
                setShaderKey(prev => prev + 1);
            } catch (e) {
                console.error("CRITICAL: Failed to init MuscleGenerator", e);
            }
        } else if (!useMuscles && muscleGeneratorRef.current) {
            // Cleanup when disabled - ensures fresh init on re-enable
            console.log("Clearing muscle generator refs");
            muscleGeneratorRef.current = undefined;
            forceDeformerRef.current = undefined;
        }
    }, [useMuscles]);

    // Dynamic shader generation
    const currentFragmentShader = useMemo(() => {
        console.log("useMemo running - useMuscles:", useMuscles, "hasGenerator:", !!muscleGeneratorRef.current, "shaderKey:", shaderKey);

        if (useMuscles && skeleton && muscleGeneratorRef.current) {
            console.log("Generating Muscle Shader Code...");
            const muscleSDF = muscleGeneratorRef.current.generateGLSL(skeleton);
            const fullShader = sdfCommon + muscleSDF + sdfMain;
            console.log("Generated shader length:", fullShader.length);
            console.log("First 500 chars of map():", fullShader.substring(fullShader.indexOf("float map"), fullShader.indexOf("float map") + 500));
            return fullShader;
        }
        console.log("Using legacy fallback shader");
        return fragmentShader; // Legacy fallback
    }, [useMuscles, skeleton, shaderKey]);

    // Initialize uniforms
    const uniforms = useMemo(() => ({
        uTime: { value: 0 },
        uCameraPos: { value: new THREE.Vector3() },
        uInvProjectionMatrix: { value: new THREE.Matrix4() },
        uInvViewMatrix: { value: new THREE.Matrix4() },
        uBlendEnabled: { value: blendEnabled },

        // Bone uniforms (legacy)
        uBoneStart: { value: new Float32Array(24 * 3) },
        uBoneEnd: { value: new Float32Array(24 * 3) },
        uBoneThick: { value: new Float32Array(24) },

        // Muscle uniforms
        uUseMuscles: { value: useMuscles },
        uQuality: { value: currentQuality === 'high' ? 1.0 : currentQuality === 'medium' ? 0.5 : 0.25 },

        // Muscle system arrays
        uBonePositions: { value: new Float32Array(50 * 3) },
        uMuscleParams: { value: new Float32Array(50 * 4) },
        uMuscleDeforms: { value: new Float32Array(50 * 4) }
    }), [blendEnabled, useMuscles, currentQuality]);

    // Initialize muscle params once
    useEffect(() => {
        if (useMuscles && meshRef.current && forceDeformerRef.current) {
            // Pre-calculate initial state
            const { params } = forceDeformerRef.current.getUniformArrays(HORSE_MUSCLE_GROUPS);
            const mat = meshRef.current.material as THREE.ShaderMaterial;
            mat.uniforms.uMuscleParams.value.set(params);
        }
    }, [useMuscles]);

    const updatePerformance = (mat: THREE.ShaderMaterial) => {
        frameCountRef.current++;
        const now = performance.now();

        if (now - lastTimeRef.current >= 1000) {
            const fps = frameCountRef.current;
            frameCountRef.current = 0;
            lastTimeRef.current = now;

            if (fps < 30 && currentQuality !== 'low') {
                setCurrentQuality('low');
                mat.uniforms.uQuality.value = 0.25;
                console.warn(`Dropping quality to low, FPS: ${fps}`);
            } else if (fps > 50 && quality === 'high' && currentQuality !== 'high') {
                setCurrentQuality('high');
                mat.uniforms.uQuality.value = 1.0;
                console.log(`Increasing quality to high, FPS: ${fps}`);
            }
        }
    };

    const updateMuscleSystem = (mat: THREE.ShaderMaterial, skeleton: QuadrupedSkeleton, delta: number) => {
        if (!muscleGeneratorRef.current || !forceDeformerRef.current) return;

        const generator = muscleGeneratorRef.current;
        const deformer = forceDeformerRef.current;

        try {
            const locomotion = (skeleton as any).locomotion || {
                speed: 0,
                gait: 'Walk',
                turn: 0
            };

            // 1. Update Physics
            deformer.update(skeleton, locomotion, delta);

            // 2. Get Data
            const { params, deforms } = deformer.getUniformArrays(HORSE_MUSCLE_GROUPS);

            // 3. Update Uniforms
            mat.uniforms.uMuscleParams.value.set(params);
            mat.uniforms.uMuscleDeforms.value.set(deforms);
            mat.uniforms.uUseMuscles.value = true;

            // 4. Update Bones for Shader
            // CRITICAL: Update world matrices before extracting bone positions
            skeleton.group.updateMatrixWorld(true);
            generator.updateUniforms(skeleton, mat.uniforms);

            // 5. Debug Log - Enhanced
            if (Math.random() < 0.05) {
                const bonePos = mat.uniforms.uBonePositions.value;
                console.log("=== MUSCLE SYSTEM DEBUG ===");
                console.log("Skeleton Group Pos:", skeleton.group.position.x, skeleton.group.position.y, skeleton.group.position.z);
                console.log("Bone[0]:", bonePos[0], bonePos[1], bonePos[2]);
                console.log("Bone[5]:", bonePos[15], bonePos[16], bonePos[17]);
            }

        } catch (e) {
            console.error("Muscle System Update Failed:", e);
        }
    };

    const updateBoneSystem = (mat: THREE.ShaderMaterial, skeleton: QuadrupedSkeleton) => {
        try {
            mat.uniforms.uUseMuscles.value = false;

            let boneIndex = 0;
            const startBuffer = mat.uniforms.uBoneStart.value;
            const endBuffer = mat.uniforms.uBoneEnd.value;
            const thickBuffer = mat.uniforms.uBoneThick.value;

            const processChain = (chain: any, thickness: number) => {
                if (!chain || !chain.bones) return;
                chain.bones.forEach((bone: any) => {
                    if (boneIndex >= 24) return;
                    const start = new THREE.Vector3();
                    bone.pivot.getWorldPosition(start);
                    const end = new THREE.Vector3(bone.length, 0, 0);
                    bone.pivot.localToWorld(end);

                    startBuffer[boneIndex * 3] = start.x;
                    startBuffer[boneIndex * 3 + 1] = start.y;
                    startBuffer[boneIndex * 3 + 2] = start.z;

                    endBuffer[boneIndex * 3] = end.x;
                    endBuffer[boneIndex * 3 + 1] = end.y;
                    endBuffer[boneIndex * 3 + 2] = end.z;

                    thickBuffer[boneIndex] = thickness;
                    boneIndex++;
                });
            };

            // Process Chains
            if (skeleton.spine) processChain(skeleton.spine, 0.008);
            processChain(skeleton.neck, 0.01);
            processChain(skeleton.flLeg, 0.008);
            processChain(skeleton.frLeg, 0.008);
            processChain(skeleton.hlLeg, 0.01);
            processChain(skeleton.hrLeg, 0.01);

            for (let i = boneIndex; i < 24; i++) {
                thickBuffer[i] = 0.0;
            }

        } catch (e) {
            console.error("Bone Update Failed:", e);
        }
    };

    useFrame((state, delta) => {
        if (!meshRef.current || !enabled) return;
        const mat = meshRef.current.material as THREE.ShaderMaterial;

        // Common
        mat.uniforms.uTime.value = state.clock.elapsedTime;
        mat.uniforms.uCameraPos.value.copy(state.camera.position);
        mat.uniforms.uInvProjectionMatrix.value.copy(state.camera.projectionMatrixInverse);
        mat.uniforms.uInvViewMatrix.value.copy(state.camera.matrixWorld);
        mat.uniforms.uBlendEnabled.value = blendEnabled;

        // Force uniform to match prop
        mat.uniforms.uUseMuscles.value = useMuscles;

        // Perf
        updatePerformance(mat);

        // System Update
        if (useMuscles) {
            if (!muscleGeneratorRef.current) console.warn("Missing Muscle Generator Ref during frame!");
            if (muscleGeneratorRef.current) {
                updateMuscleSystem(mat, skeleton, delta);
            }
        } else {
            updateBoneSystem(mat, skeleton);
        }
    });

    if (!enabled) return null;

    return (
        <mesh ref={meshRef} position={[0, 0, 0]} frustumCulled={false}>
            <planeGeometry args={[2, 2]} />
            <shaderMaterial
                key={`${currentFragmentShader.length}-${useMuscles}`}
                vertexShader={vertexShader}
                fragmentShader={currentFragmentShader}
                uniforms={uniforms}
                transparent={true}
                depthWrite={false}
            />
        </mesh>
    );
};

export default SDFLayer;