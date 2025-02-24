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
  const canvas = ctx.canvas;
  canvas.width = 1024;
  canvas.height = 1024;

  // Create a gradient background
  const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
  gradient.addColorStop(0, '#ace0f9');
  gradient.addColorStop(1, '#fff1eb');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Draw video thumbnail in the header
  try {
    const thumbnailImage = await loadImage(videoDetails.videoThumbnailUrl);
    ctx.save();
    
    // Draw thumbnail with enhanced shadow and rounded corners
    ctx.shadowColor = 'rgba(0, 0, 0, 0.2)';
    ctx.shadowBlur = 15;
    ctx.beginPath();
    roundRect(ctx, 40, 40, canvas.width - 80, 300, 30);
    ctx.clip();
    ctx.drawImage(thumbnailImage, 40, 40, canvas.width - 80, 300);
    
    // Add overlay gradient for better text visibility
    const overlayGradient = ctx.createLinearGradient(0, 40, 0, 340);
    overlayGradient.addColorStop(0, 'rgba(0, 0, 0, 0.4)');
    overlayGradient.addColorStop(1, 'rgba(0, 0, 0, 0.6)');
    ctx.fillStyle = overlayGradient;
    ctx.fillRect(40, 40, canvas.width - 80, 300);
    
    // Add duration badge
    const durationWidth = ctx.measureText(videoDetails.duration).width + 40;
    ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
    roundRect(ctx, canvas.width - durationWidth - 60, 60, durationWidth, 32, 6);
    ctx.fillStyle = '#ffffff';
    ctx.font = '600 16px "Inter", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(videoDetails.duration, canvas.width - durationWidth/2 - 60, 82);
    
    ctx.restore();
  } catch (err) {
    console.error('Error loading thumbnail:', err);
    // Fallback gradient header
    const headerGradient = ctx.createLinearGradient(0, 40, 0, 340);
    headerGradient.addColorStop(0, '#f87171');
    headerGradient.addColorStop(1, '#dc2626');
    ctx.fillStyle = headerGradient;
    roundRect(ctx, 40, 40, canvas.width - 80, 300, 30);
  }

  // Draw video stats in the header
  ctx.save();
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 24px "Inter", sans-serif';
  ctx.textAlign = 'center';
  
  const stats = [
    { icon: '👁️', value: videoDetails.viewCount, label: 'Views' },
    { icon: '❤️', value: videoDetails.likeCount, label: 'Likes' },
    { icon: '💬', value: videoDetails.commentCount, label: 'Comments' }
  ];
  
  const statSpacing = canvas.width / (stats.length + 1);
  stats.forEach((stat, index) => {
    const x = statSpacing * (index + 1);
    const y = 160;
    
    // Draw stat with enhanced styling
    ctx.save();
    ctx.shadowColor = 'rgba(0, 0, 0, 0.2)';
    ctx.shadowBlur = 4;
    
    // Icon
    ctx.font = '32px "Inter", sans-serif';
    ctx.fillText(stat.icon, x, y);
    
    // Value
    ctx.font = 'bold 28px "Inter", sans-serif';
    ctx.fillText(stat.value, x, y + 40);
    
    // Label
    ctx.font = '18px "Inter", sans-serif';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.fillText(stat.label, x, y + 70);
    ctx.restore();
  });

  // Draw video title in header
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 24px "Inter", sans-serif';
  ctx.textAlign = 'center';
  wrapText(ctx, videoDetails.title, canvas.width / 2, 260, canvas.width - 160, 36);
  
  // Draw publish date
  ctx.font = '18px "Inter", sans-serif';
  ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
  ctx.fillText(videoDetails.publishedAt, canvas.width / 2, 310);
  ctx.restore();

  // Draw comment section with larger card and more rounded corners
  ctx.save();
  
  // Comment box with enhanced styling and increased height
  ctx.shadowColor = 'rgba(0, 0, 0, 0.1)';
  ctx.shadowBlur = 20;
  ctx.shadowOffsetY = 5;
  ctx.fillStyle = '#ffffff';
  roundRect(ctx, 60, 380, canvas.width - 120, 400, 40);

  try {
    // Commenter profile
    const commenterImage = await loadImage(comment.authorProfileImageUrl);
    ctx.save();
    
    // Profile picture with enhanced effects
    const profileSize = 100;
    const profileX = canvas.width / 2 - profileSize / 2;
    const profileY = 420;
    
    ctx.shadowColor = 'rgba(0, 0, 0, 0.2)';
    ctx.shadowBlur = 15;
    ctx.beginPath();
    ctx.arc(profileX + profileSize/2, profileY + profileSize/2, profileSize/2 + 4, 0, Math.PI * 2);
    ctx.fillStyle = '#dc2626';
    ctx.fill();
    
    ctx.beginPath();
    ctx.arc(profileX + profileSize/2, profileY + profileSize/2, profileSize/2, 0, Math.PI * 2);
    ctx.clip();
    ctx.drawImage(commenterImage, profileX, profileY, profileSize, profileSize);
    ctx.restore();

    // Commenter name (centered)
    ctx.fillStyle = '#1F2937';
    ctx.font = 'bold 28px "Inter", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(comment.authorName, canvas.width / 2, profileY + profileSize + 40);

    // Comment text with dynamic size and more space (centered)
    ctx.fillStyle = '#374151';
    ctx.font = `${textSize}px "Inter", sans-serif`;
    ctx.textAlign = 'center';
    wrapText(
      ctx,
      comment.text,
      canvas.width / 2,
      profileY + profileSize + 90,
      canvas.width - 200,
      textSize * 1.4
    );
  } catch (err) {
    console.error('Error loading commenter image:', err);
  }

  // Draw channel section at bottom with clean centered design
  try {
    const channelImage = await loadImage(videoDetails.channelThumbnailUrl);
    ctx.save();
    
    // Channel logo centered
    const logoSize = 80;
    const logoX = canvas.width / 2 - logoSize / 2;
    const logoY = canvas.height - 180;
    
    // Draw channel logo with subtle shadow
    ctx.save();
    ctx.shadowColor = 'rgba(0, 0, 0, 0.1)';
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.arc(logoX + logoSize/2, logoY + logoSize/2, logoSize/2, 0, Math.PI * 2);
    ctx.clip();
    ctx.drawImage(channelImage, logoX, logoY, logoSize, logoSize);
    ctx.restore();

    // Subtle separator line
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.1)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(canvas.width * 0.3, logoY - 20);
    ctx.lineTo(canvas.width * 0.7, logoY - 20);
    ctx.stroke();

    // Channel info centered
    ctx.textAlign = 'center';
    
    // Channel name with verification badge
    ctx.fillStyle = '#1F2937';
    ctx.font = 'bold 28px "Inter", sans-serif';
    const channelNameY = logoY + logoSize + 25;
    ctx.fillText(videoDetails.channelTitle, canvas.width / 2, channelNameY);
    
    if (videoDetails.isVerified) {
      const nameWidth = ctx.measureText(videoDetails.channelTitle).width;
      const badgeX = canvas.width / 2 + nameWidth/2 + 15;
      
      ctx.fillStyle = '#3B82F6';
      ctx.beginPath();
      ctx.arc(badgeX, channelNameY - 8, 12, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 14px "Inter", sans-serif';
      ctx.fillText('✓', badgeX - 4, channelNameY - 4);
    }

    // Duration and YouTube icon with adjusted spacing
    const bottomY = channelNameY + 25;
    ctx.fillStyle = '#4B5563';
    ctx.font = '16px "Inter", sans-serif';
    ctx.fillText(`Duration: ${videoDetails.duration}`, canvas.width / 2, bottomY);

    // YouTube icon centered below duration
    drawYouTubeIcon(ctx, canvas.width / 2 - 20, bottomY + 15, 40, 40);
    
    ctx.restore();
  } catch (err) {
    console.error('Error loading channel logo:', err);
  }
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
  ctx.moveTo(x + width/2, y);
  ctx.lineTo(x + width, y + height/2);
  ctx.lineTo(x + width/2, y + height);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
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
  let testLine = '';

  for (let n = 0; n < words.length; n++) {
    testLine = line + words[n] + ' ';
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