import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

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

export const fetchVideoComments = async (videoId: string): Promise<CommentData[]> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/comments/${videoId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching comments:', error);
    throw error;
  }
};

export const fetchVideoDetails = async (videoId: string): Promise<VideoData> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/video/${videoId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching video details:', error);
    throw error;
  }
};

export const extractVideoId = (url: string): string | null => {
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