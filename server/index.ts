import express, { Request, Response, RequestHandler } from 'express';
import cors from 'cors';
import { fetchVideoComments, fetchVideoDetails, extractVideoId } from './youtubeService';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Health check endpoint
const healthCheck: RequestHandler = (_req, res) => {
  res.json({ status: 'ok' });
};
app.get('/api/health', healthCheck);

// Video details endpoint
const getVideoDetails: RequestHandler = async (req, res) => {
  try {
    const videoId = req.params.videoId;
    const videoDetails = await fetchVideoDetails(videoId);
    res.json(videoDetails);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Failed to fetch video details' });
  }
};
app.get('/api/video/:videoId', getVideoDetails);

// Video comments endpoint
const getVideoComments: RequestHandler = async (req, res) => {
  try {
    const videoId = req.params.videoId;
    const comments = await fetchVideoComments(videoId);
    res.json(comments);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Failed to fetch comments' });
  }
};
app.get('/api/comments/:videoId', getVideoComments);

// Extract video ID endpoint
const extractVideoIdHandler: RequestHandler = (req, res) => {
  try {
    const { url } = req.body as { url: string };
    const videoId = extractVideoId(url);
    if (!videoId) {
      res.status(400).json({ error: 'Invalid YouTube URL' });
      return;
    }
    res.json({ videoId });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Failed to extract video ID' });
  }
};
app.post('/api/extract-video-id', extractVideoIdHandler);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});