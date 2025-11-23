// components/InpaintingCanvas.tsx
import React, { useRef, useEffect, useState, forwardRef, useImperativeHandle } from 'react';
import { ImageFile } from '../types';

interface InpaintingCanvasProps {
  image: ImageFile;
}

export interface InpaintingCanvasRef {
  getMaskAsImageFile: () => Promise<ImageFile | null>;
  clearMask: () => void;
}

const InpaintingCanvas = forwardRef<InpaintingCanvasRef, InpaintingCanvasProps>(({ image }, ref) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const imageCanvasRef = useRef<HTMLCanvasElement>(null);
  const drawingCanvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [brushSize, setBrushSize] = useState(40);
  const lastPos = useRef<{ x: number, y: number } | null>(null);

  const resizeCanvases = () => {
    const container = containerRef.current;
    if (!container) return;

    const { width, height } = container.getBoundingClientRect();
    [imageCanvasRef, drawingCanvasRef].forEach(canvasRef => {
      if (canvasRef.current) {
        canvasRef.current.width = width;
        canvasRef.current.height = height;
      }
    });
  };

  const drawImage = () => {
    const canvas = imageCanvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx || !canvas) return;

    const img = new Image();
    img.onload = () => {
      const canvasAspectRatio = canvas.width / canvas.height;
      const imageAspectRatio = img.width / img.height;
      let drawWidth, drawHeight, offsetX, offsetY;

      if (canvasAspectRatio > imageAspectRatio) {
        drawHeight = canvas.height;
        drawWidth = drawHeight * imageAspectRatio;
        offsetX = (canvas.width - drawWidth) / 2;
        offsetY = 0;
      } else {
        drawWidth = canvas.width;
        drawHeight = drawWidth / imageAspectRatio;
        offsetX = 0;
        offsetY = (canvas.height - drawHeight) / 2;
      }
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
    };
    img.src = image.preview;
  };
  
  useEffect(() => {
    resizeCanvases();
    drawImage();

    window.addEventListener('resize', () => {
        resizeCanvases();
        drawImage();
    });

    return () => {
      window.removeEventListener('resize', () => {
        resizeCanvases();
        drawImage();
      });
    };
  }, [image]);
  
  const getCoords = (e: React.MouseEvent | React.TouchEvent) => {
      const canvas = drawingCanvasRef.current;
      if (!canvas) return null;
      const rect = canvas.getBoundingClientRect();
      let clientX, clientY;
      if ('touches' in e) {
          clientX = e.touches[0].clientX;
          clientY = e.touches[0].clientY;
      } else {
          clientX = e.clientX;
          clientY = e.clientY;
      }
      return { x: clientX - rect.left, y: clientY - rect.top };
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDrawing(true);
    lastPos.current = getCoords(e);
  };
  
  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    e.preventDefault();
    
    const canvas = drawingCanvasRef.current;
    const ctx = canvas?.getContext('2d');
    const currentPos = getCoords(e);
    if (!ctx || !currentPos || !lastPos.current) return;
    
    ctx.beginPath();
    ctx.strokeStyle = 'white';
    ctx.lineWidth = brushSize;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.moveTo(lastPos.current.x, lastPos.current.y);
    ctx.lineTo(currentPos.x, currentPos.y);
    ctx.stroke();

    lastPos.current = currentPos;
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    lastPos.current = null;
  };
  
  const clearMask = () => {
      const canvas = drawingCanvasRef.current;
      const ctx = canvas?.getContext('2d');
      if (ctx && canvas) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
  };

  useImperativeHandle(ref, () => ({
    getMaskAsImageFile: async (): Promise<ImageFile | null> => {
        const drawingCanvas = drawingCanvasRef.current;
        const imageCanvas = imageCanvasRef.current;
        if (!drawingCanvas || !imageCanvas) return null;

        const img = new Image();
        img.src = image.preview;
        await img.decode();
        
        // Create an offscreen canvas with original image dimensions
        const offscreenCanvas = document.createElement('canvas');
        offscreenCanvas.width = img.width;
        offscreenCanvas.height = img.height;
        const ctx = offscreenCanvas.getContext('2d');
        if(!ctx) return null;

        // Calculate scaling factor between display canvas and original image
        const scaleX = img.width / imageCanvas.width;
        const scaleY = img.height / imageCanvas.height;
        
        // Fill mask with black
        ctx.fillStyle = 'black';
        ctx.fillRect(0, 0, img.width, img.height);
        
        // Draw the user's mask (drawingCanvas) onto the offscreen canvas, scaled correctly
        ctx.drawImage(drawingCanvas, 0, 0, img.width, img.height);
        
        return new Promise((resolve) => {
            offscreenCanvas.toBlob((blob) => {
                if (!blob) {
                    resolve(null);
                    return;
                }
                const reader = new FileReader();
                reader.onloadend = () => {
                    const base64 = (reader.result as string).split(',')[1];
                    resolve({
                        name: 'mask.png',
                        type: 'image/png',
                        size: blob.size,
                        base64,
                        preview: URL.createObjectURL(blob)
                    });
                };
                reader.readAsDataURL(blob);
            }, 'image/png');
        });
    },
    clearMask: clearMask,
  }));

  return (
    <div className="w-full space-y-4">
      <div ref={containerRef} className="relative w-full aspect-[4/3] bg-black/20 rounded-lg overflow-hidden">
        <canvas ref={imageCanvasRef} className="absolute top-0 left-0" />
        <canvas
          ref={drawingCanvasRef}
          className="absolute top-0 left-0 cursor-crosshair"
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
        />
      </div>
      <div className="flex items-center gap-4 bg-white/5 p-3 rounded-lg">
          <label htmlFor="brushSize" className="text-sm font-medium text-white/80">Pincel</label>
          <input 
            type="range" 
            id="brushSize" 
            min="5" 
            max="100" 
            value={brushSize} 
            onChange={e => setBrushSize(Number(e.target.value))}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
          />
          <span className="text-sm font-semibold text-white bg-white/10 px-2 py-1 rounded-md w-14 text-center">{brushSize}</span>
          <button onClick={clearMask} className="bg-white/10 text-white font-semibold py-2 px-4 rounded-lg hover:bg-white/20 transition-colors text-sm">Limpar</button>
      </div>
    </div>
  );
});

export default InpaintingCanvas;
