import { Filter, Grid, List } from 'lucide-react';
import { useState } from 'react';
import Button from '../../components/ui/Button';
import PlaceCard from '../../components/places/PlaceCard';
import Loader from '../../components/ui/Loader';

const PlacesPage = () => {
    const [viewMode, setViewMode] = useState('grid');
    const [loading, setLoading] = useState(false);

    // Sample places data
    const places = Array.from({ length: 8 }, (_, i) => ({
        id: i + 1,
        name: `Place ${i + 1}`,
        category: ['Restaurant', 'Cafe', 'Park', 'Museum'][i % 4],
        rating: (4 + Math.random()).toFixed(1),
        reviews: Math.floor(Math.random() * 300) + 50,
        image: `https://images.unsplash.com/photo-1498804103079-a6351b050096?w=400&h=300&fit=crop&ix=${i}`,
        distance: `${(Math.random() * 5).toFixed(1)} km`,
    }));

    return (
        <div className="container py-8 animate-fadeIn">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Discover Places</h1>
                    <p className="text-gray-600">Explore amazing places around you</p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
                        <button
                            onClick={() => setViewMode('grid')}
                            className={`p-2 rounded ${viewMode === 'grid' ? 'bg-white shadow' : ''}`}
                        >
                            <Grid className="w-5 h-5" />
                        </button>
                        <button
                            onClick={() => setViewMode('list')}
                            className={`p-2 rounded ${viewMode === 'list' ? 'bg-white shadow' : ''}`}
                        >
                            <List className="w-5 h-5" />
                        </button>
                    </div>
                    <Button variant="outline">
                        <Filter className="w-5 h-5" />
                        Filters
                    </Button>
                </div>
            </div>

            {loading ? (
                <Loader text="Loading places..." />
            ) : (
                <>
                    <div className={`grid ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'grid-cols-1'} gap-6 mb-8`}>
                        {places.map((place) => (
                            <PlaceCard key={place.id} place={place} />
                        ))}
                    </div>

                    <div className="text-center">
                        <Button size="large" onClick={() => setLoading(true)}>
                            Load More Places
                        </Button>
                    </div>
                </>
            )}
        </div>
    );
};

export default PlacesPage;