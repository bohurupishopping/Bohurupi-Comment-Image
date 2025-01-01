import React from 'react';
import type { CommentData, VideoData } from '../../utils/youtubeApi';

interface DefaultLayoutProps {
  ctx: CanvasRenderingContext2D;
  comment: CommentData;
  videoDetails: VideoData;
  background: string;
  textSize: number;
}

export const drawDefaultLayout = async ({ ctx, comment, videoDetails, background, textSize }: DefaultLayoutProps) => {
  // Increase canvas size to accommodate padding
  const canvas = ctx.canvas;
  canvas.width = 1050; // 1080 + 30 (15px padding on each side) + 40 (20px additional padding on each side)
  canvas.height = 1090; // 1080 + 30 (15px padding on each side)

  // Create a gradient object
  const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);

  // Define the color stops for the gradient
  gradient.addColorStop(0, '#ace0f9');  // Start color
  gradient.addColorStop(1, '#fff1eb');  // End color

  // Use the gradient as the fill style
  ctx.fillStyle = gradient;

  // Fill the background with the gradient
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Draw background image if provided
  if (background) {
    try {
      const backgroundImage = await loadImage(background);
      ctx.save();
      ctx.beginPath();
      roundRect(ctx, 90, 70, canvas.width - 180, 270, 20);
      ctx.clip();
      ctx.drawImage(backgroundImage, 75, 55, canvas.width - 150, 300);
      ctx.restore();
    } catch (err) {
      console.error('Error loading background image:', err);
    }
  } else {
    // Improved gradient header with rounded corners
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
    gradient.addColorStop(0, '#f87171');
    gradient.addColorStop(1, '#dc2626');
    ctx.fillStyle = gradient;
    roundRect(ctx, 90, 70, canvas.width - 180, 270, 45);
  }

  // Draw channel logo
  try {
    const channelImage = await loadImage(videoDetails.channelThumbnailUrl);
    ctx.save();
    ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
    ctx.shadowBlur = 15;
    ctx.beginPath();
    ctx.arc(canvas.width / 2, 320, 93, 0, Math.PI * 2);
    ctx.fillStyle = '#FFFFFF';
    ctx.fill();
    ctx.beginPath();
    ctx.arc(canvas.width / 2, 320, 90, 0, Math.PI * 2);
    ctx.clip();
    ctx.drawImage(channelImage, canvas.width / 2 - 90, 231, 180, 180);
    ctx.restore();
    ctx.beginPath();
    ctx.arc(canvas.width / 2, 320, 93, 0, Math.PI * 2);
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 7;
    ctx.stroke();
  } catch (err) {
    console.error('Error loading channel logo:', err);
  }

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
  roundRect(ctx, 110, 520, canvas.width - 220, 340, 40);
  ctx.restore();

  // Enhanced commentator profile picture with border and effect
  try {
    const commentatorImage = await loadImage(comment.authorProfileImageUrl);
    ctx.save();
    ctx.beginPath();
    ctx.arc(185, 605, 47, 0, Math.PI * 2);
    ctx.fillStyle = '#dc2626';
    ctx.fill();
    ctx.beginPath();
    ctx.arc(185, 605, 45, 0, Math.PI * 2);
    ctx.clip();
    ctx.drawImage(commentatorImage, 130, 560, 110, 89);
    ctx.restore();
  } catch (err) {
    console.error('Error loading commentator profile image:', err);
  }

  // Comment author and text with improved styling
  ctx.fillStyle = '#1F2937';
  ctx.font = 'bold 40px Arial';
  ctx.textAlign = 'left';
  ctx.fillText(comment.authorName, 255, 600);
  ctx.fillStyle = '#4B5563';
  ctx.font = `${textSize}px Arial`;
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
