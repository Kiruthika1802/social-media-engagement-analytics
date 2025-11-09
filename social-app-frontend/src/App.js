// src/App.js

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Post } from './Post'; // Import the new Post component
import './App.css';

const API_URL = 'http://localhost:5000';

function App() {
  const [posts, setPosts] = useState([]);
  const [postText, setPostText] = useState('');
  const [postImage, setPostImage] = useState(null);

  const fetchPosts = async () => {
    try {
      const response = await axios.get(`${API_URL}/posts`);
      setPosts(response.data);
    } catch (error) {
      console.error("Error fetching posts:", error);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!postText || !postImage) return alert('Please enter text and select an image.');

    const formData = new FormData();
    formData.append('text', postText);
    formData.append('image', postImage);

    try {
      await axios.post(`${API_URL}/posts`, formData);
      fetchPosts();
      e.target.reset();
      setPostText('');
    } catch (error) {
      console.error("Error creating post:", error);
    }
  };

  const handleLike = async (postId) => {
    try {
      await axios.post(`${API_URL}/posts/${postId}/like`);
      fetchPosts(); // Refetch all posts to update the like count
    } catch (error) {
      console.error("Error liking post:", error);
    }
  };

  return (
    <div className="App">
      <h1 className="app-header">CloudStream</h1>

      <div className="card">
        <form className="post-form" onSubmit={handleSubmit}>
          <textarea
            placeholder="What's on your mind?"
            value={postText}
            onChange={(e) => setPostText(e.target.value)}
          />
          <div className="form-actions">
            <input type="file" onChange={(e) => setPostImage(e.target.files[0])} />
            <button type="submit">Post</button>
          </div>
        </form>
      </div>

      <div className="post-list">
        {posts.map(post => (
          // Use the Post component for each item in the list
          <Post key={post._id} post={post} onPostLiked={handleLike} />
        ))}
      </div>
    </div>
  );
}

export default App;