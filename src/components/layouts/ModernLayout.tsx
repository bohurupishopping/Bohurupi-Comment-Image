import React from 'react';
import type { CommentData, VideoData } from '../utils/youtubeApi';

interface ModernLayoutProps {
  ctx: CanvasRenderingContext2D;
  comment: CommentData;
  videoDetails: VideoData;
  background: string;
}

export const drawModernLayout = async ({ ctx, comment, videoDetails, background }: ModernLayoutProps) => {
  // Canvas dimensions
  const canvas = ctx.canvas;
  canvas.width = 1200;
  canvas.height = 1200;

  // Background gradient
  const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
  gradient.addColorStop(0, '#f3e8ff');
  gradient.addColorStop(1, '#dbeafe');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Draw background image if provided
  if (background) {
    try {
      const backgroundImage = await loadImage(background);
      ctx.save();
      ctx.beginPath();
      roundRect(ctx, 100, 100, canvas.width - 200, canvas.height - 200, 30);
      ctx.clip();
      ctx.drawImage(backgroundImage, 100, 100, canvas.width - 200, canvas.height - 200);
      ctx.restore();
    } catch (err) {
      console.error('Error loading background image:', err);
    }
  }

  // Comment box
  ctx.fillStyle = '#ffffff';
  roundRect(ctx, 100, 100, 1000, 800, 30);
  ctx.fill();

  // Comment text
  ctx.fillStyle = '#1F2937';
  ctx.font = 'bold 36px Arial';
  ctx.textAlign = 'left';
  wrapText(ctx, comment.text, 150, 200, 900, 50);

  // Author name
  ctx.fillStyle = '#4B5563';
  ctx.font = 'bold 28px Arial';
  ctx.textAlign = 'left';
  ctx.fillText(`— ${comment.authorName}`, 150, 750);

  // Draw channel logo
  try {
    const channelImage = await loadImage(videoDetails.channelThumbnailUrl);
    ctx.save();
    ctx.beginPath();
    ctx.arc(canvas.width / 2, 900, 50, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.fill();
    ctx.clip();
    ctx.drawImage(channelImage, canvas.width / 2 - 50, 850, 100, 100);
    ctx.restore();
  } catch (err) {
    console.error('Error loading channel logo:', err);
  }

  // YouTube icon and channel name
  drawYouTubeIcon(ctx, canvas.width / 2 - 130, 1005, 45, 45);
  ctx.fillStyle = '#4B5563';
  ctx.font = 'bold 30px Arial';
  ctx.textAlign = 'left';
  ctx.fillText(videoDetails.channelTitle, canvas.width / 2 - 70, 1040);
};

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
  ctx: CanvasRenderingContext2D,
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
    const metrics = ctx.measureText(testLine);
    const testWidth = metrics.width;
    if (testWidth > maxWidth && n > 0) {
      ctx.fillText(line, x, y);
      line = words[n] + ' ';
      y += lineHeight;
    } else {
      line = testLine;
    }
  }
  ctx.fillText(line, x, y);
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
