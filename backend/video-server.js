import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { MongoClient, GridFSBucket, ObjectId } from 'mongodb';
import multer from 'multer';
import { GridFsStorage } from 'multer-gridfs-storage';
import path from 'path';

dotenv.config();

const app = express();
const PORT = 3003;

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI;
const DB_NAME = process.env.DB_NAME || 'hirezen';

let mongoClient;
let gfsBucket;
let upload;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connect to MongoDB and initialize GridFS
async function initializeMongoDB() {
  try {
    console.log('🔌 Connecting to MongoDB Atlas...');
    mongoClient = new MongoClient(MONGODB_URI);
    await mongoClient.connect();

    const db = mongoClient.db(DB_NAME);

    // Initialize GridFS bucket for videos
    gfsBucket = new GridFSBucket(db, {
      bucketName: 'videos'
    });

    // Configure multer-gridfs-storage for video uploads
    const storage = new GridFsStorage({
      url: MONGODB_URI,
      options: { useNewUrlParser: true, useUnifiedTopology: true },
      file: (req, file) => {
        return new Promise((resolve, reject) => {
          // Validate file type
          const allowedTypes = ['video/webm', 'video/mp4'];
          if (!allowedTypes.includes(file.mimetype)) {
            reject(new Error('Only .webm and .mp4 video files are allowed'));
            return;
          }

          // Generate unique filename
          const filename = `${Date.now()}-interview-video${path.extname(file.originalname) || '.webm'}`;

          const fileInfo = {
            filename: filename,
            bucketName: 'videos',
            metadata: {
              originalName: file.originalname,
              mimeType: file.mimetype,
              uploadDate: new Date(),
              size: file.size,
              // Additional metadata from request body
              candidateId: req.body.candidateId,
              candidateName: req.body.candidateName,
              candidateEmail: req.body.candidateEmail,
              jobId: req.body.jobId,
              jobPosition: req.body.jobPosition,
              sessionId: req.body.sessionId
            }
          };

          resolve(fileInfo);
        });
      }
    });

    // Configure multer with GridFS storage
    upload = multer({
      storage: storage,
      limits: {
        fileSize: 500 * 1024 * 1024, // 500MB limit
      },
      fileFilter: (req, file, cb) => {
        const allowedTypes = ['video/webm', 'video/mp4'];
        if (allowedTypes.includes(file.mimetype)) {
          cb(null, true);
        } else {
          cb(new Error('Only .webm and .mp4 video files are allowed'));
        }
      }
    });

    // Test collections
    const collections = await db.collections();
    console.log('📋 Available collections:', collections.map(c => c.collectionName).join(', '));

    console.log('✅ MongoDB Atlas connected successfully!');
    console.log('🎬 GridFS bucket "videos" initialized');
    console.log('📊 Database:', DB_NAME);

  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    console.error('🔍 Connection string:', MONGODB_URI.replace(/:([^:@]{4})[^:@]*@/, ':$1****@'));
    throw error;
  }
}

// Routes

