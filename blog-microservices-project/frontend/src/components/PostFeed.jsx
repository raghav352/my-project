// frontend/src/components/PostFeed.jsx
import React, { useState, useEffect } from 'react';
import api from '../api';

const PostFeed = () => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchPosts = async () => {
            try {
                // Calls API Gateway -> Post Service. This is the main blog feed.
                const response = await api.get('/posts?limit=20&page=1'); 
                setPosts(response.data.data); // Assuming the response structure {data: [...]}
                setError(null);
            } catch (err) {
                // If 401/403 (Auth failure), the gateway handled it.
                setError("Failed to load posts. Please check if services are running or log in.");
            } finally {
                setLoading(false);
            }
        };

        fetchPosts();
    }, []);

    if (loading) return <div>Loading Feed...</div>;
    if (error) return <div style={{ color: 'red' }}>{error}</div>;
    if (posts.length === 0) return <div>No posts found. Start writing!</div>;

    return (
        <div>
            <h2>Latest Posts</h2>
            {posts.map(post => (
                <div key={post._id} style={{ border: '1px solid #ccc', padding: '15px', marginBottom: '10px' }}>
                    <h3>{post.title}</h3>
                    <p>{post.content.substring(0, 150)}...</p>
                    {/* Inter-Service Data Display: Author data injected by the Post service */}
                    <small>By: **{post.author?.username || 'Unknown Author'}**</small> 
                    <p>Comments: {/* Link to comments/comment count goes here */}</p>
                </div>
            ))}
        </div>
    );
};

export default PostFeed;