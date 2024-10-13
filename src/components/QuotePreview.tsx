import React, { useRef, useEffect, useState } from 'react';
import { Youtube } from 'lucide-react';
import type { CommentData, VideoData } from '../utils/youtubeApi';

interface QuotePreviewProps {
  comment: CommentData;
  videoDetails: VideoData;
  background: string;
}

export default function QuotePreview({
  comment,
  videoDetails,
  background,
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
        // Increase canvas size to accommodate padding
        canvas.width = 1150; // 1080 + 30 (15px padding on each side) + 40 (20px additional padding on each side)
        canvas.height = 1110; // 1080 + 30 (15px padding on each side)

        // Light background
        ctx.fillStyle = '#F0F4F8';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Draw background image if provided, otherwise use gradient
        if (background) {
          const backgroundImage = await loadImage(background);
          ctx.save();
          ctx.beginPath();
          roundRect(ctx, 90, 70, canvas.width - 180, 270, 20)
          ctx.clip();
          ctx.drawImage(backgroundImage, 75, 55, canvas.width - 150, 300);
          ctx.restore();
        } else {
          // Improved gradient header with rounded corners
          const gradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
          gradient.addColorStop(0, '#f87171');
          gradient.addColorStop(1, '#dc2626');
          ctx.fillStyle = gradient;
          roundRect(ctx, 90, 70, canvas.width - 180, 270, 20)
        }

        // Enhanced channel profile picture with shadow and border
        ctx.save();
        ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
        ctx.shadowBlur = 15;
        ctx.beginPath();
        ctx.arc(canvas.width / 2, 320, 90, 0, Math.PI * 2)
        ctx.fillStyle = '#FFFFFF';
        ctx.fill();
        ctx.clip();
        const channelImage = await loadImage(videoDetails.channelThumbnailUrl);
        ctx.drawImage(channelImage, canvas.width / 2 - 85, 235, 170, 170);
        ctx.restore();

        // Title with improved styling
        ctx.font = 'bold 56px Arial';
        ctx.fillStyle = '#1F2937';
        ctx.textAlign = 'center';
        ctx.fillText('শ্রোতারা কি বলছেন?', canvas.width / 2, 480);

        // Improved comment box with shadow and rounded corners
        ctx.save();
        ctx.shadowColor = 'rgba(0, 0, 0, 0.1)';
        ctx.shadowBlur = 15;
        ctx.shadowOffsetY = 5;
        ctx.fillStyle = '#FFFFFF';
        roundRect(ctx, 110, 520, canvas.width - 220, 340, 20);
        ctx.restore();

        // Enhanced commentator profile picture with border and effect
        ctx.save();
        ctx.beginPath();
        ctx.arc(185, 605, 47, 0, Math.PI * 2);
        ctx.fillStyle = '#dc2626';
        ctx.fill();
        ctx.beginPath();
        ctx.arc(185, 605, 45, 0, Math.PI * 2);
        ctx.clip();
        const commentatorImage = await loadImage(comment.authorProfileImageUrl);
        ctx.drawImage(commentatorImage, 140, 560, 90, 90);
        ctx.restore();

        // Add circular glow effect to the profile picture
        ctx.save();
        const glowGradient = ctx.createRadialGradient(185, 605, 45, 185, 605, 60);
        glowGradient.addColorStop(0, 'rgba(220, 38, 38, 0.4)');
        glowGradient.addColorStop(1, 'rgba(220, 38, 38, 0)');
        ctx.fillStyle = glowGradient;
        ctx.beginPath();
        ctx.arc(185, 605, 60, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // Comment author and text with improved styling
        ctx.fillStyle = '#1F2937';
        ctx.font = 'bold 40px Arial';
        ctx.textAlign = 'left';
        ctx.fillText( comment.authorName, 255, 600);
        ctx.fillStyle = '#4B5563';
        ctx.font = '36px Arial';
        wrapText(ctx, comment.text, 275, 645, canvas.width - 370, 38);

        // Video title with improved styling
        ctx.fillStyle = '#1F2937';
        ctx.font = 'bold 26px Arial';
        ctx.textAlign = 'center';
        wrapText(
          ctx,
          videoDetails.title,
          canvas.width / 2,
          925,
          canvas.width - 210,
          38
        );

        // Improved YouTube icon and channel name
        drawYouTubeIcon(ctx, canvas.width / 2 - 130, 1005, 45, 45);
        ctx.fillStyle = '#4B5563';
        ctx.font = 'bold 30px Arial';
        ctx.textAlign = 'left';
        ctx.fillText(videoDetails.channelTitle, canvas.width / 2 - 70, 1040);

        setPreviewUrl(canvas.toDataURL('image/png'));
      } catch (err) {
        console.error('Error drawing image:', err);
        setError(
          `Error generating image: ${
            err instanceof Error ? err.message : 'Unknown error'
          }`
        );
      }
    };

    drawImage();
  }, [comment, videoDetails, background]);

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

const loadImage = (src: string): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
};

const drawYouTubeIcon = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number
) => {
  ctx.save();
  ctx.fillStyle = '#FF0000';
  ctx.beginPath();
  ctx.moveTo(x + width / 2, y);
  ctx.lineTo(x + width, y + height / 2);
  ctx.lineTo(x + width / 2, y + height);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
};

const wrapText = (
  context: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number
) => {
  const words = text.split(' ');
  let line = '';

  for (let n = 0; n < words.length; n++) {
    const testLine = line + words[n] + ' ';
    const metrics = context.measureText(testLine);
    const testWidth = metrics.width;
    if (testWidth > maxWidth && n > 0) {
      context.fillText(line, x, y);
      line = words[n] + ' ';
      y += lineHeight;
    } else {
      line = testLine;
    }
  }
  context.fillText(line, x, y);
};

const roundRect = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
) => {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
  ctx.fill();
};