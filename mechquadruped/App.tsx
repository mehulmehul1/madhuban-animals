import React from 'react';
import Scene from './components/Scene';
import { Info, MousePointer2, Box, Keyboard } from 'lucide-react';

const App: React.FC = () => {
  console.log("DEBUG: Current App.tsx loaded from mechquadruped");
  return (
    <div className="relative w-full h-screen bg-[#101010] overflow-hidden font-sans">
      {/* 3D Canvas */}
      <div className="absolute inset-0 z-0">
        <Scene />
      </div>

      {/* UI Overlay */}
      <div className="absolute top-0 left-0 w-full p-6 z-10 pointer-events-none">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white drop-shadow-md">
              Mechanical Erect Quadruped
            </h1>
            <p className="text-white/60 text-sm mt-1 max-w-md drop-shadow-sm">
              Stage 2: Robust FABRIK IK Solver & Locomotion Engine
            </p>
          </div>
        </div>
      </div>

      {/* Controls / Legend */}
      <div className="absolute bottom-6 left-6 z-10 pointer-events-none">
        <div className="bg-black/40 backdrop-blur-md border border-white/10 p-4 rounded-xl text-xs text-white/80 space-y-2 shadow-xl">
          <div className="flex items-center gap-2 mb-3 border-b border-white/10 pb-2">
            <Keyboard className="w-4 h-4 text-yellow-400" />
            <span className="font-bold">WASD to Move</span>
          </div>
          <div className="flex items-center gap-2">
            <MousePointer2 className="w-4 h-4 text-blue-400" />
            <span>Left Click + Drag to Rotate</span>
          </div>
          <div className="flex items-center gap-2">
            <MousePointer2 className="w-4 h-4 text-green-400" />
            <span>Right Click + Drag to Pan</span>
          </div>
          <div className="flex items-center gap-2">
            <Box className="w-4 h-4 text-orange-400" />
            <span>Scroll to Zoom</span>
          </div>
        </div>
      </div>

      <div className="absolute top-6 right-6 z-10">
        <div className="flex flex-col gap-2">
          <div className="bg-black/40 backdrop-blur-md border border-white/10 px-4 py-2 rounded-lg text-white/90 text-sm font-medium flex items-center gap-2 shadow-lg">
            <Info className="w-4 h-4" />
            <span>v1.1.0 IK Update</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;