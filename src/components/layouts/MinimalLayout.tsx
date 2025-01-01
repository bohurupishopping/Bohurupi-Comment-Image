import React from 'react';
import type { CommentData, VideoData } from '../utils/youtubeApi';

interface MinimalLayoutProps {
  ctx: CanvasRenderingContext2D;
  comment: CommentData;
  videoDetails: VideoData;
  background: string;
}

export const drawMinimalLayout = async ({ ctx, comment, videoDetails, background }: MinimalLayoutProps) => {
  // Canvas dimensions
  const canvas = ctx.canvas;
  canvas.width = 1200;
  canvas.height = 1200;

  // Background
  ctx.fillStyle = '#000000'; // Dark background for contrast
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Draw background image if provided
  if (background) {
    try {
      const backgroundImage = await loadImage(background);
      ctx.save();
      ctx.beginPath();
      ctx.filter = 'blur(5px)'; // Reduced blur effect
      ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);
      ctx.restore();
    } catch (err) {
      console.error('Error loading background image:', err);
    }
  }

  // Overlay for better text visibility
  ctx.fillStyle = 'rgba(0, 0, 0, 0.5)'; // Semi-transparent overlay (reduced opacity)
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Commenter details (top)
  try {
    const profileImage = await loadImage(comment.authorProfileImageUrl);
    ctx.save();
    ctx.beginPath();
    ctx.arc(canvas.width / 2, 200, 60, 0, Math.PI * 2); // Larger profile picture
    ctx.fillStyle = '#ffffff';
    ctx.fill();
    ctx.clip();
    ctx.drawImage(profileImage, canvas.width / 2 - 60, 140, 120, 120);
    ctx.restore();
  } catch (err) {
    console.error('Error loading commenter profile image:', err);
  }

  // Commenter name (top)
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 36px Arial';
  ctx.textAlign = 'center';
  ctx.fillText(comment.authorName, canvas.width / 2, 350);

  // Comment text (mid)
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 48px Arial';
  ctx.textAlign = 'center';
  wrapText(ctx, comment.text, canvas.width / 2, 600, 1000, 60);

  // Channel details (bottom)
  try {
    const channelImage = await loadImage(videoDetails.channelThumbnailUrl);
    ctx.save();
    ctx.beginPath();
    ctx.arc(canvas.width / 2, 900, 70, 0, Math.PI * 2); // Larger channel logo
    ctx.fillStyle = '#ffffff';
    ctx.fill();
    ctx.clip();
    ctx.drawImage(channelImage, canvas.width / 2 - 70, 830, 140, 140);
    ctx.restore();
  } catch (err) {
    console.error('Error loading channel logo:', err);
  }

  // Video name (bottom)
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 30px Arial';
  ctx.textAlign = 'center';
  wrapText(ctx, videoDetails.title, canvas.width / 2, 1050, 1000, 40);

  // YouTube icon (bottom)
  drawYouTubeIcon(ctx, canvas.width / 2 - 130, 1100, 45, 45);
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 30px Arial';
  ctx.textAlign = 'left';
  ctx.fillText(videoDetails.channelTitle, canvas.width / 2 - 70, 1135);
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
