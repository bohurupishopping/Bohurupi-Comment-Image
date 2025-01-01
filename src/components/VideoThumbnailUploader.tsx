import React from 'react';
import { Image } from 'lucide-react';
import type { VideoData } from '../utils/youtubeApi';
import { extractVideoId } from '../utils/youtubeApi';

interface VideoThumbnailUploaderProps {
  videoUrl: string;
  onUpload: (url: string) => void;
}

const VideoThumbnailUploader: React.FC<VideoThumbnailUploaderProps> = ({
  videoUrl,
  onUpload
}) => {
  const getVideoThumbnail = () => {
    const videoId = extractVideoId(videoUrl);
    return videoId ? `https://api.allorigins.win/raw?url=https://img.youtube.com/vi/${videoId}/maxresdefault.jpg` : '';
  };

  const thumbnailUrl = getVideoThumbnail();

  const handleSetBackground = () => {
    if (thumbnailUrl) {
      onUpload(thumbnailUrl);
    }
  };

  return (
    <div className="flex items-center space-x-4">
      {thumbnailUrl && (
        <>
          <div className="relative w-16 h-16 bg-gray-100 rounded-md overflow-hidden">
            <img
              src={thumbnailUrl}
              alt="Video thumbnail"
              className="w-full h-full object-cover"
            />
          </div>
          <button
            onClick={handleSetBackground}
            className="flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <Image className="w-4 h-4 mr-2" />
            <span className="text-sm">Use Thumbnail</span>
          </button>
        </>
      )}
    </div>
  );
};

export default VideoThumbnailUploader;