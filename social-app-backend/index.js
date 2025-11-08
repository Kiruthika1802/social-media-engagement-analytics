require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('cloudinary').v2;

// --- CONFIGURATIONS ---
const app = express();
const port = 5000;

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// --- MIDDLEWARE ---
app.use(cors());
app.use(express.json());

// --- DATABASE CONNECTION ---
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('✅ Connected to MongoDB Atlas!'))
    .catch(err => console.error('❌ Connection error:', err));

// --- IMAGE UPLOAD SETUP ---
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: { folder: 'social-app-posts', allowed_formats: ['jpg', 'png', 'jpeg'] },
});
const upload = multer({ storage: storage });

// --- MONGOOSE SCHEMAS ---
const postSchema = new mongoose.Schema({
    text: { type: String, required: true },
    imageUrl: { type: String, required: true },
    likes: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now }
});
const Post = mongoose.model('Post', postSchema);

// --- NEW: Comment Schema ---
const commentSchema = new mongoose.Schema({
    text: { type: String, required: true },
    postId: { type: mongoose.Schema.Types.ObjectId, ref: 'Post', required: true },
    createdAt: { type: Date, default: Date.now }
});
const Comment = mongoose.model('Comment', commentSchema);


// --- API ROUTES ---
app.get('/posts', async (req, res) => {
    const posts = await Post.find().sort({ createdAt: -1 });
    res.json(posts);
});

app.post('/posts', upload.single('image'), async (req, res) => {
    try {
        const newPost = new Post({ text: req.body.text, imageUrl: req.file.path });
        const savedPost = await newPost.save();
        res.status(201).json(savedPost);
    } catch (error) {
        res.status(400).json({ message: 'Error creating post' });
    }
});

app.post('/posts/:id/like', async (req, res) => {
    const post = await Post.findById(req.params.id);
    if (post) {
        post.likes += 1;
        const updatedPost = await post.save();
        res.json(updatedPost);
    } else {
        res.status(404).json({ message: 'Post not found' });
    }
});

// --- NEW: Get comments for a specific post ---
app.get('/posts/:postId/comments', async (req, res) => {
    try {
        const comments = await Comment.find({ postId: req.params.postId }).sort({ createdAt: -1 });
        res.json(comments);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching comments' });
    }
});

// --- NEW: Add a comment to a specific post ---
app.post('/posts/:postId/comments', async (req, res) => {
    try {
        const newComment = new Comment({
            text: req.body.text,
            postId: req.params.postId
        });
        const savedComment = await newComment.save();
        res.status(201).json(savedComment);
    } catch (error) {
        res.status(400).json({ message: 'Error creating comment' });
    }
});

// --- START SERVER ---
app.listen(port, () => {
    console.log(`🚀 Backend server running on http://localhost:${port}`);
});