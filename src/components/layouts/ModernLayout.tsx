import React from 'react';
import type { CommentData, VideoData } from '../../utils/youtubeApi';

interface ModernLayoutProps {
  ctx: CanvasRenderingContext2D;
  comment: CommentData;
  videoDetails: VideoData;
  background: string;
  textSize: number;
  commentPosition: number;
}

export const drawModernLayout = async ({ ctx, comment, videoDetails, background, textSize, commentPosition }: ModernLayoutProps) => {
  // Canvas dimensions
  const canvas = ctx.canvas;
  canvas.width = 1200;
  canvas.height = 1200;

  // Multi-color background gradient
  const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
  gradient.addColorStop(0, '#f3e8ff');
  gradient.addColorStop(0.3, '#dbeafe');
  gradient.addColorStop(0.6, '#f0fdf4');
  gradient.addColorStop(1, '#fef3c7');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Add subtle noise texture
  ctx.save();
  ctx.globalAlpha = 0.1;
  for (let i = 0; i < canvas.width; i += 2) {
    for (let j = 0; j < canvas.height; j += 2) {
      const val = Math.floor(Math.random() * 255);
      ctx.fillStyle = `rgba(${val}, ${val}, ${val}, 0.1)`;
      ctx.fillRect(i, j, 1, 1);
    }
  }
  ctx.restore();

  let hasBackgroundImage = false;
  
  // Draw background image if provided
  if (background) {
    try {
      const backgroundImage = await loadImage(background);
      ctx.save();
      ctx.beginPath();
      ctx.filter = 'blur(8px)';
      ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);
      ctx.restore();

      // Dark overlay for better text contrast
      ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      hasBackgroundImage = true;
    } catch (err) {
      console.error('Error loading background image:', err);
    }
  }

  // Set text color based on background
  const textColor = hasBackgroundImage ? '#ffffff' : '#1F2937';

  // Commenter profile picture
  try {
    const profileImage = await loadImage(comment.authorProfileImageUrl);
    ctx.save();
    ctx.beginPath();
    ctx.arc(canvas.width / 2, 200, 60, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.fill();
    ctx.clip();
    ctx.drawImage(profileImage, canvas.width / 2 - 60, 140, 120, 120);
    ctx.restore();
  } catch (err) {
    console.error('Error loading commenter profile image:', err);
  }

  // Large decorative quote marks with shadow
  ctx.save();
  ctx.shadowColor = 'rgba(0, 0, 0, 0.2)';
  ctx.shadowBlur = 10;
  ctx.shadowOffsetX = 5;
  ctx.shadowOffsetY = 5;
  
  ctx.fillStyle = textColor;
  ctx.font = 'bold 300px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('“', canvas.width / 2 - 450, commentPosition - 100);
  ctx.fillText('”', canvas.width / 2 + 450, commentPosition + 400);
  ctx.restore();

  // Comment text
  ctx.fillStyle = textColor;
  ctx.font = `italic ${textSize}px Georgia`;
  ctx.textAlign = 'center';
  wrapText(ctx, comment.text, canvas.width / 2, commentPosition, 1000, 60);

  // Commenter attribution
  ctx.fillStyle = textColor;
  ctx.font = 'bold 36px Georgia';
  ctx.textAlign = 'center';
  ctx.fillText(`— ${comment.authorName}`, canvas.width / 2, 350);

  // Decorative line
  ctx.beginPath();
  ctx.moveTo(canvas.width / 2 - 200, 400);
  ctx.lineTo(canvas.width / 2 + 200, 400);
  ctx.strokeStyle = '#dbeafe';
  ctx.lineWidth = 3;
  ctx.stroke();

  // Channel details
  try {
    const channelImage = await loadImage(videoDetails.channelThumbnailUrl);
    ctx.save();
    ctx.beginPath();
    ctx.arc(canvas.width / 2, 900, 70, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.fill();
    ctx.clip();
    ctx.drawImage(channelImage, canvas.width / 2 - 70, 830, 140, 140);
    ctx.restore();
  } catch (err) {
    console.error('Error loading channel logo:', err);
  }

  // YouTube icon and channel name
  drawYouTubeIcon(ctx, canvas.width / 2 - 130, 1005, 45, 45);
  ctx.fillStyle = textColor;
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
