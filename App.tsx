
import React, { useState } from 'react';
import { CameraParams, AppStatus } from './types';
import { DEFAULT_CAMERA_PARAMS, Icons } from './constants.tsx';
import { generateImagePerspectives } from './services/geminiService';
import CameraControl3D from './components/CameraControl3D';

const App: React.FC = () => {
  const [referenceImage, setReferenceImage] = useState<string | null>(null);
  const [outputImage, setOutputImage] = useState<string | null>(null);
  const [cameraParams, setCameraParams] = useState<CameraParams>(DEFAULT_CAMERA_PARAMS);
  const [status, setStatus] = useState<AppStatus>('idle');
  const [originalRatio, setOriginalRatio] = useState<number>(1);
  const [copyFeedback, setCopyFeedback] = useState(false);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setStatus('uploading');
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        const img = new Image();
        img.onload = () => {
          setOriginalRatio(img.width / img.height);
          setReferenceImage(base64);
          setStatus('idle');
        };
        img.src = base64;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerate = async () => {
    if (!referenceImage) return;
    try {
      setStatus('generating');
      const resultUrl = await generateImagePerspectives(referenceImage, cameraParams);
      setOutputImage(resultUrl);
      setStatus('idle');
    } catch (err) {
      console.error(err);
      setStatus('error');
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopyFeedback(true);
    setTimeout(() => setCopyFeedback(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 font-sans selection:bg-indigo-500/30">
      <div className="max-w-[1400px] mx-auto p-4 md:p-8 space-y-8">
        
        {/* Header Section */}
        <header className="flex flex-col md:flex-row items-center justify-between bg-slate-900/40 p-6 rounded-3xl border border-white/5 backdrop-blur-md">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-indigo-500/20 shadow-2xl rotate-3">
              <Icons.Camera />
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tight text-white uppercase italic">Gemini Lens 3D</h1>
              <div className="flex items-center gap-2">
                 <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                 <p className="text-[10px] text-slate-500 font-bold tracking-[0.3em] uppercase">Cloud Sync Active</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-4 mt-4 md:mt-0">
            <button 
              onClick={handleShare}
              className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest transition-all rounded-xl border border-white/5 ${copyFeedback ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-400 hover:text-white'}`}
            >
              {copyFeedback ? 'Link Copied!' : 'Share Tool'}
            </button>
            <button 
              onClick={() => setCameraParams(DEFAULT_CAMERA_PARAMS)}
              className="px-6 py-2 bg-slate-800 hover:bg-slate-700 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all hover:scale-105"
            >
              Reset View
            </button>
          </div>
        </header>

        {/* Main Interface */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 bg-slate-900/20 border border-white/5 rounded-[3rem] overflow-hidden shadow-2xl min-h-[500px] lg:min-h-[700px] relative">
            <CameraControl3D 
              params={cameraParams} 
              setParams={setCameraParams} 
              referenceImage={referenceImage} 
              imageRatio={originalRatio}
            />
          </div>

          <div className="lg:col-span-4 flex flex-col gap-6">
            <div className="bg-slate-950 p-10 rounded-[3rem] border border-white/5 flex-1 flex flex-col justify-center space-y-10 shadow-2xl">
              <div className="space-y-8">
                {/* Azimuth */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Azimuth (Rotate)</span>
                    <span className="text-xs font-mono text-cyan-400 font-bold bg-cyan-400/10 px-3 py-1 rounded-full">{cameraParams.azimuth}°</span>
                  </div>
                  <input 
                    type="range" min="0" max="360" 
                    value={cameraParams.azimuth} 
                    onChange={(e) => setCameraParams({...cameraParams, azimuth: parseInt(e.target.value)})}
                    className="w-full h-1.5 bg-slate-800 rounded-full appearance-none cursor-pointer accent-cyan-400" 
                  />
                </div>

                {/* Elevation */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Elevation (Angle)</span>
                    <span className="text-xs font-mono text-pink-400 font-bold bg-pink-400/10 px-3 py-1 rounded-full">{cameraParams.elevation}°</span>
                  </div>
                  <input 
                    type="range" min="-30" max="60" 
                    value={cameraParams.elevation} 
                    onChange={(e) => setCameraParams({...cameraParams, elevation: parseInt(e.target.value)})}
                    className="w-full h-1.5 bg-slate-800 rounded-full appearance-none cursor-pointer accent-pink-400" 
                  />
                </div>

                {/* Zoom */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Zoom (Distance)</span>
                    <span className="text-xs font-mono text-orange-400 font-bold bg-orange-400/10 px-3 py-1 rounded-full">{cameraParams.distance.toFixed(2)}x</span>
                  </div>
                  <input 
                    type="range" min="0.6" max="1.4" step="0.01"
                    value={cameraParams.distance} 
                    onChange={(e) => setCameraParams({...cameraParams, distance: parseFloat(e.target.value)})}
                    className="w-full h-1.5 bg-slate-800 rounded-full appearance-none cursor-pointer accent-orange-400" 
                  />
                </div>
              </div>

              <button 
                onClick={handleGenerate}
                disabled={status === 'generating' || !referenceImage}
                className={`w-full py-6 rounded-2xl font-black text-xs uppercase tracking-[0.25em] transition-all transform active:scale-95 flex items-center justify-center gap-3 ${
                  status === 'generating' || !referenceImage
                  ? 'bg-slate-800 text-slate-600 cursor-not-allowed border border-white/5'
                  : 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-indigo-600/30 shadow-2xl hover:brightness-110 active:brightness-90'
                }`}
              >
                {status === 'generating' ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Rendering Scene...
                  </>
                ) : 'Generate Perspective'}
              </button>
            </div>

            {/* Upload Area */}
            <div className="bg-slate-900/40 p-8 rounded-[3rem] border border-white/5 flex flex-col items-center justify-center min-h-[250px] relative group overflow-hidden">
               {!referenceImage ? (
                <label className="flex flex-col items-center gap-4 cursor-pointer text-center">
                  <div className="w-16 h-16 bg-slate-800 rounded-3xl flex items-center justify-center border border-white/5 group-hover:border-indigo-500/50 transition-all group-hover:bg-slate-800/80 group-hover:scale-110 duration-500">
                    <Icons.Upload />
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Upload Portrait</p>
                    <p className="text-[8px] font-bold text-slate-600 uppercase tracking-tight">JPG/PNG up to 10MB</p>
                  </div>
                  <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                </label>
              ) : (
                <div className="relative w-full h-full flex items-center justify-center group/img">
                   <img src={referenceImage} className="max-h-[180px] rounded-2xl shadow-2xl object-contain transition-transform group-hover/img:scale-105 duration-500" />
                   <label className="absolute inset-0 bg-black/60 opacity-0 group-hover/img:opacity-100 transition-opacity rounded-2xl flex items-center justify-center cursor-pointer backdrop-blur-sm">
                      <div className="flex flex-col items-center gap-2">
                        <Icons.Refresh />
                        <span className="text-[8px] font-black uppercase tracking-[0.2em] text-white">Change Image</span>
                      </div>
                      <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                   </label>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Output Section */}
        {outputImage && (
          <section className="animate-in fade-in slide-in-from-bottom-12 duration-1000">
             <div className="bg-slate-900/40 border border-white/5 rounded-[3rem] p-6 md:p-12 flex flex-col items-center gap-8 shadow-2xl relative">
                <div className="flex justify-between w-full px-4">
                  <div className="flex items-center gap-3">
                    <span className="w-2 h-2 rounded-full bg-indigo-500 animate-ping"></span>
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic">Render Complete</span>
                  </div>
                  <a 
                    href={outputImage} 
                    download={`perspective-${cameraParams.azimuth}.png`}
                    className="flex items-center gap-2 text-[10px] font-black text-indigo-400 hover:text-indigo-300 uppercase tracking-widest bg-indigo-400/10 px-4 py-2 rounded-full transition-colors"
                  >
                    <span>Save to Disk</span>
                  </a>
                </div>
                <div className="relative group">
                  <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-[2.5rem] blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
                  <img src={outputImage} className="relative max-w-full rounded-[2.2rem] shadow-2xl border border-white/10" />
                </div>
             </div>
          </section>
        )}
      </div>
      
      {/* Toast Error */}
      {status === 'error' && (
        <div className="fixed bottom-8 right-8 bg-red-500/90 backdrop-blur-md text-white px-8 py-5 rounded-3xl font-black text-[10px] uppercase tracking-[0.2em] shadow-2xl animate-in slide-in-from-right-full">
           <div className="flex items-center gap-3">
             <div className="w-6 h-6 border-2 border-white/40 rounded-full flex items-center justify-center">!</div>
             <span>Generation Failed: Check API Credits</span>
           </div>
        </div>
      )}
    </div>
  );
};

export default App;
