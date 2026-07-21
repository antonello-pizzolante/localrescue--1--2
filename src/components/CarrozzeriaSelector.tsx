import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import React, { useState, useRef, useEffect } from 'react';
import { Plus, Trash2, AlertTriangle, Camera, Image as ImageIcon } from 'lucide-react';
import { DamageMarker } from '../types';

interface CarrozzeriaSelectorProps {
  markers: DamageMarker[];
  onChange: (markers: DamageMarker[]) => void;
}

export default function CarrozzeriaSelector({ markers, onChange }: CarrozzeriaSelectorProps) {
  const [selectedType, setSelectedType] = useState<'O' | 'X'>('O');
  const [description, setDescription] = useState('');
  const [selectedPart, setSelectedPart] = useState('Fianco Destro');
  const [vehicleType, setVehicleType] = useState<'automedica' | 'ambulanza'>('automedica');
  
  
  
  

    
  const currentBgImage = vehicleType === "automedica" ? "/automedica.png" : "/ambulanza.png";
  
  const fileInputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});

  


  const parts = [
    'Frontale (Anteriore)',
    'Posteriore (Retro)',
    'Fianco Destro',
    'Fianco Sinistro',
    'Tetto / Superiore'
  ];

  
  

  
const resizeImage = (dataUrl: string, maxDim: number = 800): Promise<string> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      let w = img.width;
      let h = img.height;
      if (w > maxDim || h > maxDim) {
        if (w > h) {
          h = (h / w) * maxDim;
          w = maxDim;
        } else {
          w = (w / h) * maxDim;
          h = maxDim;
        }
      }
      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL('image/jpeg', 0.8));
      } else {
        resolve(dataUrl);
      }
    };
    img.src = dataUrl;
  });
};

  

  const handleCanvasClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.round(((e.clientX - rect.left) / rect.width) * 100);
    const y = Math.round(((e.clientY - rect.top) / rect.height) * 100);

    const newMarker: DamageMarker = {
      id: `m_${Date.now()}`,
      type: selectedType,
      x,
      y,
      part: selectedPart,
      description: description.trim() || `${selectedType === 'O' ? 'Ammaccatura' : 'Graffio'} su ${selectedPart}`
    };

    onChange([...markers, newMarker]);
    setDescription(''); // reset description
  };

  const removeMarker = (id: string) => {
    onChange(markers.filter(m => m.id !== id));
  };
  
  const handlePhotoUpload = (id: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      const updatedMarkers = markers.map(m => m.id === id ? { ...m, photoDataUrl: dataUrl } : m);
      onChange(updatedMarkers);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="glass-card p-5 rounded-xl border border-white/10 shadow-lg flex flex-col gap-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 pb-2 border-b border-white/10">
        <div>
          <h3 className="font-bold text-white text-sm md:text-base flex items-center gap-1.5 font-display">
            <AlertTriangle className="w-5 h-5 text-amber-400" />
            Rilievo Stato Carrozzeria
          </h3>
          <p className="text-xs text-slate-400">
            Seleziona la tipologia di danno, clicca sul diagramma per posizionarlo e aggiungi una descrizione.
          </p>
        </div>
        <div className="flex items-center gap-3 bg-white/5 p-1.5 rounded-lg border border-white/10">
          <button
            type="button"
            onClick={() => setSelectedType('O')}
            className={`px-3 py-1 text-xs font-bold rounded transition-all cursor-pointer flex items-center gap-1.5 ${
              selectedType === 'O'
                ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <span className="w-4 h-4 rounded-full border-2 border-red-500 flex items-center justify-center text-[10px]">O</span>
            O: Urto / Ammaccatura
          </button>
          <button
            type="button"
            onClick={() => setSelectedType('X')}
            className={`px-3 py-1 text-xs font-bold rounded transition-all cursor-pointer flex items-center gap-1.5 ${
              selectedType === 'X'
                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <span className="font-mono text-xs text-amber-400 font-bold">X</span>
            X: Graffio
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* SVG/Interactive Diagram - 7 Columns */}
        <div className="lg:col-span-7 flex flex-col items-center">
          
          <div className="flex bg-slate-900/50 p-1 rounded-lg border border-white/10 mb-2 max-w-md w-full">
            <button 
              onClick={() => setVehicleType('automedica')}
              className={`flex-1 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded transition ${vehicleType === 'automedica' ? 'bg-cyan-600/30 text-cyan-400 shadow-sm' : 'text-slate-400 hover:text-white'}`}
            >
              Automedica
            </button>
            <button 
              onClick={() => setVehicleType('ambulanza')}
              className={`flex-1 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded transition ${vehicleType === 'ambulanza' ? 'bg-cyan-600/30 text-cyan-400 shadow-sm' : 'text-slate-400 hover:text-white'}`}
            >
              Ambulanza
            </button>
          </div>
          <div className="mb-2 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
            Diagramma Interattivo Mezzo (Tocca per posizionare il danno)
          </div>

          <div
            onClick={handleCanvasClick}
            className="relative w-full max-w-md aspect-[4/3] bg-black/25 rounded-xl border border-white/10 cursor-crosshair overflow-hidden flex items-center justify-center p-4 shadow-inner"
          >
            {/* SVG Outlines of Vehicle Sections */}
            
            {/* Single Diagram Background */}
            <div className="absolute inset-0 flex items-center justify-center overflow-hidden group bg-slate-900/50">
              <img src={currentBgImage || (vehicleType === "automedica" ? "/automedica.png" : "/ambulanza.png")} alt="Diagramma" className="w-full h-full object-contain select-none pointer-events-none opacity-80" />
              
            </div>


            {/* Placed Markers */}
            {markers.map((marker) => (
              <div
                key={marker.id}
                style={{ left: `${marker.x}%`, top: `${marker.y}%` }}
                className="absolute transform -translate-x-1/2 -translate-y-1/2 select-none group"
                onClick={(e) => {
                  e.stopPropagation(); // Prevent duplicate clicks
                }}
              >
                <div className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs shadow-md border border-white/20 transition transform hover:scale-110 cursor-pointer ${
                  marker.type === 'O' ? 'bg-red-600 text-white animate-pulse' : 'bg-amber-500 text-white'
                }`}>
                  {marker.type}
                </div>
                {/* Micro tooltip */}
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 bg-slate-900 text-white text-[10px] p-1 px-1.5 rounded opacity-0 group-hover:opacity-100 pointer-events-none transition whitespace-nowrap z-30 mb-1">
                  {marker.description}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Input Parameters & Table - 5 Columns */}
        <div className="lg:col-span-5 flex flex-col gap-3">
          <div className="bg-white/5 p-3.5 rounded-lg border border-white/10">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-2 font-display">Configurazione Danno Corrente</h4>
            <div className="flex flex-col gap-2.5">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Zona di Rilievo</label>
                <select
                  value={selectedPart}
                  onChange={(e) => setSelectedPart(e.target.value)}
                  className="w-full text-xs p-2 bg-black/20 text-white border border-white/10 rounded focus:border-cyan-500/50 outline-none cursor-pointer"
                >
                  {parts.map(p => (
                    <option key={p} className="bg-slate-950 text-white" value={p}>{p}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Descrizione Dettaglio Danno (Opzionale)</label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Es: Graffio profondo sportello"
                  className="w-full text-xs p-2 bg-black/20 text-white border border-white/10 rounded focus:border-cyan-500/50 outline-none placeholder-slate-500"
                />
              </div>
            </div>
          </div>

          <div className="flex flex-col flex-1 max-h-[175px] overflow-y-auto">
            <h4 className="text-xs font-bold text-slate-300 mb-1.5 px-1 flex justify-between">
              <span>Elenco Danni Rilevati ({markers.length})</span>
              {markers.length > 0 && <span className="text-[10px] text-red-400 uppercase font-semibold">Seleziona per eliminare</span>}
            </h4>

            {markers.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center p-4 border border-dashed border-white/10 rounded text-slate-400 text-xs text-center bg-black/10">
                <span>Nessun danno o graffio registrato.</span>
                <span className="text-[10px] text-slate-500">Il mezzo non presenta imperfezioni esterne.</span>
              </div>
            ) : (
              <div className="flex flex-col gap-1">
                {markers.map((m) => (
                  <div
                    key={m.id}
                    className="flex flex-col gap-1 p-2 rounded border border-white/5 bg-white/5 hover:bg-red-500/10 hover:border-red-500/30 transition-all group text-xs text-slate-200"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 overflow-hidden">
                        <span className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] shrink-0 ${
                          m.type === 'O' ? 'bg-red-500/20 text-red-400' : 'bg-amber-500/20 text-amber-400'
                        }`}>
                          {m.type}
                        </span>
                        <div className="flex flex-col truncate">
                          <span className="font-semibold text-white truncate">{m.description}</span>
                          <span className="text-[9px] text-slate-400">{m.part} (Coord: {m.x}%, {m.y}%)</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        {/* Hidden file input for this marker */}
                        <input 
                          type="file" 
                          accept="image/*" 
                          capture="environment"
                          className="hidden" 
                          ref={(el) => fileInputRefs.current[m.id] = el}
                          onChange={(e) => handlePhotoUpload(m.id, e)}
                        />
                        <button
                          type="button"
                          onClick={() => fileInputRefs.current[m.id]?.click()}
                          className={`p-1.5 rounded transition-all cursor-pointer ${
                            m.photoDataUrl 
                              ? 'text-cyan-400 bg-cyan-500/20 hover:bg-cyan-500/30' 
                              : 'text-slate-400 hover:text-cyan-400 hover:bg-white/5 opacity-100 md:opacity-0 group-hover:opacity-100'
                          }`}
                          title="Allega Foto"
                        >
                          {m.photoDataUrl ? <ImageIcon className="w-3.5 h-3.5" /> : <Camera className="w-3.5 h-3.5" />}
                        </button>
                        <button
                          type="button"
                          onClick={() => removeMarker(m.id)}
                          className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-white/5 rounded transition-all opacity-100 md:opacity-0 group-hover:opacity-100 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                    {/* Optional Photo Thumbnail preview */}
                    {m.photoDataUrl && (
                      <div className="mt-1 relative w-16 h-16 rounded overflow-hidden border border-white/10 shrink-0">
                        <img src={m.photoDataUrl} alt="Danno" className="w-full h-full object-cover" />
                        <button 
                          onClick={() => onChange(markers.map(mk => mk.id === m.id ? { ...mk, photoDataUrl: undefined } : mk))}
                          className="absolute top-0 right-0 bg-black/60 p-0.5 text-red-400 hover:text-red-300"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
