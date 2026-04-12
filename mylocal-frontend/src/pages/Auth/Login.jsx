// src/pages/Auth/Login.jsx
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { loginUser } from '../../api/user.api';

function Login() {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const response = await loginUser(email, password);
            const userData = response.data;

            // Ensure we have the user ID
            if (!userData.id) {
                throw new Error('User ID not found in login response');
            }

            // Format user data for frontend
            const user = {
                id: userData.id,
                email: userData.email,
                firstName: userData.firstName,
                lastName: userData.lastName,
                name: `${userData.firstName} ${userData.lastName}`,
                phone: userData.phone || null,
                city: userData.city || null,
                avatar: userData.avatar || null // No default avatar - user will upload their own
            };

            console.log('Login successful, user ID:', user.id);

            // Store user
            localStorage.setItem('user', JSON.stringify(user));

            // Dispatch event to notify Navbar
            window.dispatchEvent(new Event('authChange'));

            setIsLoading(false);
            navigate('/profile');
        } catch (err) {
            console.error('Login error:', err);
            const errorMessage = err.response?.data?.message 
                || err.message 
                || 'Login failed. Please check your credentials.';
            setError(errorMessage);
            setIsLoading(false);
        }
    };

    return (
        <div className="container py-5" style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div className="form-container bg-white p-5 rounded-4 shadow-sm" style={{ maxWidth: '450px', width: '100%' }}>
                <div className="text-center mb-4">
                    <h2 className="fw-bold mb-1">Welcome Back</h2>
                    <p className="text-muted">Login to manage your profile and places</p>
                </div>

                {error && (
                    <div className="alert alert-danger" role="alert">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                        <label className="form-label fw-500">Email Address</label>
                        <input
                            type="email"
                            className="form-control form-control-lg bg-light border-0"
                            placeholder="name@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div className="mb-4">
                        <label className="form-label fw-500">Password</label>
                        <input
                            type="password"
                            className="form-control form-control-lg bg-light border-0"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary w-100 btn-lg fw-bold"
                        disabled={isLoading}
                    >
                        {isLoading ? 'Signing in...' : 'Sign In'}
                    </button>

                    <div className="text-center mt-4">
                        <p className="text-muted mb-0">
                            Don't have an account? <Link to="/register" className="text-primary text-decoration-none fw-600">Register</Link>
                        </p>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default Login;