import type { CommentData, VideoData } from '../../utils/youtubeApi';
import { loadImage, FALLBACK_IMAGES } from '../../utils/imageLoader';

interface MinimalLayoutProps {
  ctx: CanvasRenderingContext2D;
  comment: CommentData;
  videoDetails: VideoData;
  background: string;
  textSize: number;
  commentPosition: number;
}

export const drawMinimalLayout = async ({ 
  ctx, 
  comment, 
  videoDetails, 
  background, 
  textSize, 
  commentPosition 
}: MinimalLayoutProps) => {
  const canvas = ctx.canvas;
  canvas.width = 1024;
  canvas.height = 1024;

  // Clean white background
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Left section (channel info) - 40% of width
  const leftWidth = canvas.width * 0.4;
  
  // Background for left section
  if (background) {
    try {
      const backgroundImage = await loadImage(background, FALLBACK_IMAGES.THUMBNAIL);
      ctx.save();
      ctx.beginPath();
      ctx.rect(0, 0, leftWidth, canvas.height);
      ctx.clip();
      
      // Draw with cover fit
      const scale = Math.max(
        leftWidth / backgroundImage.width,
        canvas.height / backgroundImage.height
      );
      
      const scaledWidth = backgroundImage.width * scale;
      const scaledHeight = backgroundImage.height * scale;
      const x = (leftWidth - scaledWidth) / 2;
      const y = (canvas.height - scaledHeight) / 2;
      
      // Improved blur and brightness
      ctx.filter = 'brightness(0.6) blur(3px)';
      ctx.drawImage(backgroundImage, x, y, scaledWidth, scaledHeight);
      ctx.filter = 'none';
      
      // Enhanced gradient overlay
      const gradient = ctx.createLinearGradient(0, 0, leftWidth, canvas.height);
      gradient.addColorStop(0, 'rgba(17, 24, 39, 0.85)');
      gradient.addColorStop(1, 'rgba(17, 24, 39, 0.95)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, leftWidth, canvas.height);
      
      ctx.restore();
    } catch (err) {
      console.error('Error loading background image:', err);
      drawDefaultLeftBackground(ctx, leftWidth, canvas.height);
    }
  } else {
    drawDefaultLeftBackground(ctx, leftWidth, canvas.height);
  }

  // Channel profile section
  try {
    const channelImage = await loadImage(videoDetails.channelThumbnailUrl, FALLBACK_IMAGES.CHANNEL);
    ctx.save();
    
    // Larger profile picture with enhanced effects
    const profileSize = 160;
    const profileX = leftWidth / 2;
    const profileY = 180;
    
    // Outer glow effect
    ctx.shadowColor = 'rgba(255, 255, 255, 0.3)';
    ctx.shadowBlur = 25;
    ctx.beginPath();
    ctx.arc(profileX, profileY, profileSize/2 + 5, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.fill();
    
    // Profile picture
    ctx.beginPath();
    ctx.arc(profileX, profileY, profileSize/2, 0, Math.PI * 2);
    ctx.clip();
    ctx.drawImage(
      channelImage,
      profileX - profileSize/2,
      profileY - profileSize/2,
      profileSize,
      profileSize
    );
    ctx.restore();
  } catch (err) {
    console.error('Error loading channel image:', err);
  }

  // Channel information with improved typography
  ctx.save();
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'center';
  
  // Channel name with shadow
  ctx.shadowColor = 'rgba(0, 0, 0, 0.2)';
  ctx.shadowBlur = 10;
  ctx.font = 'bold 32px "Inter", sans-serif';
  ctx.fillText(videoDetails.channelTitle, leftWidth/2, 320);

  // Enhanced stats display
  const stats = [
    { icon: '👥', value: videoDetails.viewCount, label: 'Views' },
    { icon: '❤️', value: videoDetails.likeCount, label: 'Likes' },
    { icon: '💬', value: videoDetails.commentCount, label: 'Comments' }
  ];

  let statY = 400;
  stats.forEach(stat => {
    // Icon
    ctx.font = '28px "Inter", sans-serif';
    ctx.fillText(stat.icon, leftWidth/2 - 90, statY);
    
    // Value with enhanced styling
    ctx.font = 'bold 26px "Inter", sans-serif';
    ctx.fillText(stat.value, leftWidth/2, statY);
    
    // Label with subtle opacity
    ctx.font = '18px "Inter", sans-serif';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.fillText(stat.label, leftWidth/2 + 90, statY);
    
    statY += 60;
  });

  // Modern subscribe button
  const btnY = 600;
  const btnWidth = 220;
  const btnHeight = 54;
  const btnX = (leftWidth - btnWidth) / 2;
  
  // Button with gradient
  const btnGradient = ctx.createLinearGradient(btnX, btnY, btnX, btnY + btnHeight);
  btnGradient.addColorStop(0, '#f43f5e');
  btnGradient.addColorStop(1, '#e11d48');
  ctx.fillStyle = btnGradient;
  roundRect(ctx, btnX, btnY, btnWidth, btnHeight, 27);
  ctx.fill();
  
  // Button text with shadow
  ctx.fillStyle = '#ffffff';
  ctx.shadowColor = 'rgba(0, 0, 0, 0.2)';
  ctx.shadowBlur = 4;
  ctx.font = 'bold 24px "Inter", sans-serif';
  ctx.fillText('SUBSCRIBE', leftWidth/2, btnY + 35);

  // Video thumbnail card below subscribe button
  try {
    const thumbnailImage = await loadImage(videoDetails.videoThumbnailUrl, FALLBACK_IMAGES.THUMBNAIL);
    const cardY = btnY + btnHeight + 30;
    const cardWidth = leftWidth - 60;
    const cardHeight = 260; // Increased height for better layout
    const cardX = 30;

    // Card background with shadow
    ctx.save();
    ctx.shadowColor = 'rgba(0, 0, 0, 0.2)';
    ctx.shadowBlur = 10;
    ctx.shadowOffsetY = 2;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
    roundRect(ctx, cardX, cardY, cardWidth, cardHeight, 15);
    ctx.fill();

    // Full width thumbnail at the top with increased height
    const thumbnailHeight = 160; // Increased from 90
    ctx.save();
    ctx.beginPath();
    roundRect(ctx, cardX + 10, cardY + 10, cardWidth - 20, thumbnailHeight, 8);
    ctx.clip();
    ctx.drawImage(thumbnailImage, cardX + 10, cardY + 10, cardWidth - 20, thumbnailHeight);
    ctx.restore();

    // Video duration
    const durationWidth = ctx.measureText(videoDetails.duration).width + 20;
    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    roundRect(ctx, cardX + 15, cardY + thumbnailHeight - 30, durationWidth, 25, 4);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.font = '14px "Inter", sans-serif';
    ctx.fillText(videoDetails.duration, cardX + 25, cardY + thumbnailHeight - 13);

    // Video title below the thumbnail with more space
    ctx.fillStyle = '#ffffff';
    ctx.font = '16px "Inter", sans-serif'; // Increased font size
    ctx.textAlign = 'left';
    wrapText(
      ctx,
      videoDetails.title,
      cardX + 15,
      cardY + thumbnailHeight + 30, // Adjusted spacing
      cardWidth - 30,
      24 // Increased line height
    );
  } catch (err) {
    console.error('Error loading video thumbnail:', err);
  }
  ctx.restore();

  // Right section (comment) with dynamic positioning
  const rightWidth = canvas.width - leftWidth - 120;
  const centerX = leftWidth + (canvas.width - leftWidth) / 2;

  // Comment section title with enhanced styling
  ctx.save();
  ctx.fillStyle = '#111827';
  ctx.font = 'bold 36px "Inter", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('Featured Comment', centerX, 80);

  // Comment text with dynamic size and improved readability
  ctx.font = `${textSize}px "Inter", sans-serif`;
  ctx.fillStyle = '#374151';
  ctx.textAlign = 'center';
  wrapText(
    ctx,
    comment.text,
    centerX,
    commentPosition,
    rightWidth,
    textSize * 1.5
  );

  // Commenter info with enhanced styling
  try {
    const commenterImage = await loadImage(comment.authorProfileImageUrl, FALLBACK_IMAGES.PROFILE);
    const imageSize = 64;
    const imageX = centerX - imageSize / 2;
    const imageY = canvas.height - 140; // Fixed position at bottom
    
    ctx.save();
    // Profile picture with shadow
    ctx.shadowColor = 'rgba(0, 0, 0, 0.1)';
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.arc(centerX, imageY + imageSize/2, imageSize/2, 0, Math.PI * 2);
    ctx.clip();
    ctx.drawImage(commenterImage, imageX, imageY, imageSize, imageSize);
    ctx.restore();
    
    // Commenter name with enhanced typography
    ctx.font = 'bold 24px "Inter", sans-serif';
    ctx.fillStyle = '#111827';
    ctx.textAlign = 'center';
    ctx.fillText(comment.authorName, centerX, imageY + imageSize + 30);
    
    // Timestamp with subtle styling
    ctx.font = '16px "Inter", sans-serif';
    ctx.fillStyle = '#6b7280';
    ctx.fillText(videoDetails.publishedAt, centerX, imageY + imageSize + 55);
  } catch (err) {
    console.error('Error loading commenter image:', err);
  }

  ctx.restore();
};

const drawDefaultLeftBackground = (
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number
) => {
  const gradient = ctx.createLinearGradient(0, 0, 0, height);
  gradient.addColorStop(0, '#1e40af');
  gradient.addColorStop(1, '#1e3a8a');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);
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