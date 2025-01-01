const API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY;
if (!API_KEY) {
  console.error('YouTube API key is not set. Please set the VITE_YOUTUBE_API_KEY environment variable.');
}
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
}

const sanitizeCommentText = (text: string): string => {
  // Remove unwanted special characters and numeric codes
  return text
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
    const response = await fetch(`${BASE_URL}/commentThreads?part=snippet&videoId=${videoId}&maxResults=50&key=${API_KEY}`);
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
    const videoResponse = await fetch(`${BASE_URL}/videos?part=snippet&id=${videoId}&key=${API_KEY}`);
    if (!videoResponse.ok) {
      throw new Error(`HTTP error! status: ${videoResponse.status}`);
    }
    const videoData = await videoResponse.json();
    if (!videoData.items || videoData.items.length === 0) {
      throw new Error('Video not found');
    }

    const channelId = videoData.items[0].snippet.channelId;
    const channelResponse = await fetch(`${BASE_URL}/channels?part=snippet&id=${channelId}&key=${API_KEY}`);
    if (!channelResponse.ok) {
      throw new Error(`HTTP error! status: ${channelResponse.status}`);
    }
    const channelData = await channelResponse.json();
    if (!channelData.items || channelData.items.length === 0) {
      throw new Error('Channel not found');
    }

    return {
      title: videoData.items[0].snippet.title,
      channelTitle: videoData.items[0].snippet.channelTitle,
      channelThumbnailUrl: channelData.items[0].snippet.thumbnails.default.url.replace('http://', 'https://'),
      videoThumbnailUrl: videoData.items[0].snippet.thumbnails.high.url.replace('http://', 'https://'),
    };
  } catch (error) {
    console.error('Error fetching video details:', error);
    throw error;
  }
};

export const extractVideoId = (url: string) => {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
};