// POST /upload-video - Upload video file to GridFS
app.post('/upload-video', upload ? upload.single('video') : multer({ storage: multer.memoryStorage() }).single('video'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No video file uploaded'
      });
    }

    console.log('🎬 Video uploaded successfully to GridFS:', {
      filename: req.file.filename,
      size: req.file.size,
      id: req.file.id,
      mimeType: req.file.mimetype
    });

    res.json({
      success: true,
      fileId: req.file.id,
      filename: req.file.filename,
      size: req.file.size,
      mimeType: req.file.mimetype,
      message: 'Video uploaded successfully to GridFS'
    });

  } catch (error) {
    console.error('❌ Error uploading video:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// GET /video/:id - Stream video from GridFS
app.get('/video/:id', async (req, res) => {
  try {
    const fileId = req.params.id;

    if (!ObjectId.isValid(fileId)) {
      return res.status(400).json({ error: 'Invalid file ID' });
    }

    // Find file in GridFS
    const files = await gfsBucket.find({ _id: new ObjectId(fileId) }).toArray();

    if (!files || files.length === 0) {
      return res.status(404).json({ error: 'Video not found' });
    }

    const file = files[0];

    // Set appropriate headers
    res.setHeader('Content-Type', file.metadata?.mimeType || 'video/webm');
    res.setHeader('Content-Length', file.length);
    res.setHeader('Accept-Ranges', 'bytes');
    res.setHeader('Cache-Control', 'public, max-age=31536000'); // Cache for 1 year

    // Handle range requests for video seeking
    const range = req.headers.range;
    if (range) {
      const parts = range.replace(/bytes=/, '').split('-');
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : file.length - 1;
      const chunksize = (end - start) + 1;

      res.status(206);
      res.setHeader('Content-Range', `bytes ${start}-${end}/${file.length}`);
      res.setHeader('Content-Length', chunksize);

      // Stream specific range
      const downloadStream = gfsBucket.openDownloadStream(file._id, {
        start: start,
        end: end + 1
      });
      downloadStream.pipe(res);
    } else {
      // Stream entire file
      const downloadStream = gfsBucket.openDownloadStream(file._id);
      downloadStream.pipe(res);
    }

  } catch (error) {
    console.error('❌ Error streaming video:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /video/download/:id - Force download video from GridFS
app.get('/video/download/:id', async (req, res) => {
  try {
    const fileId = req.params.id;

    if (!ObjectId.isValid(fileId)) {
      return res.status(400).json({ error: 'Invalid file ID' });
    }

    // Find file in GridFS
    const files = await gfsBucket.find({ _id: new ObjectId(fileId) }).toArray();

    if (!files || files.length === 0) {
      return res.status(404).json({ error: 'Video not found' });
    }

    const file = files[0];
    const filename = file.filename || `interview-video-${fileId}.webm`;

    // Set headers for download
    res.setHeader('Content-Type', file.metadata?.mimeType || 'video/webm');
    res.setHeader('Content-Length', file.length);
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    // Stream file for download
    const downloadStream = gfsBucket.openDownloadStream(file._id);
    downloadStream.pipe(res);

  } catch (error) {
    console.error('❌ Error downloading video:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /videos - List all uploaded videos (for debugging/admin purposes)
app.get('/videos', async (req, res) => {
  try {
    const files = await gfsBucket.find().sort({ uploadDate: -1 }).limit(50).toArray();

    const videos = files.map(file => ({
      id: file._id,
      filename: file.filename,
      size: file.length,
      sizeMB: (file.length / (1024 * 1024)).toFixed(2),
      uploadDate: file.uploadDate,
      mimeType: file.metadata?.mimeType,
      metadata: {
        candidateId: file.metadata?.candidateId,
        candidateName: file.metadata?.candidateName,
        candidateEmail: file.metadata?.candidateEmail,
        jobId: file.metadata?.jobId,
        jobPosition: file.metadata?.jobPosition,
        sessionId: file.metadata?.sessionId
      }
    }));

    res.json({
      success: true,
      videos: videos,
      count: videos.length
    });

  } catch (error) {
    console.error('❌ Error listing videos:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Health check
app.get('/health', async (req, res) => {
  try {
    const db = mongoClient.db(DB_NAME);
    const collections = await db.collections();

    res.json({
      status: 'OK',
      message: 'Video Server (GridFS)',
      mongodb: mongoClient ? 'connected' : 'disconnected',
      database: DB_NAME,
      gridfs: gfsBucket ? 'initialized' : 'not initialized',
      collections: collections.map(c => c.collectionName),
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      status: 'ERROR',
      message: 'Health check failed',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Unhandled error:', error);
  res.status(500).json({
    success: false,
    error: 'Internal server error'
  });
});

// Initialize server
async function startServer() {
  try {
    await initializeMongoDB();

    app.listen(PORT, () => {
      console.log('🎬 HireZen Video Server (GridFS) running!');
      console.log(`📡 Port: ${PORT}`);
      console.log(`🏥 Health: http://localhost:${PORT}/health`);
      console.log(`📤 Upload: POST /upload-video`);
      console.log(`🎥 Stream: GET /video/:id`);
      console.log(`⬇️ Download: GET /video/download/:id`);
      console.log(`📋 List: GET /videos`);
      console.log('✅ GridFS upload initialized:', !!upload);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

startServer();