import type { CommentData, VideoData } from '../../utils/youtubeApi';
import { loadImage } from '../../utils/imageLoader';

interface VintageLayoutProps {
  ctx: CanvasRenderingContext2D;
  comment: CommentData;
  videoDetails: VideoData;
  background: string;
}

export const drawVintageLayout = async ({ ctx, comment, videoDetails, background }: VintageLayoutProps) => {
  // Canvas dimensions
  const canvas = ctx.canvas;
  canvas.width = 1024;
  canvas.height = 1024;

  // Background
  const mainBackground = async (ctx: CanvasRenderingContext2D, background: string) => {
    if (background) {
      try {
        const backgroundImage = await loadImage(background);
        ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);
        return;
      } catch (err) {
        console.error('Error loading background image:', err);
      }
    }
    // fallback
    ctx.fillStyle = '#f5f5dc'; // Light beige
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  };
  await mainBackground(ctx, background);

  // Border
  const borderWidth = 15;
  const innerRectX = borderWidth;
  const innerRectY = borderWidth;
  const innerRectWidth = canvas.width - 2 * borderWidth;
  const innerRectHeight = canvas.height - 2 * borderWidth;
  ctx.strokeStyle = '#c0b283'; // Darker beige for border
  ctx.lineWidth = borderWidth;
  roundRectBorder(ctx, innerRectX, innerRectY, innerRectWidth, innerRectHeight, 30);
  ctx.stroke();

  // Paper Texture for Content Area
  const contentX = 120; // Increased margin
  const contentY = 120; // Increased margin
  const contentWidth = canvas.width - 2 * contentX;
  const contentHeight = canvas.height - 2 * contentY;

  ctx.fillStyle = '#f5f5dc';
  ctx.shadowColor = 'rgba(0, 0, 0, 0.1)'; // Softer shadow
  ctx.shadowBlur = 5;
  roundRect(ctx, contentX, contentY, contentWidth, contentHeight, 30); // Distressed edges
  ctx.shadowBlur = 0; // Reset shadow for text

  // Apply paper texture - simplified for now
  applyPaperTexture(ctx, contentX, contentY, contentWidth, contentHeight, 0.1);

  // Comment text
  ctx.shadowColor = 'rgba(0, 0, 0, 0.2)';
  ctx.shadowBlur = 3;
  ctx.fillStyle = '#78503f'; // Slightly warmer
  ctx.font = 'italic 48px Cormorant Garamond';
  ctx.textAlign = 'left'; // Align left
  wrapText(ctx, comment.text, contentX + 50, 550, contentWidth - 100, 60); // Adjusted maxWidth

  // Author name
  ctx.shadowBlur = 2;
  ctx.fillStyle = '#8b4513'; // Slightly warmer
  ctx.font = 'bold 36px Playfair Display';
  ctx.textAlign = 'left';
  const authorName = `— ${comment.authorName}`;
  ctx.fillText(authorName, contentX + 50, 680);

  // Draw channel logo with frame (stamp/seal effect)
  try {
    const channelImage = await loadImage(videoDetails.channelThumbnailUrl);
    ctx.save();
    ctx.shadowColor = 'rgba(0, 0, 0, 0.2)';
    ctx.shadowBlur = 5;
    ctx.beginPath();
    ctx.arc(canvas.width / 2, 880, 60, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.fill();
    ctx.lineWidth = 4;
    ctx.strokeStyle = '#c0b283';
    ctx.stroke();
    ctx.clip();
    ctx.drawImage(channelImage, canvas.width / 2 - 50, 830, 100, 100);
    ctx.restore();
  } catch (err) {
    console.error('Error loading channel logo:', err);
    // fallback
    ctx.save();
    ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
    ctx.shadowBlur = 5;
    ctx.beginPath();
    ctx.arc(canvas.width / 2, 880, 60, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.fill();
    ctx.lineWidth = 4;
    ctx.strokeStyle = '#c0b283';
    ctx.stroke();
    ctx.restore();
  }

  // Channel name
  ctx.fillStyle = '#8b4513';
  ctx.font = 'bold 24px Playfair Display'; // Decrease the size
  ctx.textAlign = 'center';
  ctx.fillText(videoDetails.channelTitle, canvas.width / 2, 1000);

  // Subtle grain/noise effect (optional)
  //applyGrain(ctx, canvas.width, canvas.height, 0.05);
};

const applyPaperTexture = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  opacity: number
) => {
  const imageData = ctx.getImageData(x, y, width, height);
  const data = imageData.data;

  for (let i = 0; i < data.length; i += 4) {
    const value = Math.floor(Math.random() * 20); // Adjust for texture intensity
    data[i] += value; // Red
    data[i + 1] += value; // Green
    data[i + 2] += value; // Blue
  }
  ctx.putImageData(imageData, x, y);
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
  //add a line break before —
  if (line.includes('—')) {
    const parts = line.split('—');
    ctx.fillText(parts[0].trim(), x, y);
    y += lineHeight;
    ctx.fillText(`— ${parts[1].trim()}`, x, y);
  } else {
    ctx.fillText(line, x, y);
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
  ctx.fill();
};

const roundRectBorder = (
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
