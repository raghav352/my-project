// frontend/src/pages/CreatePostPage.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api'; 

const CreatePostPage = () => {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [tags, setTags] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');

        const postData = {
            title,
            content,
            tags: tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0) 
        };

        try {
            await api.post('/posts', postData); 
            
            setMessage('Success! Post created.');
            setTimeout(() => {
                navigate('/');
            }, 1500);

        } catch (error) {
            const msg = error.response?.data?.message || 'Failed to create post. Are you logged in?';
            setMessage(`Error: ${msg}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ maxWidth: '600px', margin: '30px auto', padding: '20px', border: '1px solid #ccc' }}>
            <h2>Create New Post</h2>
            <form onSubmit={handleSubmit}>
                {/* ... (Input fields for Title, Content, Tags go here, as provided in the previous answer) ... */}
                <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block' }}>Title:</label>
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                        style={{ width: '100%', padding: '10px' }}
                    />
                </div>

                <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block' }}>Content:</label>
                    <textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        required
                        rows="8"
                        style={{ width: '100%', padding: '10px' }}
                    ></textarea>
                </div>

                <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block' }}>Tags (comma-separated):</label>
                    <input
                        type="text"
                        value={tags}
                        onChange={(e) => setTags(e.target.value)}
                        style={{ width: '100%', padding: '10px' }}
                        placeholder="e.g., nodejs, microservices"
                    />
                </div>

                <button 
                    type="submit" 
                    disabled={loading}
                    style={{ padding: '10px 20px', backgroundColor: '#28a745', color: 'white', border: 'none', cursor: 'pointer' }}
                >
                    {loading ? 'Submitting...' : 'Publish Post'}
                </button>
                
                {message && <p style={{ marginTop: '15px', color: message.startsWith('Error') ? 'red' : 'green' }}>{message}</p>}
            </form>
        </div>
    );
};

export default CreatePostPage;