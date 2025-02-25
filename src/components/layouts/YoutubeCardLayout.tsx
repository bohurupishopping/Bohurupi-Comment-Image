import type { CommentData, VideoData } from '../../utils/youtubeApi';
import { loadImage, FALLBACK_IMAGES } from '../../utils/imageLoader';

interface SocialCardLayoutProps {
  ctx: CanvasRenderingContext2D;
  comment: CommentData;
  videoDetails: VideoData;
  background: string;
}

export const drawSocialCardLayout = async ({ ctx, comment, videoDetails }: SocialCardLayoutProps) => {
  const canvas = ctx.canvas;
  canvas.width = 1024;
  canvas.height = 1024;

  // Clean white background
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Video thumbnail section (16:9 ratio)
  const thumbnailHeight = canvas.width * (9/20); // Reduced height ratio
  try {
    const thumbnailImage = await loadImage(videoDetails.videoThumbnailUrl, FALLBACK_IMAGES.THUMBNAIL);
    ctx.save();
    
    // Draw thumbnail with enhanced shadow
    ctx.shadowColor = 'rgba(0, 0, 0, 0.15)';
    ctx.shadowBlur = 12;
    ctx.drawImage(thumbnailImage, 0, 0, canvas.width, thumbnailHeight);

    // Add gradient overlay at the bottom of thumbnail
    const gradientHeight = thumbnailHeight * 0.3;
    const titleGradient = ctx.createLinearGradient(0, thumbnailHeight - gradientHeight, 0, thumbnailHeight);
    titleGradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
    titleGradient.addColorStop(1, 'rgba(0, 0, 0, 0.8)');
    ctx.fillStyle = titleGradient;
    ctx.fillRect(0, thumbnailHeight - gradientHeight, canvas.width, gradientHeight);

    // Draw video title on the gradient
    ctx.fillStyle = '#ffffff';
    ctx.font = '600 34px -apple-system, BlinkMacSystemFont, Inter, Roboto, sans-serif'; // Increased font size
    ctx.textAlign = 'center';
    wrapText(ctx, videoDetails.title, canvas.width / 2, thumbnailHeight - gradientHeight/2, canvas.width - 100, 50); // Increased lineHeight
    ctx.restore();
    
    // Add duration badge with improved styling
    ctx.save();
    const durationWidth = ctx.measureText(videoDetails.duration).width + 40;
    ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
    roundRect(ctx, canvas.width - durationWidth - 30, 20, durationWidth, 38, 6); // Increased space
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.font = '600 20px -apple-system, BlinkMacSystemFont, Inter, Roboto, sans-serif'; // Increased font size
    ctx.textAlign = 'center';
    ctx.fillText(videoDetails.duration, canvas.width - durationWidth/2 - 30, 46); // Increased space
    ctx.restore();
  } catch (err) {
    console.error('Error loading thumbnail:', err);
    // Fallback gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, thumbnailHeight);
    gradient.addColorStop(0, '#f1f5f9');
    gradient.addColorStop(1, '#e2e8f0');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, thumbnailHeight);
  }

  // Main content section with enhanced card-like styling
  const contentStartY = thumbnailHeight + 40; // Increased spacing
  
  // Add subtle card shadow with improved depth
  ctx.save();
  ctx.shadowColor = 'rgba(0, 0, 0, 0.12)';
  ctx.shadowBlur = 16;
  ctx.shadowOffsetY = 4;
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, thumbnailHeight, canvas.width, canvas.height - thumbnailHeight);
  ctx.restore();

  // Channel info section with improved spacing and larger elements
  try {
    const channelImage = await loadImage(videoDetails.channelThumbnailUrl, FALLBACK_IMAGES.CHANNEL);
    ctx.save();
    
    // Channel avatar with improved styling
    const avatarSize = 80; // Increased size
    const avatarX = (canvas.width - avatarSize) / 2; // Centered
    const avatarY = contentStartY;
    
    // Draw avatar shadow
    ctx.shadowColor = 'rgba(0, 0, 0, 0.15)';
    ctx.shadowBlur = 12;
    ctx.beginPath();
    ctx.arc(avatarX + avatarSize/2, avatarY + avatarSize/2, avatarSize/2, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.fill();
    
    // Draw avatar image
    ctx.clip();
    ctx.drawImage(channelImage, avatarX, avatarY, avatarSize, avatarSize);
    ctx.restore();

    // Channel info with improved typography
    ctx.textAlign = 'center';
    
    // Channel name with larger font
    ctx.font = '600 28px -apple-system, BlinkMacSystemFont, Inter, Roboto, sans-serif'; // Increased font size
    ctx.fillStyle = '#0f0f0f';
    ctx.fillText(videoDetails.channelTitle, canvas.width / 2, contentStartY + 100); // Increased spacing

    // Verification badge
    if (videoDetails.isVerified) {
      const badgeY = contentStartY + 92; // Increased spacing
      ctx.save();
      ctx.fillStyle = '#606060';
      ctx.beginPath();
      ctx.arc(canvas.width / 2 + ctx.measureText(videoDetails.channelTitle).width / 2 + 25, badgeY, 12, 0, Math.PI * 2); // Increased size
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.font = '600 16px -apple-system'; // Increased font size
      ctx.fillText('✓', canvas.width / 2 + ctx.measureText(videoDetails.channelTitle).width / 2 + 20, badgeY + 4); // Increased space
      ctx.restore();
    }

    // Channel stats with larger font
    ctx.font = '400 20px -apple-system, BlinkMacSystemFont, Inter, Roboto, sans-serif'; // Increased font size
    ctx.fillStyle = '#606060';
    ctx.fillText(videoDetails.publishedAt, canvas.width / 2, contentStartY + 130); // Increased spacing
  } catch (err) {
    console.error('Error loading channel image:', err);
  }

  // Video stats with improved icons and centered spacing
  const statsY = contentStartY + 180; // Increased spacing
  
  // Stats with enhanced icons and improved layout
  const stats = [
    { icon: '▶', value: videoDetails.viewCount + ' views', color: '#FF0000' },
    { icon: '👍', value: videoDetails.likeCount, color: '#065FD4' },
    { icon: '💬', value: videoDetails.commentCount, color: '#065FD4' }
  ];

  // Calculate total width of stats with new spacing
  let totalWidth = 0;
  const iconSpacing = 16; // Increased space between icon and value
  const statSpacing = 80; // Increased space between stat groups

  ctx.font = '600 24px -apple-system, BlinkMacSystemFont, Inter, Roboto, sans-serif'; // Increased font size
  stats.forEach((stat, index) => {
    const valueWidth = ctx.measureText(stat.value).width;
    const iconWidth = 32; // Increased icon width
    totalWidth += iconWidth + iconSpacing + valueWidth;
    if (index < stats.length - 1) totalWidth += statSpacing;
  });

  // Start position to center stats
  let statX = (canvas.width - totalWidth) / 2;

  stats.forEach((stat, index) => {
    ctx.save();
    
    // Draw icon with enhanced styling
    ctx.fillStyle = stat.color;
    ctx.font = '600 32px -apple-system'; // Increased icon size
    ctx.textBaseline = 'middle';
    ctx.fillText(stat.icon, statX, statsY);
    
    // Draw value with improved typography
    ctx.fillStyle = '#0F0F0F';
    ctx.font = '600 24px -apple-system, BlinkMacSystemFont, Inter, Roboto, sans-serif'; // Increased font size
    const valueX = statX + 32 + iconSpacing; // Increased space
    ctx.fillText(stat.value, valueX, statsY);
    
    // Calculate next stat position
    statX += 32 + iconSpacing + ctx.measureText(stat.value).width + statSpacing;
    
    // Draw separator if not last item
    if (index < stats.length - 1) {
      ctx.fillStyle = '#E5E7EB';
      ctx.fillRect(statX - statSpacing/2, statsY - 15, 2, 30);
    }
    
    ctx.restore();
  });


  // Comments section with improved separation
  const commentsStartY = statsY + 60; // Increased spacing
  
  // Section divider with enhanced styling
  ctx.strokeStyle = '#e5e7eb';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(canvas.width * 0.2, commentsStartY - 20);
  ctx.lineTo(canvas.width * 0.8, commentsStartY - 20);
  ctx.stroke();

  // Comments header centered
  ctx.fillStyle = '#0f0f0f';
  ctx.font = '600 28px -apple-system, BlinkMacSystemFont, Inter, Roboto, sans-serif'; // Increased font size
  ctx.textAlign = 'center';
  ctx.fillText('💬 Comments', canvas.width / 2, commentsStartY + 10);

  // Featured comment with improved styling and centered
  const commentY = commentsStartY + 50;
  try {
    const commenterImage = await loadImage(comment.authorProfileImageUrl, FALLBACK_IMAGES.PROFILE);
    ctx.save();
    
    // Commenter avatar centered
    const commentAvatarSize = 72; // Increased size
    const commentAvatarX = (canvas.width - commentAvatarSize) / 2;
    
    ctx.shadowColor = 'rgba(0, 0, 0, 0.15)';
    ctx.shadowBlur = 12;
    ctx.beginPath();
    ctx.arc(commentAvatarX + commentAvatarSize/2, commentY + commentAvatarSize/2, commentAvatarSize/2, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.fill();
    ctx.clip();
    ctx.drawImage(commenterImage, commentAvatarX, commentY, commentAvatarSize, commentAvatarSize);
    ctx.restore();

    // Comment content centered
    ctx.textAlign = 'center';
    
    // Author name
    ctx.fillStyle = '#0f0f0f';
    ctx.font = '600 24px -apple-system, BlinkMacSystemFont, Inter, Roboto, sans-serif'; // Increased font size
    ctx.fillText(comment.authorName, canvas.width / 2, commentY + commentAvatarSize + 30);

    // Comment text
    ctx.fillStyle = '#0f0f0f';
    ctx.font = '400 26px -apple-system, BlinkMacSystemFont, Inter, Roboto, sans-serif'; // Increased font size
    wrapText(ctx, comment.text, canvas.width / 2, commentY + commentAvatarSize + 70, canvas.width - 100, 40); // Increased lineHeight
  } catch (err) {
    console.error('Error loading commenter image:', err);
  }
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
