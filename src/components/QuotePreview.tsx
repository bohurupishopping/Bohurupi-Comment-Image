import { useRef, useEffect, useState } from 'react';
import { Download, RefreshCw } from 'lucide-react';
import type { CommentData, VideoData } from '../utils/youtubeApi';
import { drawDefaultLayout } from './layouts/DefaultLayout';
import { drawMinimalLayout } from './layouts/ModernCardLayout';
import { drawModernLayout } from './layouts/StandardLayout';
import { drawVintageLayout } from './layouts/VintageLayout';
import { drawSocialCardLayout } from './layouts/YoutubeCardLayout';

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
  const [isGenerating, setIsGenerating] = useState(false);

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
        setIsGenerating(true);
        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw layout based on selected layout
        switch (layout) {
          case 'minimal':
            await drawMinimalLayout({ ctx, comment, videoDetails, background, textSize, commentPosition });
            break;
          case 'modern':
            await drawModernLayout({ ctx, comment, videoDetails, background, textSize, commentPosition });
            break;
          case 'vintage':
            await drawVintageLayout({ ctx, comment, videoDetails, background });
            break;
          case 'social':
            await drawSocialCardLayout({ ctx, comment, videoDetails, background });
            break;
          default:
            await drawDefaultLayout({ ctx, comment, videoDetails, background, textSize });
            break;
        }

        setPreviewUrl(canvas.toDataURL('image/png'));
        setError(null);
      } catch (err) {
        console.error('Error drawing image:', err);
        setError(`Error generating image: ${err instanceof Error ? err.message : 'Unknown error'}`);
      } finally {
        setIsGenerating(false);
      }
    };

    drawImage();
  }, [comment, videoDetails, background, layout, textSize, commentPosition]);

  const handleDownload = () => {
    if (!previewUrl) return;
    
    const link = document.createElement('a');
    link.href = previewUrl;
    link.download = `youtube-quote-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="relative">
      <canvas ref={canvasRef} className="hidden" />
      
      {/* Loading State */}
      {isGenerating && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm rounded-3xl z-10">
          <div className="flex flex-col items-center space-y-4">
            <RefreshCw className="w-8 h-8 text-red-600 animate-spin" />
            <p className="text-gray-700 font-medium">Generating preview...</p>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-xl">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Preview */}
      {previewUrl && !error && (
        <div className="space-y-4 animate-fade-in">
          <div className="relative overflow-hidden rounded-2xl shadow-lg ring-1 ring-black/5">
            <img 
              src={previewUrl} 
              alt="Quote Preview" 
              className="w-full h-auto"
            />
          </div>
          
          {/* Download Button */}
          <button
            onClick={handleDownload}
            className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-red-500 to-red-700 text-white px-6 py-3 rounded-xl shadow-lg transform transition-all duration-200"
          >
            <Download className="w-5 h-5" />
            <span className="font-medium">Download Image</span>
          </button>
        </div>
      )}
    </div>
  );
}