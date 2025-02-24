import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

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
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
};