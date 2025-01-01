import React, { useRef, useEffect, useState } from 'react';
import { Youtube } from 'lucide-react';
import type { CommentData, VideoData } from '../utils/youtubeApi';
import { drawDefaultLayout } from './layouts/DefaultLayout';
import { drawMinimalLayout } from './layouts/MinimalLayout';
import { drawModernLayout } from './layouts/ModernLayout';
import { drawVintageLayout } from './layouts/VintageLayout';

interface QuotePreviewProps {
  comment: CommentData;
  videoDetails: VideoData;
  background: string;
  layout: string;
  textSize: number;
  commentPosition: number;
}

export default function QuotePreview({
  comment,
  videoDetails,
  background,
  layout,
  textSize,
  commentPosition,
}: QuotePreviewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      setError('Unable to get canvas context');
      return;
    }

    const drawImage = async () => {
      try {
        // Canvas dimensions
        canvas.width = 1200;
        canvas.height = 1200;

        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw layout based on selected layout
        switch (layout) {
          case 'minimal':
            await drawMinimalLayout({ ctx, comment, videoDetails, background, textSize, commentPosition });
            break;
          case 'modern':
            await drawModernLayout({ ctx, comment, videoDetails, background });
            break;
          case 'vintage':
            await drawVintageLayout({ ctx, comment, videoDetails, background });
            break;
          default:
            await drawDefaultLayout({ ctx, comment, videoDetails, background, textSize });
            break;
        }

        setPreviewUrl(canvas.toDataURL('image/png'));
      } catch (err) {
        console.error('Error drawing image:', err);
        setError(`Error generating image: ${err instanceof Error ? err.message : 'Unknown error'}`);
      }
    };

    drawImage();
  }, [comment, videoDetails, background, layout, textSize, commentPosition]);

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6 bg-blue-50 p-10 rounded-3xl shadow-lg">
      <canvas ref={canvasRef} className="hidden" />
      {previewUrl && (
        <div className="rounded-3xl overflow-hidden shadow-2xl">
          <img src={previewUrl} alt="Quote Preview" className="w-full h-auto" />
        </div>
      )}
      {previewUrl && (
        <a
          href={previewUrl}
          download="quote.png"
          className="inline-flex items-center justify-center w-full px-6 py-3 text-base font-medium text-white bg-blue-600 rounded-lg shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-150 ease-in-out"
        >
          Download Image
        </a>
      )}
    </div>
  );
}
