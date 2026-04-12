// src/pages/Auth/Register.jsx
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { registerUser } from '../../api/user.api';

function Register() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        confirmPassword: '',
        phone: '',
        city: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
        setError(''); // Clear error when user types
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        // Validation
        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (formData.password.length < 6) {
            setError('Password must be at least 6 characters long');
            return;
        }

        setLoading(true);

        try {
            // Prepare data for backend (exclude confirmPassword)
            const userData = {
                firstName: formData.firstName,
                lastName: formData.lastName,
                email: formData.email,
                password: formData.password,
                phone: formData.phone || null,
                city: formData.city || null
            };

            const response = await registerUser(userData);
            console.log('Registration successful:', response.data);

            // Redirect to login page after successful registration
            alert('Account created successfully! Please login.');
            navigate('/login');
        } catch (err) {
            console.error('Registration error:', err);
            console.error('Error response:', err.response?.data);
            console.error('Error status:', err.response?.status);
            console.error('Full error:', JSON.stringify(err.response?.data, null, 2));
            const errorMessage = err.response?.data?.message 
                || err.response?.data?.error 
                || err.message 
                || 'Failed to create account. Please try again.';
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container">
            <div className="form-container">
                <h2 className="text-center mb-4">Create Account</h2>

                {error && (
                    <div className="alert alert-danger" role="alert">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">First Name</label>
                        <input
                            type="text"
                            name="firstName"
                            className="form-control"
                            placeholder="Enter your first name"
                            value={formData.firstName}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Last Name</label>
                        <input
                            type="text"
                            name="lastName"
                            className="form-control"
                            placeholder="Enter your last name"
                            value={formData.lastName}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Email Address</label>
                        <input
                            type="email"
                            name="email"
                            className="form-control"
                            placeholder="Enter your email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Phone (Optional)</label>
                        <input
                            type="tel"
                            name="phone"
                            className="form-control"
                            placeholder="Enter your phone number"
                            value={formData.phone}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">City (Optional)</label>
                        <input
                            type="text"
                            name="city"
                            className="form-control"
                            placeholder="Enter your city"
                            value={formData.city}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Password</label>
                        <input
                            type="password"
                            name="password"
                            className="form-control"
                            placeholder="Create a password (min 6 characters)"
                            value={formData.password}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Confirm Password</label>
                        <input
                            type="password"
                            name="confirmPassword"
                            className="form-control"
                            placeholder="Confirm your password"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary w-100 mt-3"
                        disabled={loading}
                    >
                        {loading ? 'Creating Account...' : 'Create Account'}
                    </button>

                    <div className="text-center mt-3">
                        <p>Already have an account? <Link to="/login">Login here</Link></p>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default Register;