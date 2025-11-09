// src/Post.js

import React, { useState } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:5000';

export function Post({ post, onPostLiked }) {
    const [comments, setComments] = useState([]);
    const [showComments, setShowComments] = useState(false);
    const [newComment, setNewComment] = useState('');

    const fetchComments = async () => {
        try {
            const response = await axios.get(`${API_URL}/posts/${post._id}/comments`);
            setComments(response.data);
        } catch (error) {
            console.error("Error fetching comments:", error);
        }
    };

    const handleToggleComments = () => {
        if (!showComments) {
            fetchComments();
        }
        setShowComments(!showComments);
    };

    const handleCommentSubmit = async (e) => {
        e.preventDefault();
        if (!newComment.trim()) return;
        try {
            await axios.post(`${API_URL}/posts/${post._id}/comments`, { text: newComment });
            setNewComment('');
            fetchComments(); // Refresh comments after posting
        } catch (error) {
            console.error("Error creating comment:", error);
        }
    };

    const handleShare = async () => {
        const shareData = {
            title: 'Check out this post!',
            text: post.text,
            url: window.location.href, // In a real app, this would be a direct link to the post
        };
        try {
            if (navigator.share) {
                await navigator.share(shareData);
            } else {
                // Fallback for browsers that don't support the Web Share API
                alert('Share feature is not supported on your browser.');
            }
        } catch (error) {
            console.error('Error sharing:', error);
        }
    };

    return (
        <div className="card post">
            <div className="post-header">
                <div className="post-avatar"></div>
                <div className="post-author">Anonymous User</div>
            </div>
            <p className="post-text">{post.text}</p>
            {post.imageUrl && <img className="post-image" src={post.imageUrl} alt="Post content" />}
            <div className="post-stats">
                <span>{post.likes} Likes</span>
                <span className="comments-count" onClick={handleToggleComments}>
                    {comments.length > 0 ? `${comments.length} Comments` : 'View comments'}
                </span>
            </div>
            <div className="post-actions">
                <button className="action-button" onClick={() => onPostLiked(post._id)}>
                    ❤️ Like
                </button>
                <button className="action-button" onClick={handleToggleComments}>
                    💬 Comment
                </button>
                <button className="action-button" onClick={handleShare}>
                    🔗 Share
                </button>
            </div>
            {showComments && (
                <div className="comments-section">
                    <form onSubmit={handleCommentSubmit} className="comment-form">
                        <input
                            type="text"
                            placeholder="Write a comment..."
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                        />
                        <button type="submit">Post</button>
                    </form>
                    <div className="comments-list">
                        {comments.map(comment => (
                            <div key={comment._id} className="comment">
                                <div className="post-avatar comment-avatar"></div>
                                <div className="comment-body">
                                    <span className="comment-author">Anonymous</span>
                                    <p>{comment.text}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}   