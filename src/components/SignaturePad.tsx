import React, { useRef, useState, useEffect } from 'react';
import { Check, RotateCcw, PenTool } from 'lucide-react';

interface SignaturePadProps {
  onSave: (signatureDataUrl: string) => void;
  onClear?: () => void;
  placeholderText?: string;
}

export default function SignaturePad({ onSave, onClear, placeholderText = "Disegna qui la tua firma..." }: SignaturePadProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawings, setHasDrawings] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Adjust canvas resolution for high-DPI displays
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * 2;
    canvas.height = rect.height * 2;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.scale(2, 2);
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.strokeStyle = '#1e293b'; // Slate 800
      ctx.lineWidth = 2.5;
    }
  }, []);

  const getCoordinates = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    
    // Check if it's a touch event
    if ('touches' in e) {
      if (e.touches.length === 0) return { x: 0, y: 0 };
      const touch = e.touches[0];
      return {
        x: touch.clientX - rect.left,
        y: touch.clientY - rect.top
      };
    } else {
      return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      };
    }
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { x, y } = getCoordinates(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
    setHasDrawings(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    e.preventDefault();

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { x, y } = getCoordinates(e);
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (isDrawing) {
      setIsDrawing(false);
    }
  };

  const handleClear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasDrawings(false);
    if (onClear) onClear();
  };

  const handleSave = () => {
    const canvas = canvasRef.current;
    if (!canvas || !hasDrawings) return;

    // Export with high-quality PNG representation
    const dataUrl = canvas.toDataURL('image/png');
    onSave(dataUrl);
  };

  return (
    <div className="flex flex-col bg-black/20 p-3 rounded-xl border border-white/10 shadow-inner">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5 font-display">
          <PenTool className="w-3.5 h-3.5 text-cyan-400" />
          Firma Digitale in Loco
        </span>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleClear}
            className="p-1 px-2.5 text-xs text-slate-300 bg-white/5 hover:bg-white/10 rounded-lg border border-white/10 flex items-center gap-1 transition-all cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" />
            Cancella
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={!hasDrawings}
            className={`p-1 px-2.5 text-xs rounded-lg flex items-center gap-1 transition-all ${
              hasDrawings
                ? 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-sm cursor-pointer'
                : 'bg-white/5 text-slate-500 cursor-not-allowed border border-white/5'
            }`}
          >
            <Check className="w-3 h-3" />
            Conferma Firma
          </button>
        </div>
      </div>

      <div className="relative h-28 bg-slate-50 border border-white/20 rounded-lg overflow-hidden cursor-crosshair">
        {!hasDrawings && (
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center text-xs text-slate-500 italic">
            {placeholderText}
          </div>
        )}
        <canvas
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
          className="w-full h-full block touch-none"
        />
      </div>
      <p className="text-[10px] text-slate-400 mt-1.5 leading-tight italic">
        *La firma apposta costituisce validazione digitale immediata ai fini della tracciabilità di servizio.
      </p>
    </div>
  );
}
