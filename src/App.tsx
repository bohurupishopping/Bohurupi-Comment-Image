import React, { useState } from 'react';
import { Youtube, Upload, Layout, Image as ImageIcon, Download } from 'lucide-react';
import VideoInput from './components/VideoInput';
import CommentSelector from './components/CommentSelector';
import BackgroundUploader from './components/BackgroundUploader';
import VideoThumbnailUploader from './components/VideoThumbnailUploader';
import LayoutSelector from './components/LayoutSelector';
import QuotePreview from './components/QuotePreview';
import { fetchVideoComments, fetchVideoDetails, extractVideoId, CommentData, VideoData } from './utils/youtubeApi';
import { TextSizeAdjuster } from './components/TextSizeAdjuster';
import { CommentPositionAdjuster } from './components/CommentPositionAdjuster';

function App() {
  const [videoUrl, setVideoUrl] = useState('');
  const [comments, setComments] = useState<CommentData[]>([]);
  const [selectedComment, setSelectedComment] = useState<CommentData | null>(null);
  const [background, setBackground] = useState('');
  const [layout, setLayout] = useState('default');
  const [videoDetails, setVideoDetails] = useState<VideoData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [textSize, setTextSize] = useState(48);
  const [commentPosition, setCommentPosition] = useState(450);

  const handleVideoSubmit = async (url: string) => {
    setVideoUrl(url);
    setError(null);
    setIsLoading(true);
    const videoId = extractVideoId(url);
    if (videoId) {
      try {
        const [fetchedComments, fetchedVideoDetails] = await Promise.all([
          fetchVideoComments(videoId),
          fetchVideoDetails(videoId),
        ]);
        setComments(fetchedComments);
        setVideoDetails(fetchedVideoDetails);
        setBackground(''); // Reset background when a new video is loaded
        setSelectedComment(null); // Reset selected comment
      } catch (err) {
        console.error('Error fetching video data:', err);
        setError('Failed to fetch video data. Please try again.');
      } finally {
        setIsLoading(false);
      }
    } else {
      setError('Invalid YouTube URL');
      setIsLoading(false);
    }
  };

  const handleGenerate = () => {
    setIsGenerating(true);
    // Simulate generation process
    setTimeout(() => {
      setIsGenerating(false);
    }, 2000);
  };

  return (
    <div className="min-h-screen p-8" style={{ background: 'linear-gradient(0deg, #fddb92, #d1fdff)' }}>
      <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-lg overflow-hidden">
        <h1 className="text-3xl font-bold text-center py-6 bg-gradient-to-r from-red-600 to-red-800 text-white">YouTube Quote Maker by Pritam</h1>
        <div className="p-6 space-y-6">
          <VideoInput onSubmit={handleVideoSubmit} />
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
              <strong className="font-bold">Error: </strong>
              <span className="block sm:inline">{error}</span>
            </div>
          )}
          {isLoading ? (
            <div className="text-center">
              <p className="text-gray-600">Loading...</p>
            </div>
          ) : (
            comments.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <CommentSelector comments={comments} onSelect={setSelectedComment} />
                  <div className="flex space-x-4">
                    <div className="space-y-4">
                      <BackgroundUploader onUpload={setBackground} />
                      {videoUrl && (
                        <VideoThumbnailUploader
                          videoUrl={videoUrl}
                          onUpload={setBackground}
                        />
                      )}
                    </div>
                    <LayoutSelector onSelect={setLayout} />
                  </div>
                  <TextSizeAdjuster textSize={textSize} onTextSizeChange={setTextSize} />
                  <CommentPositionAdjuster position={commentPosition} onPositionChange={setCommentPosition} />
                  <button
                    onClick={handleGenerate}
                    disabled={!selectedComment || isGenerating}
                    className={`w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-4 rounded-lg transition duration-300 ease-in-out ${
                      (!selectedComment || isGenerating) && 'opacity-50 cursor-not-allowed'
                    }`}
                  >
                    {isGenerating ? 'Generating...' : 'Generate Quote Image'}
                  </button>
                </div>
                <div>
                  {selectedComment && videoDetails && (
                    <QuotePreview
                      comment={selectedComment}
                      videoDetails={videoDetails}
                      background={background}
                      layout={layout}
                      textSize={textSize}
                      commentPosition={commentPosition}
                    />
                  )}
                </div>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
