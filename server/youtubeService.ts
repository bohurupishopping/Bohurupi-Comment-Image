import 'dotenv/config';

const API_KEY = process.env.YOUTUBE_API_KEY;
const BASE_URL = 'https://www.googleapis.com/youtube/v3';

export interface CommentData {
  text: string;
  authorName: string;
  authorProfileImageUrl: string;
}

export interface VideoData {
  title: string;
  channelTitle: string;
  channelThumbnailUrl: string;
  videoThumbnailUrl: string;
  viewCount: string;
  likeCount: string;
  commentCount: string;
  publishedAt: string;
  duration: string;
  isVerified: boolean;
}

const formatCount = (count: number): string => {
  if (count >= 1000000000) {
    return (count / 1000000000).toFixed(1) + 'B';
  }
  if (count >= 1000000) {
    return (count / 1000000).toFixed(1) + 'M';
  }
  if (count >= 1000) {
    return (count / 1000).toFixed(1) + 'K';
  }
  return count.toString();
};

const formatDuration = (duration: string): string => {
  const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
  if (!match) return '';

  const hours = match[1] ? parseInt(match[1]) : 0;
  const minutes = match[2] ? parseInt(match[2]) : 0;
  const seconds = match[3] ? parseInt(match[3]) : 0;

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

const getRelativeTime = (date: string): string => {
  const now = new Date();
  const published = new Date(date);
  const diff = now.getTime() - published.getTime();
  
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const months = Math.floor(days / 30);
  const years = Math.floor(days / 365);

  if (years > 0) return `${years} year${years > 1 ? 's' : ''} ago`;
  if (months > 0) return `${months} month${months > 1 ? 's' : ''} ago`;
  if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
  if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  return `${seconds} second${seconds > 1 ? 's' : ''} ago`;
};

const sanitizeCommentText = (text: string): string => {
  return text
    .replace(/<[^>]*>/g, '')
    .replace(/[#$@]/g, '')
    .replace(/\b\d{2,}\b/g, '')
    .replace(/\s{2,}/g, ' ')
    .trim();
};

export const fetchVideoComments = async (videoId: string): Promise<CommentData[]> => {
  if (!API_KEY) {
    throw new Error('YouTube API key is not set');
  }
  try {
    const response = await fetch(`${BASE_URL}/commentThreads?part=snippet&videoId=${videoId}&maxResults=99&key=${API_KEY}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    if (!data.items) {
      throw new Error('No comments found');
    }
    return data.items.map((item: any) => ({
      text: sanitizeCommentText(item.snippet.topLevelComment.snippet.textDisplay),
      authorName: item.snippet.topLevelComment.snippet.authorDisplayName,
      authorProfileImageUrl: item.snippet.topLevelComment.snippet.authorProfileImageUrl.replace('http://', 'https://'),
    }));
  } catch (error) {
    console.error('Error fetching comments:', error);
    throw error;
  }
};

export const fetchVideoDetails = async (videoId: string): Promise<VideoData> => {
  if (!API_KEY) {
    throw new Error('YouTube API key is not set');
  }
  try {
    const videoResponse = await fetch(
      `${BASE_URL}/videos?part=snippet,statistics,contentDetails&id=${videoId}&key=${API_KEY}`
    );

    if (!videoResponse.ok) {
      throw new Error('Failed to fetch video data');
    }

    const videoData = await videoResponse.json();
    if (!videoData.items?.[0]) {
      throw new Error('Video not found');
    }

    const video = videoData.items[0];
    const channelId = video.snippet.channelId;

    const channelResponse = await fetch(
      `${BASE_URL}/channels?part=snippet,statistics&id=${channelId}&key=${API_KEY}`
    );

    if (!channelResponse.ok) {
      throw new Error('Failed to fetch channel data');
    }

    const channelData = await channelResponse.json();
    if (!channelData.items?.[0]) {
      throw new Error('Channel not found');
    }

    const channel = channelData.items[0];

    return {
      title: video.snippet.title,
      channelTitle: video.snippet.channelTitle,
      channelThumbnailUrl: channel.snippet.thumbnails.default.url.replace('http://', 'https://'),
      videoThumbnailUrl: video.snippet.thumbnails.maxres?.url || video.snippet.thumbnails.high.url,
      viewCount: formatCount(parseInt(video.statistics.viewCount)),
      likeCount: formatCount(parseInt(video.statistics.likeCount)),
      commentCount: formatCount(parseInt(video.statistics.commentCount)),
      publishedAt: getRelativeTime(video.snippet.publishedAt),
      duration: formatDuration(video.contentDetails.duration),
      isVerified: parseInt(channel.statistics.subscriberCount) >= 100000
    };
  } catch (error) {
    console.error('Error fetching video details:', error);
    throw error;
  }
};

export const extractVideoId = (url: string) => {
  if (!url) return null;

  // Handle mobile URLs
  url = url.replace('m.youtube.com', 'youtube.com');

  // Handle various YouTube URL formats
  const patterns = [
    // Standard watch URLs
    /(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?v=([^#&?]*)/,
    // Short youtu.be URLs
    /(?:https?:\/\/)?(?:www\.)?youtu\.be\/([^#&?]*)/,
    // Embed URLs
    /(?:https?:\/\/)?(?:www\.)?youtube\.com\/embed\/([^#&?]*)/,
    // Short URLs with v parameter
    /(?:https?:\/\/)?(?:www\.)?youtube\.com\/v\/([^#&?]*)/,
    // Channel video URLs
    /(?:https?:\/\/)?(?:www\.)?youtube\.com\/.*[?&]v=([^#&?]*)/
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1] && match[1].length === 11) {
      return match[1];
    }
  }

  return null;
};