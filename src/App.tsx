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
  const [textSize, setTextSize] = useState(42);
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
        setBackground('');
        setSelectedComment(null);
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

  return (
    <div 
      className="min-h-screen p-4 md:p-8"
      style={{
        background: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='10' numOctaves='3' stitchTiles='stitch'/%3E%3CfeComponentTransfer%3E%3CfeFuncR type='table' tableValues='1.00 1.00'/%3E%3CfeFuncG type='table' tableValues='1.00 1.00'/%3E%3CfeFuncB type='table' tableValues='1.00 1.00'/%3E%3C/feComponentTransfer%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.75'/%3E%3C/svg%3E"), radial-gradient(circle at 90.94827586206897% 97.57834757834758%, #ec948e 0px, transparent 70%), radial-gradient(circle at 3.0172413793103448% 1.8518518518518516%, #6553e9 0px, transparent 70%)`,
        backgroundColor: 'white',
        backgroundPosition: 'center'
      }}
    >
      <div className="max-w-4xl mx-auto bg-white/90 backdrop-blur-lg rounded-3xl shadow-xl overflow-hidden">
        <div className="bg-gradient-to-r from-red-600 to-red-800 p-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1611162617474-5b21e879e113')] bg-cover bg-center opacity-10"></div>
          <h1 className="text-3xl md:text-4xl font-bold text-center text-white relative z-10 mb-2">
            YouTube Quote Maker
          </h1>
          <p className="text-white/80 text-center relative z-10">by Pritam</p>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <VideoInput onSubmit={handleVideoSubmit} />
          </div>

          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg animate-slide-in" role="alert">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}

          {isLoading ? (
            <div className="flex items-center justify-center p-6">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
            </div>
          ) : (
            comments.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-in">
                <div className="space-y-3">
                  <div className="bg-white/80 backdrop-blur rounded-xl shadow-sm p-3">
                    <CommentSelector comments={comments} onSelect={setSelectedComment} />
                  </div>

                  <div className="bg-white/80 backdrop-blur rounded-xl shadow-sm p-3 space-y-3">
                    <div className="grid grid-cols-2 gap-2">
                      <BackgroundUploader onUpload={setBackground} />
                      {videoUrl && (
                        <VideoThumbnailUploader
                          videoUrl={videoUrl}
                          onUpload={setBackground}
                        />
                      )}
                    </div>
                    <LayoutSelector onSelect={setLayout} />
                    <TextSizeAdjuster textSize={textSize} onTextSizeChange={setTextSize} />
                    <CommentPositionAdjuster position={commentPosition} onPositionChange={setCommentPosition} />
                  </div>
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