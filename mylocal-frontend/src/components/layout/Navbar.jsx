// src/components/layout/Navbar.jsx
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import './Navbar.css';

const Navbar = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [user, setUser] = useState(null);
    const location = useLocation();
    const navigate = useNavigate();

    // Check auth status
    const checkAuth = () => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        } else {
            setUser(null);
        }
    };

    useEffect(() => {
        checkAuth();

        // Listen for login/logout events
        window.addEventListener('authChange', checkAuth);
        return () => window.removeEventListener('authChange', checkAuth);
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('user');
        setUser(null);
        setIsProfileOpen(false);
        window.dispatchEvent(new Event('authChange'));
        navigate('/');
    };

    const navLinks = [
        { path: '/', label: 'Home' },
        { path: '/places', label: 'Discover' },
        { path: '/about', label: 'About Us' },

    ];

    const profileLinks = [
        { path: '/profile?tab=overview', label: 'My Profile', action: null },
        { path: '/profile?tab=profile', label: 'Edit Profile', action: null },
        { path: '/profile?tab=places', label: 'My Places', action: null },
        { path: '/profile?tab=reviews', label: 'My Reviews', action: null },
        { path: '/profile?tab=saved', label: 'Saved Places', action: null },
        { path: '/profile?tab=settings', label: 'Settings', action: null },
        { path: '#', label: 'Log Out', action: handleLogout },
    ];

    return (
        <nav className="navbar">
            <div className="container">
                <div className="navbar-content">
                    {/* Logo */}
                    <Link to="/" className="navbar-brand">
                        <div className="logo-container">
                            <img
                                src="/ml.png"
                                alt="MyLocal Logo"
                                className="logo-image"
                            />
                        </div>
                        <div className="brand-text">
                            <span className="brand-name">MyLocal</span>
                            <span className="brand-tagline">Discover Local Gems</span>
                        </div>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="desktop-nav">
                        <div className="nav-links">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.path}
                                    to={link.path}
                                    className={`nav-link ${location.pathname === link.path ? 'active' : ''}`}
                                >
                                    {link.label}
                                </Link>
                            ))}
                        </div>

                        <div className="nav-actions">
                            {user ? (
                                // Profile dropdown when logged in
                                <div className="d-flex align-items-center gap-3">
                                    <div className="profile-container">
                                        <button
                                            className="profile-toggle"
                                            onClick={() => setIsProfileOpen(!isProfileOpen)}
                                        >
                                            {user.avatar ? (
                                                <img
                                                    src={user.avatar}
                                                    alt="User"
                                                    className="profile-avatar-img"
                                                    style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #fff', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}
                                                />
                                            ) : (
                                                <div
                                                    className="profile-avatar-img d-flex align-items-center justify-content-center bg-primary text-white fw-bold"
                                                    style={{ width: '40px', height: '40px', borderRadius: '50%', border: '2px solid #fff', boxShadow: '0 2px 5px rgba(0,0,0,0.1)', fontSize: '16px' }}
                                                >
                                                    {user.firstName?.[0]?.toUpperCase() || user.name?.[0]?.toUpperCase() || 'U'}
                                                </div>
                                            )}
                                        </button>

                                        {isProfileOpen && (
                                            <div className="profile-dropdown">
                                                {profileLinks.map((link, idx) => (
                                                    link.action ? (
                                                        <button
                                                            key={idx}
                                                            className="profile-link w-100 text-start border-0 bg-transparent"
                                                            onClick={link.action}
                                                        >
                                                            {link.label}
                                                        </button>
                                                    ) : (
                                                        <Link
                                                            key={idx}
                                                            to={link.path}
                                                            className="profile-link"
                                                            onClick={() => setIsProfileOpen(false)}
                                                        >
                                                            {link.label}
                                                        </Link>
                                                    )
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                // Login/Register buttons when not logged in
                                <div className="d-flex gap-2">
                                    <Link to="/login" className="btn btn-link text-decoration-none text-dark fw-bold">
                                        Log In
                                    </Link>
                                    <Link to="/register" className="auth-btn register-btn">
                                        Register
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Mobile Menu Toggle */}
                    <button
                        className="mobile-menu-toggle"
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                    >
                        {isMenuOpen ? '✕' : '☰'}
                    </button>
                </div>

                {/* Mobile Navigation */}
                {isMenuOpen && (
                    <div className="mobile-nav">
                        <div className="mobile-nav-links">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.path}
                                    to={link.path}
                                    className={`mobile-nav-link ${location.pathname === link.path ? 'active' : ''}`}
                                    onClick={() => setIsMenuOpen(false)}
                                >
                                    {link.label}
                                </Link>
                            ))}

                            <div className="mobile-nav-divider"></div>

                            {user ? (
                                <>
                                    <div className="px-3 py-2 fw-bold text-primary">Signed in as {user.name}</div>
                                    <Link
                                        to="/add-place"
                                        className="mobile-nav-link text-primary fw-bold"
                                        onClick={() => setIsMenuOpen(false)}
                                    >
                                        + Add New Place
                                    </Link>
                                    {profileLinks.slice(0, -1).map((link, idx) => (
                                        <Link
                                            key={idx}
                                            to={link.path}
                                            className="mobile-profile-link"
                                            onClick={() => setIsMenuOpen(false)}
                                        >
                                            {link.label}
                                        </Link>
                                    ))}
                                    <button
                                        className="mobile-profile-link w-100 text-start border-0 bg-transparent text-danger"
                                        onClick={() => {
                                            handleLogout();
                                            setIsMenuOpen(false);
                                        }}
                                    >
                                        Log Out
                                    </button>
                                </>
                            ) : (
                                <>

                                    <Link to="/register" className="mobile-auth-btn primary" onClick={() => setIsMenuOpen(false)}>
                                        login
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </nav>
    );
};

export default Navbar;