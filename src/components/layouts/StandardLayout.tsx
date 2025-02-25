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
  const canvas = ctx.canvas;
  canvas.width = 1024;
  canvas.height = 1024;

  let hasBackgroundImage = false;
  let textColor = '#1F2937'; // Default dark text for light background
  let quoteColor = 'rgba(0, 0, 0, 0.08)';

  // Draw background
  if (background) {
    try {
      const backgroundImage = await loadImage(background);
      hasBackgroundImage = true;
      
      // Calculate scaling to cover the entire canvas while maintaining aspect ratio
      const scale = Math.max(
        canvas.width / backgroundImage.width,
        canvas.height / backgroundImage.height
      );
      
      const scaledWidth = backgroundImage.width * scale;
      const scaledHeight = backgroundImage.height * scale;
      
      // Center the background image
      const x = (canvas.width - scaledWidth) / 2;
      const y = (canvas.height - scaledHeight) / 2;
      
      // Draw full-size background with slight blur and brightness adjustment
      ctx.filter = 'blur(8px) brightness(0.85)';
      ctx.drawImage(backgroundImage, x, y, scaledWidth, scaledHeight);
      
      // Reset filter
      ctx.filter = 'none';
      
      // Add subtle overlay for better text visibility
      const overlay = ctx.createLinearGradient(0, 0, 0, canvas.height);
      overlay.addColorStop(0, 'rgba(0, 0, 0, 0.3)');
      overlay.addColorStop(0.5, 'rgba(0, 0, 0, 0.2)');
      overlay.addColorStop(1, 'rgba(0, 0, 0, 0.4)');
      ctx.fillStyle = overlay;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Set text color to white for dark background
      textColor = '#ffffff';
      quoteColor = 'rgba(255, 255, 255, 0.15)';
    } catch (err) {
      console.error('Error loading background image:', err);
      hasBackgroundImage = false;
    }
  }

  if (!hasBackgroundImage) {
    // Light gradient background when no image is provided
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, '#ffffff');
    gradient.addColorStop(1, '#f3f4f6');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  // Add subtle grain texture
  ctx.save();
  ctx.globalAlpha = hasBackgroundImage ? 0.03 : 0.02;
  for (let i = 0; i < canvas.width; i += 4) {
    for (let j = 0; j < canvas.height; j += 4) {
      if (Math.random() > 0.5) {
        ctx.fillStyle = hasBackgroundImage ? '#ffffff' : '#000000';
        ctx.fillRect(i, j, 1, 1);
      }
    }
  }
  ctx.restore();

  // Draw large, modern quote marks
  ctx.save();
  const quoteSize = Math.min(canvas.width, canvas.height) * 0.25;
  
  // Left quote
  ctx.font = 'bold ' + quoteSize + 'px "Georgia"';
  ctx.fillStyle = quoteColor;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.fillText('"', 40, commentPosition - quoteSize * 0.8);
  
  // Right quote
  ctx.textAlign = 'right';
  ctx.textBaseline = 'bottom';
  ctx.fillText('"', canvas.width - 40, commentPosition + quoteSize * 0.4);
  ctx.restore();

  // Draw profile picture with modern effects
  try {
    const profileImage = await loadImage(comment.authorProfileImageUrl);
    ctx.save();
    
    // Outer glow
    ctx.shadowColor = hasBackgroundImage ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.1)';
    ctx.shadowBlur = 30;
    
    const profileSize = 120;
    const centerX = canvas.width / 2;
    const centerY = 250;
    
    // Draw border with gradient
    const borderGradient = ctx.createLinearGradient(
      centerX - profileSize,
      centerY - profileSize,
      centerX + profileSize,
      centerY + profileSize
    );
    borderGradient.addColorStop(0, hasBackgroundImage ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.1)');
    borderGradient.addColorStop(1, hasBackgroundImage ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)');
    
    ctx.beginPath();
    ctx.arc(centerX, centerY, profileSize / 1.8 + 5, 0, Math.PI * 2);
    ctx.fillStyle = borderGradient;
    ctx.fill();
    
    // Draw profile picture
    ctx.beginPath();
    ctx.arc(centerX, centerY, profileSize / 1.8, 0, Math.PI * 2);
    ctx.clip();
    ctx.drawImage(
      profileImage,
      centerX - profileSize / 1.8,
      centerY - profileSize / 1.8,
      profileSize * 1.1,
      profileSize * 1.1
    );
    ctx.restore();
  } catch (err) {
    console.error('Error loading profile image:', err);
  }

  // Draw author name with modern styling
  ctx.save();
  ctx.fillStyle = textColor;
  ctx.font = '500 36px "Inter", sans-serif';
  ctx.textAlign = 'center';
  ctx.shadowColor = hasBackgroundImage ? 'rgba(0, 0, 0, 0.3)' : 'rgba(0, 0, 0, 0.1)';
  ctx.shadowBlur = hasBackgroundImage ? 15 : 5;
  ctx.fillText(comment.authorName, canvas.width / 2, 350);
  ctx.restore();

  // Draw comment text with enhanced styling
  ctx.save();
  ctx.fillStyle = textColor;
  ctx.font = '500 ' + textSize + 'px "Inter", sans-serif';
  ctx.textAlign = 'center';
  ctx.shadowColor = hasBackgroundImage ? 'rgba(0, 0, 0, 0.2)' : 'rgba(0, 0, 0, 0.05)';
  ctx.shadowBlur = hasBackgroundImage ? 5 : 2;
  wrapText(ctx, comment.text, canvas.width / 2, commentPosition, 900, textSize * 1.5);
  ctx.restore();

  // Draw modern separator line
  ctx.save();
  const lineGradient = ctx.createLinearGradient(
    canvas.width * 0.3,
    800,
    canvas.width * 0.7,
    800
  );
  const lineColor = hasBackgroundImage ? 'rgba(255, 255, 255, ' : 'rgba(0, 0, 0, ';
  lineGradient.addColorStop(0, lineColor + '0)');
  lineGradient.addColorStop(0.5, lineColor + '0.2)');
  lineGradient.addColorStop(1, lineColor + '0)');
  
  ctx.strokeStyle = lineGradient;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(canvas.width * 0.3, 800);
  ctx.lineTo(canvas.width * 0.7, 800);
  ctx.stroke();
  ctx.restore();

  // Draw video title at the top with modern styling
  ctx.save();
  ctx.fillStyle = textColor;
  ctx.font = '500 32px "Inter", sans-serif';
  ctx.textAlign = 'center';
  ctx.shadowColor = hasBackgroundImage ? 'rgba(0, 0, 0, 0.2)' : 'rgba(0, 0, 0, 0.05)';
  ctx.shadowBlur = hasBackgroundImage ? 3 : 1;
  wrapText(ctx, videoDetails.title, canvas.width / 2, 120, 900, 40);
  ctx.restore();

  // Draw channel information with modern styling
  try {
    const channelImage = await loadImage(videoDetails.channelThumbnailUrl);
    ctx.save();
    
    const channelSize = 90;
    const channelY = 870; // Moved up from 900
    ctx.shadowColor = hasBackgroundImage ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.1)';
    ctx.shadowBlur = 20;
    
    // Modern border for channel logo
    ctx.beginPath();
    ctx.arc(canvas.width / 2, channelY, channelSize / 2 + 3, 0, Math.PI * 2);
    ctx.fillStyle = hasBackgroundImage ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)';
    ctx.fill();
    
    ctx.beginPath();
    ctx.arc(canvas.width / 2, channelY, channelSize / 2, 0, Math.PI * 2);
    ctx.clip();
    ctx.drawImage(
      channelImage,
      canvas.width / 2 - channelSize / 2,
      channelY - channelSize / 2,
      channelSize,
      channelSize
    );
    ctx.restore();

    // Draw video stats below channel logo
    const stats = [
      { icon: '👁️', value: videoDetails.viewCount, label: 'Views' },
      { icon: '❤️', value: videoDetails.likeCount, label: 'Likes' },
      { icon: '💬', value: videoDetails.commentCount, label: 'Comments' }
    ];

    const statSpacing = canvas.width / (stats.length + 1);
    stats.forEach((stat, index) => {
      const x = statSpacing * (index + 1);
      const y = 960;

      ctx.save();
      ctx.fillStyle = textColor;
      ctx.shadowColor = hasBackgroundImage ? 'rgba(0, 0, 0, 0.2)' : 'rgba(0, 0, 0, 0.1)';
      ctx.shadowBlur = 4;
      ctx.textAlign = 'center';

      // Icon
      ctx.font = '24px "Inter", sans-serif';
      ctx.fillText(stat.icon, x, y);

      // Value
      ctx.font = '500 20px "Inter", sans-serif';
      ctx.fillText(stat.value, x, y + 30);

      // Label
      ctx.font = '400 16px "Inter", sans-serif';
      ctx.fillStyle = hasBackgroundImage ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.6)';
      ctx.fillText(stat.label, x, y + 50);
      ctx.restore();
    });

  } catch (err) {
    console.error('Error loading channel logo:', err);
  }

  // Draw modern YouTube branding
  const youtubeX = canvas.width / 2 - 130;
  const youtubeY = 1080;
  
  // YouTube icon with modern effect
  ctx.save();
  ctx.shadowColor = 'rgba(255, 0, 0, 0.3)';
  ctx.shadowBlur = 10;
  drawYouTubeIcon(ctx, youtubeX, youtubeY, 45, 45);
  ctx.restore();
  
  // Channel name with modern styling
  ctx.fillStyle = textColor;
  ctx.font = '500 30px "Inter", sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText(videoDetails.channelTitle, youtubeX + 60, youtubeY + 35);
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