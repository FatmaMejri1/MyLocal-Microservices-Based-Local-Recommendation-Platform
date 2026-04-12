// src/pages/Home/HomePage.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getPlaces } from '../../api/place.api';
import { getCategories } from '../../api/category.api';
import './HomePage.css';
import {
    Search,
    GeoAltFill,
    StarFill,
    PeopleFill,
    ShieldCheck,
    LightningFill
} from 'react-bootstrap-icons';

const HomePage = () => {
    const [topPlaces, setTopPlaces] = useState([]);
    const [loading, setLoading] = useState(true);
    const [categories, setCategories] = useState({});

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [placesRes, categoriesRes] = await Promise.all([
                    getPlaces(),
                    getCategories()
                ]);

                // Process categories into a map for easy lookup
                const categoryMap = {};
                if (categoriesRes.data && Array.isArray(categoriesRes.data)) {
                    categoriesRes.data.forEach(cat => {
                        categoryMap[cat.id] = cat.name;
                    });
                }
                setCategories(categoryMap);

                // Process places: sort by rating desc and take top 4
                if (placesRes.data && Array.isArray(placesRes.data)) {
                    const sortedPlaces = placesRes.data
                        .sort((a, b) => (b.averageRating || 0) - (a.averageRating || 0))
                        .slice(0, 4);
                    setTopPlaces(sortedPlaces);
                }
            } catch (error) {
                console.error("Error fetching homepage data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const features = [
        {
            icon: <Search />,
            title: "Smart Search",
            description: "Find exactly what you're looking for with advanced filters and location-based search.",
        },
        {
            icon: <ShieldCheck />,
            title: "Verified Reviews",
            description: "Read authentic reviews from real visitors to make informed decisions.",
        },
        {
            icon: <LightningFill />,
            title: "Live Directions",
            description: "Get turn-by-turn navigation to your destination with real-time updates.",
        },
        {
            icon: <PeopleFill />,
            title: "Community",
            description: "Connect with locals and travelers to share experiences and recommendations.",
        },
    ];

    return (
        <div className="home-page">

            {/* HERO SECTION */}
            <section className="hero-section">
                <div className="hero-content">
                    <h1>Discover <span className="text-blue">Local Gems</span> Around You</h1>
                    <p className="lead">
                        Find hidden treasures, popular spots, and local favorites. Join thousands of explorers in discovering the best your city has to offer.
                    </p>

                    <div className="search-container">
                        <div className="search-input-group">
                            <Search className="search-icon" />
                            <input type="text" placeholder="Search for restaurants, parks, museums..." />
                        </div>
                        <div className="search-input-group">
                            <GeoAltFill className="search-icon" />
                            <input type="text" placeholder="Your location" />
                        </div>
                        <button className="btn-search">Explore</button>
                    </div>
                </div>
            </section>

            {/* FEATURED PLACES */}
            <section className="section bg-white">
                <div className="container">
                    <div className="section-title">
                        <h2>Featured Places</h2>
                        <p>Curated selection of top-rated local favorites</p>
                    </div>

                    {loading ? (
                        <div className="text-center py-5">
                            <div className="spinner-border text-primary" role="status">
                                <span className="visually-hidden">Loading...</span>
                            </div>
                        </div>
                    ) : (
                        <div className="places-grid">
                            {topPlaces.length > 0 ? (
                                topPlaces.map((place) => (
                                    <Link to={`/places/${place.id}`} key={place.id} className="text-decoration-none text-dark">
                                        <div className="place-card h-100">
                                            <div className="card-image">
                                                <img
                                                    src={place.imageUrl || place.image || 'https://placehold.co/600x400?text=No+Image'}
                                                    alt={place.name}
                                                    onError={(e) => {
                                                        e.target.onerror = null;
                                                        e.target.src = 'https://placehold.co/600x400?text=No+Image';
                                                    }}
                                                />
                                                <span className="badge-featured">Top Rated</span>
                                            </div>
                                            <div className="card-content">
                                                <h3 className="card-title text-truncate">{place.name}</h3>
                                                <div className="card-category">
                                                    {categories[place.categoryId] || 'Place'}
                                                </div>
                                                <div className="card-stats">
                                                    <div className="stat-item text-blue">
                                                        <StarFill className="me-1" /> {place.averageRating ? parseFloat(place.averageRating).toFixed(1) : 'New'}
                                                        {place.reviewsCount > 0 && <span className="ms-1 text-muted small">({place.reviewsCount})</span>}
                                                    </div>
                                                    <div className="stat-item text-truncate" style={{ maxWidth: '150px' }}>
                                                        <GeoAltFill className="me-1" /> {place.address || 'Unknown Location'}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                ))
                            ) : (
                                <div className="col-12 text-center text-muted">
                                    <p>No featured places found.</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </section>

            {/* FEATURES */}
            <section className="section bg-gray-light">
                <div className="container">
                    <div className="section-title">
                        <h2>Why Choose MyLocal?</h2>
                        <p>Everything you need to explore your city like a local</p>
                    </div>

                    <div className="features-grid">
                        {features.map((feature, index) => (
                            <div key={index} className="feature-item">
                                <div className="feature-icon">{feature.icon}</div>
                                <h3>{feature.title}</h3>
                                <p>{feature.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA SECTION */}
            <section className="cta-section">
                <div className="cta-box">
                    <h2>Ready to Explore?</h2>
                    <p>Join our community of local explorers and start discovering amazing places today.</p>
                    <div className="cta-buttons">
                        <Link to="/register" className="btn-primary">
                            Sign Up Now
                        </Link>
                        <Link to="/about" className="btn-outline">
                            Learn More
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default HomePage;
