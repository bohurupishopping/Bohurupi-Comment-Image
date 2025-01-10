import React, { useState } from 'react';
import { Youtube, Search } from 'lucide-react';

interface VideoInputProps {
  onSubmit: (url: string) => void;
}

const VideoInput: React.FC<VideoInputProps> = ({ onSubmit }) => {
  const [url, setUrl] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(url);
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-center space-x-2">
      <Youtube className="text-red-500" />
      <input
        type="text"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        placeholder="Enter YouTube video URL"
        className="flex-grow border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <button
        type="submit"
        className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-3 rounded transition duration-300 ease-in-out"
      >
        <Search className="h-5 w-5" />
      </button>
    </form>
  );
};

export default VideoInput;
