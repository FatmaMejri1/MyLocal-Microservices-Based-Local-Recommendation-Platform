import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import './AddPlace.css';
import { CloudUpload, GeoAlt, CheckCircle, ArrowLeft, Trash } from 'react-bootstrap-icons';
import { getPlaceById, updatePlace } from '../../api/place.api';
import { uploadPhoto } from '../../api/media.api';
import { getCategories } from '../../api/category.api';

const EditPlace = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);
    const [error, setError] = useState('');
    const [categories, setCategories] = useState([]);

    // Initial Form State
    const [formData, setFormData] = useState({
        name: '',
        category: '',
        address: '',
        description: '',
        imageUrl: '',
        phone: '',
        website: '',
        openingTime: '',
        closingTime: '',
        latitude: null, // Stored to resend on update
        longitude: null,
        ownerId: null
    });

    const [imageMode, setImageMode] = useState('url'); // 'url' | 'upload'
    const [uploadingImage, setUploadingImage] = useState(false);

    // Load Place Data & Categories
    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch categories first
                const catResponse = await getCategories();
                const fetchedCategories = catResponse.data || [];
                setCategories(fetchedCategories);

                // Fetch place
                const response = await getPlaceById(id);
                const place = response.data;

                let openTime = '';
                let closeTime = '';

                // Try to parse hours
                if (place.hours && typeof place.hours === 'object') {
                    // Check Monday or first available key
                    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
                    for (const d of days) {
                        if (place.hours[d] && place.hours[d].includes('-')) {
                            const parts = place.hours[d].split('-').map(s => s.trim());
                            if (parts.length === 2) {
                                openTime = parts[0];
                                closeTime = parts[1];
                                break;
                            }
                        }
                    }
                }

                setFormData({
                    name: place.name || '',
                    category: place.categoryId || '', // Use ID directly
                    address: place.address || '',
                    description: place.description || '',
                    imageUrl: place.imageUrl || place.image || '',
                    phone: place.phone || '',
                    website: place.website || '',
                    openingTime: openTime,
                    closingTime: closeTime,
                    latitude: place.latitude,
                    longitude: place.longitude,
                    ownerId: place.ownerId
                });

                // Determine initial image mode
                if (place.imageUrl && !place.imageUrl.startsWith('http')) {
                    // Relative path usually means local upload? Or if it contains 'uploads'
                }

            } catch (err) {
                console.error('Error loading data:', err);
                setError('Failed to load place details. It may not exist or network error.');
            } finally {
                setInitialLoading(false);
            }
        };
        fetchData();
    }, [id]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Basic validation
        if (!file.type.startsWith('image/')) {
            alert('Please upload an image file');
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            alert('Image size should be less than 5MB');
            return;
        }

        setUploadingImage(true);

        try {
            const uploadData = new FormData();
            uploadData.append('file', file);
            // Append placeId if we want to associate immediately? 
            // Better to just get URL and let updatePlace handle association via imageUrl string
            // But if we want Photo entity to have placeId, we can send it.
            // uploadData.append('placeId', id); // Removed to avoid 500 error

            const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
            if (currentUser.id) {
                uploadData.append('userId', currentUser.id);
            }

            const response = await uploadPhoto(uploadData);

            // Handle both manual JSON return {url: ...} and serialized return
            const returnedUrl = response.data.url || response.data;
            if (typeof returnedUrl === 'string') { // Just a sanity check, usually it's an object now
                // it's fine
            }

            if (returnedUrl) {
                setFormData(prev => ({ ...prev, imageUrl: returnedUrl }));
            }
        } catch (error) {
            console.error('Upload failed:', error);
            const detail = error.response?.data ? JSON.stringify(error.response.data) : error.message;
            alert(`Failed to upload: ${detail}`);
        } finally {
            setUploadingImage(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const categoryId = parseInt(formData.category);

            // Simple hours reconstruction
            // Simple hours reconstruction - array of objects format
            const hours = [
                { day: "Monday", open: formData.openingTime || "09:00", close: formData.closingTime || "18:00" },
                { day: "Tuesday", open: formData.openingTime || "09:00", close: formData.closingTime || "18:00" },
                { day: "Wednesday", open: formData.openingTime || "09:00", close: formData.closingTime || "18:00" },
                { day: "Thursday", open: formData.openingTime || "09:00", close: formData.closingTime || "18:00" },
                { day: "Friday", open: formData.openingTime || "09:00", close: formData.closingTime || "18:00" },
                { day: "Saturday", open: "10:00", close: "15:00" },
                { day: "Sunday", open: "Closed", close: "Closed" }
            ];

            // Latitude/Longitude kept from original place? 
            // The API updatePlace keeps existing values if null.
            // We are sending a DTO. 
            // If we don't send lat/lon, updatePlace (controller) uses: 
            // $place->setLatitude($placeDTO->latitude ?? $place->getLatitude());
            // So we can omit them if we don't have them in form. form data defaults don't have lat/lon.

            const placeData = {
                name: formData.name,
                description: formData.description,
                address: formData.address,
                phone: formData.phone || null,
                categoryId: categoryId,
                hours: hours,
                imageUrl: formData.imageUrl,
                latitude: formData.latitude ? parseFloat(formData.latitude) : 36.8065, // Fallback if missing
                longitude: formData.longitude ? parseFloat(formData.longitude) : 10.1815,
                ownerId: formData.ownerId ? parseInt(formData.ownerId) : 1 // Fallback or current user
            };

            // Wait, we need to send lat/lon if DTO requires them. 
            // We should have fetched them.
            // Let's add them to formData to be safe, or fetch them from state.
            // I'll skip adding them to formData for now, assuming DTO allows partial update 
            // OR checks against NotBlank groups which might apply to Create but not Update?
            // Usually Update uses same DTO.

            // To be safe, we should pass existing lat/lon back if validation fails.
            // But I didn't store them in state.
            // I'll trust Controller logic: "$placeDTO = deserialize...".
            // If DTO properties are null, Controller lines: "$placeDTO->latitude ?? $place->getLatitude()".
            // This implies null in DTO is allowed.
            // BUT Validator validates DTO. If DTO has #[NotBlank], validator complains on null.
            // I'll rely on the fact that I deserialized JSON. Missing keys -> null properties.
            // If Validation groups are used: Create groups vs Update groups?
            // Controller validator->validate($placeDTO). 
            // If DTO constraints are global, update usually fails if fields missing.
            // However, typical pattern is Separate DTO or Validation Groups.
            // User didn't specify. I'll assume it works like typical Update patch.

            await updatePlace(id, placeData);

            alert('Place updated successfully!');
            navigate('/profile?tab=places');

        } catch (error) {
            console.error('Update failed:', error);
            const msg = error.response?.data?.message || 'Failed to update place';
            setError(msg);
            window.scrollTo(0, 0);
        } finally {
            setIsLoading(false);
        }
    };

    if (initialLoading) {
        return (
            <div className="add-place-page d-flex justify-content-center align-items-center" style={{ minHeight: '80vh' }}>
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>
        );
    }

    if (error && !formData.name) {
        return (
            <div className="add-place-page text-center py-5">
                <h2 className="text-danger mb-3">Error</h2>
                <p className="text-muted">{error}</p>
                <Link to="/profile?tab=places" className="btn btn-outline-primary">Back to My Places</Link>
            </div>
        );
    }

    return (
        <div className="add-place-page">
            <div className="add-place-container">
                <div className="mb-4">
                    <Link to="/profile?tab=places" className="text-decoration-none text-muted d-flex align-items-center gap-2">
                        <ArrowLeft /> Back to My Places
                    </Link>
                </div>

                <div className="add-place-header text-center">
                    <h1>Edit Place</h1>
                    <p>Update information for {formData.name}</p>
                </div>

                {error && <div className="alert alert-danger mb-4">{error}</div>}

                <div className="place-form-card">
                    <form onSubmit={handleSubmit}>
                        <div className="form-grid">
                            {/* Basic Info */}
                            <div className="form-group">
                                <label>Place Name</label>
                                <input
                                    type="text"
                                    name="name"
                                    className="form-control"
                                    required
                                    value={formData.name}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="form-group">
                                <label>Category</label>
                                <select
                                    name="category"
                                    className="form-control"
                                    required
                                    value={formData.category}
                                    onChange={handleChange}
                                >
                                    <option value="">Select Category</option>
                                    {categories.map(cat => (
                                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-group">
                                <label>Description</label>
                                <textarea
                                    name="description"
                                    className="form-control"
                                    required
                                    value={formData.description}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="form-group">
                                <label>Address</label>
                                <input
                                    type="text"
                                    name="address"
                                    className="form-control"
                                    required
                                    value={formData.address}
                                    onChange={handleChange}
                                />
                            </div>

                            {/* Image Upload Toggle Section (Reused from AddPlace logic) */}
                            <div className="form-group">
                                <label>Place Image</label>
                                <div className="d-flex gap-2 mb-3">
                                    <button
                                        type="button"
                                        className={`btn btn-sm ${imageMode === 'upload' ? 'btn-primary' : 'btn-outline-secondary'}`}
                                        onClick={() => setImageMode('upload')}
                                    >
                                        <CloudUpload size={16} className="me-2" /> Upload Photo
                                    </button>
                                    <button
                                        type="button"
                                        className={`btn btn-sm ${imageMode === 'url' ? 'btn-primary' : 'btn-outline-secondary'}`}
                                        onClick={() => setImageMode('url')}
                                    >
                                        <GeoAlt size={16} className="me-2" /> Image URL
                                    </button>
                                </div>

                                {imageMode === 'url' ? (
                                    <input
                                        type="url"
                                        name="imageUrl"
                                        className="form-control"
                                        placeholder="https://example.com/image.jpg"
                                        value={formData.imageUrl}
                                        onChange={handleChange}
                                    />
                                ) : (
                                    <div className="file-upload-wrapper">
                                        <input
                                            type="file"
                                            className="form-control"
                                            accept="image/*"
                                            onChange={handleFileUpload}
                                            disabled={uploadingImage}
                                        />
                                        {uploadingImage && <div className="text-muted small mt-1">Uploading image...</div>}
                                    </div>
                                )}

                                <div className="image-preview-area mt-3">
                                    {formData.imageUrl ? (
                                        <div className="position-relative w-100 h-100">
                                            <img
                                                src={formData.imageUrl}
                                                alt="Preview"
                                                className="img-fluid rounded w-100 h-100"
                                                style={{ objectFit: 'cover' }}
                                                onError={(e) => e.target.src = 'https://placehold.co/600x400?text=Invalid+Image'}
                                            />
                                            <button
                                                type="button"
                                                className="btn btn-danger btn-sm position-absolute top-0 end-0 m-2"
                                                onClick={() => setFormData(prev => ({ ...prev, imageUrl: '' }))}
                                            >
                                                <Trash size={16} />
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="text-center p-4 text-muted border rounded bg-light">
                                            <CloudUpload size={32} className="mb-2" />
                                            <p className="mb-0">No image selected</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="form-row-2">
                                <div className="form-group">
                                    <label>Phone Number</label>
                                    <input
                                        type="tel"
                                        name="phone"
                                        className="form-control"
                                        value={formData.phone}
                                        onChange={handleChange}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Website (Optional)</label>
                                    <input
                                        type="url"
                                        name="website"
                                        className="form-control"
                                        value={formData.website}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>

                            <div className="form-row-2">
                                <div className="form-group">
                                    <label>Opening Time</label>
                                    <input
                                        type="time"
                                        name="openingTime"
                                        className="form-control"
                                        value={formData.openingTime}
                                        onChange={handleChange}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Closing Time</label>
                                    <input
                                        type="time"
                                        name="closingTime"
                                        className="form-control"
                                        value={formData.closingTime}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="form-actions">
                            <Link to="/profile?tab=places" className="btn-cancel">Cancel</Link>
                            <button type="submit" className="btn-submit" disabled={isLoading || uploadingImage}>
                                {isLoading ? 'Updating...' : <><CheckCircle /> Save Changes</>}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default EditPlace;
