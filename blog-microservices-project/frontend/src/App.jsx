// frontend/src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import PostFeed from './components/PostFeed';
import LoginPage from './pages/LoginPage.jsx '; // You'd need to create this simple page
import CreatePostPage from './pages/CreatePostPage.jsx '; // You'd need to create this simple page
// frontend/src/App.jsx (Add this line near the other page imports)
import RegisterPage from './pages/RegisterPage.jsx';
// Component to protect routes
const ProtectedRoute = ({ children }) => {
    const { isAuthenticated } = useAuth();
    // Redirect unauthenticated users to the login page
    return isAuthenticated ? children : <Navigate to="/login" replace />; 
};

const Header = () => {
    const { isAuthenticated, logout } = useAuth();
    return (
        <header style={{ padding: '10px', background: '#f0f0f0' }}>
            <nav>
                <Link to="/" style={{ marginRight: '15px' }}>Feed</Link>
                {isAuthenticated && <Link to="/create" style={{ marginRight: '15px' }}>Create Post</Link>}
                
                <div style={{ float: 'right' }}>
                    {isAuthenticated ? (
                        <button onClick={logout}>Logout</button>
                    ) : (
                        <Link to="/login">Login</Link>
                    )}
                </div>
            </nav>
        </header>
    );
};

function App() {
    return (
        <Router>
            <Header />
            <main style={{ padding: '20px' }}>
                <Routes>
                    {/* Public route for the post feed */}
                    <Route path="/" element={<PostFeed />} /> 
                    
                    {/* Public route for authentication */}
                    <Route path="/login" element={<LoginPage />} /> 
                    
                    {/* Protected route example */}
                    <Route 
                        path="/create" 
                        element={<ProtectedRoute><CreatePostPage /></ProtectedRoute>} 
                    />
                    
                    {/* Add other routes (Register, Profile, PostDetail) here */}
                     {/* Public routes */}
    <Route path="/" element={<PostFeed />} /> 
    <Route path="/login" element={<LoginPage />} /> 
    
    {/* New Registration Route */}
    <Route path="/register" element={<RegisterPage />} /> 
    
    {/* Protected route example */}
    <Route 
        path="/create" 
        element={<ProtectedRoute><CreatePostPage /></ProtectedRoute>} 
    />
    
    {/* ... (Post Detail route will go here later) ... */}
                </Routes>
            </main>
        </Router>
    );
}

// Wrap the App component with the AuthProvider in the main entry file (main.jsx)
const Root = () => (
    <AuthProvider>
        <App />
    </AuthProvider>
);

export default Root;