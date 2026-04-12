// src/pages/Places/PlacesPage.jsx
import { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './PlacesPage.css';
import { getPlaces } from '../../api/place.api';
import { getCategories } from '../../api/category.api';
import { toggleFavorite as apiToggleFavorite, getUserFavorites } from '../../api/favorite.api';
import {
    Search,
    GeoAltFill,
    StarFill,
    Filter,
    Map as MapIcon,
    ListUl,
    Heart,
    HeartFill,
    Shop,
    CupHot,
    Briefcase,
    Tree,
    Easel,
    Bag,
    CurrencyDollar,
    Clock,
    Check
} from 'react-bootstrap-icons';

// Mock Data
const PLACES_DATA = [
    {
        id: 1,
        name: "Blue Bottle Coffee",
        category: "Coffee Shop",
        rawCategory: "coffee",
        rating: 4.8,
        reviews: 245,
        image: "https://images.unsplash.com/photo-1498804103079-a6351b050096?w=400&h=300&fit=crop",
        distance: 0.5,
        price: 2,
        isOpen: true,
        coordinates: { x: 30, y: 40 }
    },
    {
        id: 2,
        name: "La Piazza Restaurant",
        category: "Restaurant",
        rawCategory: "restaurant",
        rating: 4.6,
        reviews: 189,
        image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&h=300&fit=crop",
        distance: 1.2,
        price: 3,
        isOpen: true,
        coordinates: { x: 50, y: 60 }
    },
    {
        id: 3,
        name: "TechHub Coworking",
        category: "Co-working",
        rawCategory: "coworking",
        rating: 4.9,
        reviews: 156,
        image: "https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=400&h=300&fit=crop",
        distance: 0.8,
        price: 2,
        isOpen: true,
        coordinates: { x: 70, y: 30 }
    },
    {
        id: 4,
        name: "Belvédère Park",
        category: "Park",
        rawCategory: "park",
        rating: 4.7,
        reviews: 321,
        image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop",
        distance: 2.1,
        price: 1,
        isOpen: true,
        coordinates: { x: 20, y: 80 }
    },
    {
        id: 5,
        name: "National Museum",
        category: "Museum",
        rawCategory: "museum",
        rating: 4.5,
        reviews: 432,
        image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop",
        distance: 3.5,
        price: 2,
        isOpen: false,
        coordinates: { x: 60, y: 20 }
    },
    {
        id: 6,
        name: "Artisan Market",
        category: "Shop",
        rawCategory: "shop",
        rating: 4.4,
        reviews: 98,
        image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=300&fit=crop",
        distance: 1.5,
        price: 2,
        isOpen: true,
        coordinates: { x: 80, y: 50 }
    }
];

const PlacesPage = () => {
    // STATE MANAGEMENT (Zustand-like logic with local state)
    const [viewMode, setViewMode] = useState('list'); // 'list' or 'map' (for mobile mostly)
    const [searchQuery, setSearchQuery] = useState('');
    const [showAutocomplete, setShowAutocomplete] = useState(false);
    const [allPlaces, setAllPlaces] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);

    // Fetch places from API
    // Fetch places and categories
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const [placesResponse, categoriesResponse] = await Promise.all([
                    getPlaces(),
                    getCategories()
                ]);

                const apiCategories = categoriesResponse.data || [];

                // Helper to get icon based on name (simple mapping for now)
                const getCategoryIcon = (name) => {
                    const n = name.toLowerCase();
                    if (n.includes('coffee')) return <CupHot />;
                    if (n.includes('restaurant') || n.includes('food')) return <Shop />;
                    if (n.includes('work')) return <Briefcase />;
                    if (n.includes('park')) return <Tree />;
                    if (n.includes('museum')) return <Shop />;
                    return <Shop />;
                };

                const mappedCategories = [
                    { id: 'all', name: 'All', icon: <Shop /> },
                    ...apiCategories.map(cat => ({
                        id: cat.id,
                        name: cat.name,
                        icon: getCategoryIcon(cat.name) // or use cat.icon if valid component name
                    }))
                ];
                setCategories(mappedCategories);

                const apiPlaces = placesResponse.data || [];

                // Create a map for quick access
                const categoryMap = {};
                apiCategories.forEach(c => categoryMap[c.id] = c.name);

                // Map API places to match frontend schema
                const mappedPlaces = apiPlaces.map(place => ({
                    id: place.id,
                    name: place.name,
                    category: categoryMap[place.categoryId] || 'Unknown',
                    rawCategory: place.categoryId, // Used for filtering by ID now
                    rating: parseFloat(place.averageRating) || 0,
                    reviews: place.reviewsCount || 0,
                    image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&h=300&fit=crop',
                    imageUrl: place.imageUrl,
                    distance: 1,
                    price: 2,
                    isOpen: true,
                    coordinates: {
                        x: parseFloat(place.longitude) || 50,
                        y: parseFloat(place.latitude) || 50
                    },
                    address: place.address,
                    description: place.description,
                    phone: place.phone
                }));

                setAllPlaces(mappedPlaces);

                // Fetch user favorites
                const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
                if (currentUser.id) {
                    try {
                        const favResponse = await getUserFavorites(currentUser.id);
                        const favMap = {};
                        // API returns list of favorites with placeId
                        // The structure depends on serialization, but generally fav.placeId or fav.place.id
                        // Based on FavoriteDTO, it has Place object.
                        // based on controller: ['favorite:read', 'place:read']
                        // likely: [ { id: 1, userId: 1, place: { id: 5, ... } }, ... ]
                        // or if we simply need to check ID
                        const favs = favResponse.data || [];
                        favs.forEach(f => {
                            // Assuming f.place is the object, or f.placeId if simplified
                            const pid = f.place ? f.place.id : f.placeId;
                            if (pid) favMap[pid] = true;
                        });
                        setFavorites(favMap);
                    } catch (e) {
                        console.error("Failed to load favorites", e);
                    }
                }

            } catch (error) {
                console.error('Error fetching data:', error);
                setAllPlaces(PLACES_DATA);
                // Fallback categories if fail
                setCategories([
                    { id: 'all', name: 'All', icon: <Shop /> }
                ]);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    // Filters State
    const [filters, setFilters] = useState({
        category: 'all',
        price: [], // [1, 2, 3, 4]
        minRating: 0,
        showFavorites: false
    });

    const [showMobileFilters, setShowMobileFilters] = useState(false);
    const [favorites, setFavorites] = useState({});

    // HANDLERS
    const toggleFavorite = async (placeId) => {
        const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
        if (!currentUser.id) {
            alert("Please login to save favorites");
            return;
        }

        // Optimistic UI update
        const isCurrentlyFav = favorites[placeId];
        setFavorites(prev => ({ ...prev, [placeId]: !isCurrentlyFav }));

        try {
            await apiToggleFavorite(currentUser.id, placeId);
            // Success, state already updated
        } catch (error) {
            console.error("Failed to toggle favorite", error);
            // Revert on failure
            setFavorites(prev => ({ ...prev, [placeId]: isCurrentlyFav }));
        }
    };

    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value);
        setShowAutocomplete(e.target.value.length > 2);
    };

    const togglePriceFilter = (price) => {
        setFilters(prev => {
            const current = prev.price;
            const newPrices = current.includes(price)
                ? current.filter(p => p !== price)
                : [...current, price];
            return { ...prev, price: newPrices };
        });
    };

    // FILTERING LOGIC (useMemo for performance)
    const filteredPlaces = useMemo(() => {
        return allPlaces.filter(place => {
            // Search
            if (searchQuery && !place.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
            // Category
            if (filters.category !== 'all' && place.rawCategory !== filters.category) return false;
            // Favorites Only
            if (filters.showFavorites && !favorites[place.id]) return false;
            // Rating
            if (place.rating < filters.minRating) return false;
            // Price
            if (filters.price.length > 0 && !filters.price.includes(place.price)) return false;

            return true;
        });
    }, [filters, searchQuery, allPlaces, favorites]);



    return (
        <div className="places-page">
            {/* Mobile Filter Overlay */}
            {showMobileFilters && (
                <div
                    className="mobile-filter-overlay"
                    style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 99 }}
                    onClick={() => setShowMobileFilters(false)}
                />
            )}

            <div className="places-layout">
                {/* COLUMN 1: FILTERS */}
                <aside className={`filters-panel ${showMobileFilters ? 'active' : ''}`}>
                    <div className="d-flex justify-content-between align-items-center mb-4 md-none">
                        <h2 className="h5 mb-0">Filters</h2>
                        <button onClick={() => setShowMobileFilters(false)} style={{ border: 'none', background: 'none', fontSize: '24px' }}>&times;</button>
                    </div>

                    {/* Favorites Filter (New) */}
                    <div className="filter-group">
                        <h3>My Collection</h3>
                        <label className="checkbox-label">
                            <input
                                type="checkbox"
                                checked={filters.showFavorites}
                                onChange={(e) => setFilters(prev => ({ ...prev, showFavorites: e.target.checked }))}
                            />
                            Show Favorites Only
                        </label>
                    </div>

                    <div className="filter-group">
                        <h3>Price Range</h3>
                        <div className="price-range">
                            {[1, 2, 3, 4].map(price => (
                                <button
                                    key={price}
                                    className={`price-btn ${filters.price.includes(price) ? 'active' : ''}`}
                                    onClick={() => togglePriceFilter(price)}
                                >
                                    {'$'.repeat(price)}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="filter-group">
                        <h3>Min Rating</h3>
                        <div className="filter-options">
                            {[4, 3, 2].map(rating => (
                                <label key={rating} className="checkbox-label">
                                    <input
                                        type="radio"
                                        name="rating"
                                        checked={filters.minRating === rating}
                                        onChange={() => setFilters(prev => ({ ...prev, minRating: rating }))}
                                    />
                                    {rating}+ Stars
                                </label>
                            ))}
                            <label className="checkbox-label">
                                <input
                                    type="radio"
                                    name="rating"
                                    checked={filters.minRating === 0}
                                    onChange={() => setFilters(prev => ({ ...prev, minRating: 0 }))}
                                />
                                Any Rating
                            </label>
                        </div>
                    </div>
                </aside>

                {/* COLUMN 2: RESULTS */}
                <main className="results-panel">
                    {/* Search Bar with Autocomplete */}
                    <div className="search-bar-wrapper">
                        <div className="search-input-container">
                            <Search size={18} className="text-secondary" />
                            <input
                                type="text"
                                placeholder="Search places, categories..."
                                value={searchQuery}
                                onChange={handleSearchChange}
                                onBlur={() => setTimeout(() => setShowAutocomplete(false), 200)}
                                onFocus={() => searchQuery.length > 2 && setShowAutocomplete(true)}
                            />
                            {searchQuery && (
                                <button
                                    className="btn-reset"
                                    onClick={() => setSearchQuery('')}
                                    style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#64748b' }}
                                >
                                    &times;
                                </button>
                            )}
                        </div>
                        {showAutocomplete && (
                            <div className="autocomplete-dropdown">
                                {allPlaces.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase())).slice(0, 3).map(place => (
                                    <div
                                        key={place.id}
                                        className="autocomplete-item"
                                        onClick={() => setSearchQuery(place.name)}
                                    >
                                        {place.name} <span className="text-muted small">in {place.category}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Categories Carousel */}
                    <div className="categories-carousel">
                        {categories.map(cat => (
                            <button
                                key={cat.id}
                                className={`category-chip ${filters.category === cat.id ? 'active' : ''}`}
                                onClick={() => setFilters(prev => ({ ...prev, category: cat.id }))}
                            >
                                {cat.icon} {cat.name}
                            </button>
                        ))}
                    </div>

                    {/* Results Count & Mobile Filter Toggle */}
                    <div className="results-header">
                        <h2 className="mb-0">
                            {filteredPlaces.length} Results
                        </h2>
                        <div className="d-flex align-items-center gap-2">
                            <button
                                className="category-chip d-lg-none"
                                onClick={() => setShowMobileFilters(true)}
                                style={{ background: 'white', border: '1px solid #e2e8f0' }}
                            >
                                <Filter /> Filters
                            </button>
                            <span className="text-muted small d-none d-md-block">Sorted by: Recommended</span>
                        </div>
                    </div>

                    {/* Places List */}
                    <div className="places-list">
                        {loading ? (
                            <div className="text-center w-100 py-5">
                                <div className="spinner-border text-primary" role="status">
                                    <span className="visually-hidden">Loading...</span>
                                </div>
                            </div>
                        ) : filteredPlaces.map(place => (
                            <div key={place.id} className="place-card-pro">
                                <div className="card-img-wrapper">
                                    <img
                                        src={place.imageUrl || place.image}
                                        alt={place.name}
                                        className="card-img"
                                        onError={(e) => {
                                            e.target.onerror = null;
                                            e.target.src = "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&h=300&fit=crop";
                                        }}
                                    />
                                    {place.isOpen && <span className="card-status">Open Now</span>}
                                    <button
                                        className="btn-favorite"
                                        onClick={() => toggleFavorite(place.id)}
                                    >
                                        {favorites[place.id] ? <HeartFill color="#ef4444" /> : <Heart size={18} color="#0f172a" />}
                                    </button>
                                </div>
                                <div className="card-info">
                                    <div className="card-header-row">
                                        <h3 className="card-title">{place.name}</h3>
                                        <div className="rating-pill">
                                            <StarFill size={10} />
                                            {place.rating.toFixed(1)}
                                        </div>
                                    </div>
                                    <div className="card-meta">
                                        <GeoAltFill size={12} /> {place.distance} km • {place.reviews} reviews
                                    </div>
                                    <div className="card-tags">
                                        <span className="tag">{place.category}</span>
                                        <span className="tag">{'$'.repeat(place.price || 1)}</span>
                                    </div>
                                    <Link
                                        to={`/places/${place.id}`}
                                        className="btn-details mt-auto"
                                    >
                                        View Details
                                    </Link>
                                </div>
                            </div>

                        ))}

                        {!loading && filteredPlaces.length === 0 && (
                            <div className="text-center py-5 w-100 grid-col-span-full" style={{ gridColumn: '1 / -1' }}>
                                <p className="text-muted">No places found matching your criteria.</p>
                                <button
                                    className="btn btn-primary"
                                    onClick={() => setFilters({ category: 'all', price: [], minRating: 0, openNow: false, maxDistance: 50 })}
                                >
                                    Reset Filters
                                </button>
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default PlacesPage;