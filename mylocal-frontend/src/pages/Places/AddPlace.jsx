// src/pages/Places/AddPlace.jsx
import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './AddPlace.css';
import { CloudUpload, GeoAlt, CheckCircle, Plus, X } from 'react-bootstrap-icons';
import { createPlace } from '../../api/place.api';
import { uploadPhoto } from '../../api/media.api';
import { getCategories, createCategory } from '../../api/category.api';

const AddPlace = () => {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [categories, setCategories] = useState([]);
    const [showCategoryModal, setShowCategoryModal] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState('');
    const [isUploading, setIsUploading] = useState(false);
    const [uploadType, setUploadType] = useState('url');
    const [formData, setFormData] = useState({
        name: '',
        category: '',
        address: '',
        description: '',
        imageUrl: '',
        phone: '',
        website: '',
        price: '1',
        openingTime: '',
        closingTime: ''
    });

    const [selectedFile, setSelectedFile] = useState(null);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await getCategories();
                setCategories(response.data || []);
            } catch (error) {
                console.error('Failed to fetch categories:', error);
            }
        };
        fetchCategories();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleCreateCategory = async () => {
        if (!newCategoryName.trim()) {
            alert("Please enter a category name");
            return;
        }

        try {
            const response = await createCategory({
                name: newCategoryName,
                icon: 'Pin',
                color: '#000000',
                description: 'User created category'
            });

            const newCat = response.data;
            setCategories([...categories, newCat]);

            // Select the new category
            setFormData(prev => ({ ...prev, category: newCat.id }));

            setNewCategoryName('');
            setShowCategoryModal(false);
        } catch (error) {
            console.error('Error creating category:', error);
            alert('Failed to create category');
        }
    };

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setSelectedFile(file);

        // Create preview URL
        const reader = new FileReader();
        reader.onloadend = () => {
            setFormData(prev => ({ ...prev, imageUrl: reader.result }));
        };
        reader.readAsDataURL(file);
        setIsUploading(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            // Get logged in user ID from localStorage or context (adjust based on your auth setup)
            const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
            const userId = currentUser.id || 1; // Fallback to 1 if no user

            if (!formData.category) {
                alert("Please select a category.");
                setIsLoading(false);
                return;
            }
            const categoryId = parseInt(formData.category);

            // Create hours object - simple object format that will be stored as JSON
            // Create hours object - array of objects format as expected by API
            const hoursPayload = [
                { day: "Monday", open: formData.openingTime || "09:00", close: formData.closingTime || "18:00" },
                { day: "Tuesday", open: formData.openingTime || "09:00", close: formData.closingTime || "18:00" },
                { day: "Wednesday", open: formData.openingTime || "09:00", close: formData.closingTime || "18:00" },
                { day: "Thursday", open: formData.openingTime || "09:00", close: formData.closingTime || "18:00" },
                { day: "Friday", open: formData.openingTime || "09:00", close: formData.closingTime || "18:00" },
                { day: "Saturday", open: "10:00", close: "15:00" },
                { day: "Sunday", open: "Closed", close: "Closed" }
            ];

            // Extract latitude and longitude from address (for now using dummy coordinates for Tunis)
            // In production, you'd use a geocoding service
            const latitude = 36.8065;
            const longitude = 10.1815;

            let imageUrl = null;

            // Upload photo first if selected
            if (uploadType === 'file' && selectedFile) {
                try {
                    const uploadFormData = new FormData();
                    uploadFormData.append('file', selectedFile);
                    const photoResponse = await uploadPhoto(uploadFormData);

                    // Handle response to get URL
                    // media-service returns { id, url, ... } directly due to new JsonResponse(...)
                    if (photoResponse.data && photoResponse.data.url) {
                        imageUrl = photoResponse.data.url;
                    }
                } catch (uploadError) {
                    console.error('Error uploading photo:', uploadError);
                    alert('Photo upload failed, creating place without photo.');
                    // Continue without photo 
                }
            } else if (uploadType === 'url') {
                imageUrl = formData.imageUrl || null;
            }

            const placeData = {
                name: formData.name,
                description: formData.description || formData.name,
                address: formData.address,
                latitude: latitude,
                longitude: longitude,
                phone: formData.phone || null,
                hours: hoursPayload,
                ownerId: userId,
                categoryId: categoryId,
                imageUrl: imageUrl // Use the uploaded URL or the form URL
            };

            const response = await createPlace(placeData);

            setIsLoading(false);
            // Navigate to discover/places page to see the new place immediately
            navigate('/places');
        } catch (error) {
            console.error('Error creating place:', error);
            if (error.response && error.response.data) {
                console.error('Validation errors:', error.response.data);
                const errorMsg = typeof error.response.data === 'string'
                    ? error.response.data
                    : JSON.stringify(error.response.data, null, 2);
                alert(`Failed to create place:\n${errorMsg}`);
            } else {
                alert('Failed to create place. Please try again.');
            }
            setIsLoading(false);
        }
    };

    return (
        <div className="add-place-page">
            <div className="add-place-container">
                <header className="add-place-header">
                    <h1>Add a New Place</h1>
                    <p>Share a hidden gem with the community</p>
                </header>

                <div className="place-form-card">
                    <form onSubmit={handleSubmit}>
                        <div className="form-grid">
                            <div className="form-group">
                                <label>Place Name</label>
                                <input
                                    type="text"
                                    name="name"
                                    className="form-control"
                                    placeholder="e.g. The Secret Garden Cafe"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="form-row-2">
                                <div className="form-group">
                                    <label>Category</label>
                                    <div className="d-flex gap-2">
                                        <select
                                            name="category"
                                            className="form-control"
                                            value={formData.category}
                                            onChange={handleChange}
                                            required
                                        >
                                            <option value="">Select Category...</option>
                                            {categories.map(cat => (
                                                <option key={cat.id} value={cat.id}>{cat.name}</option>
                                            ))}
                                        </select>
                                        <button
                                            type="button"
                                            className="btn btn-outline-primary d-flex align-items-center justify-content-center"
                                            style={{ width: '42px', height: '42px', padding: 0 }}
                                            onClick={() => setShowCategoryModal(true)}
                                            title="Add New Category"
                                        >
                                            <Plus size={24} />
                                        </button>
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label>Address / Location</label>
                                    <div className="input-group" style={{ position: 'relative' }}>
                                        <input
                                            type="text"
                                            name="address"
                                            className="form-control"
                                            placeholder="e.g. 123 Main St, Tunis"
                                            value={formData.address}
                                            onChange={handleChange}
                                            required
                                            style={{ paddingRight: '40px' }}
                                        />
                                        <GeoAlt
                                            size={18}
                                            style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748B' }}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="form-row-2">
                                <div className="form-group">
                                    <label>Phone Number</label>
                                    <input
                                        type="tel"
                                        name="phone"
                                        className="form-control"
                                        placeholder="+216 71 000 000"
                                        value={formData.phone}
                                        onChange={handleChange}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Website</label>
                                    <input
                                        type="url"
                                        name="website"
                                        className="form-control"
                                        placeholder="https://www.example.com"
                                        value={formData.website}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>

                            <div className="form-row-2">
                                <div className="form-group">
                                    <label>Price Level</label>
                                    <select
                                        name="price"
                                        className="form-control"
                                        value={formData.price}
                                        onChange={handleChange}
                                    >
                                        <option value="1">$ (Cheap)</option>
                                        <option value="2">$$ (Moderate)</option>
                                        <option value="3">$$$ (Expensive)</option>
                                        <option value="4">$$$$ (Luxury)</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Opening Hours</label>
                                    <div className="d-flex gap-2">
                                        <input
                                            type="time"
                                            name="openingTime"
                                            className="form-control"
                                            value={formData.openingTime}
                                            onChange={handleChange}
                                        />
                                        <span className="align-self-center text-muted">to</span>
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

                            <div className="form-group">
                                <label>Description</label>
                                <textarea
                                    name="description"
                                    className="form-control"
                                    placeholder="Tell us what makes this place special..."
                                    value={formData.description}
                                    onChange={handleChange}
                                    required
                                ></textarea>
                            </div>

                            <div className="form-group">
                                <label className="d-flex justify-content-between align-items-center">
                                    Place Image
                                    <div className="btn-group btn-group-sm">
                                        <button
                                            type="button"
                                            className={`btn ${uploadType === 'url' ? 'btn-primary' : 'btn-outline-primary'}`}
                                            onClick={() => setUploadType('url')}
                                        >
                                            Image URL
                                        </button>
                                        <button
                                            type="button"
                                            className={`btn ${uploadType === 'file' ? 'btn-primary' : 'btn-outline-primary'}`}
                                            onClick={() => setUploadType('file')}
                                        >
                                            Upload Photo
                                        </button>
                                    </div>
                                </label>

                                {uploadType === 'url' ? (
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
                                            disabled={isUploading}
                                        />
                                        {isUploading && <div className="text-muted small mt-1">Uploading...</div>}
                                    </div>
                                )}

                                <div className="image-preview-area mt-3">
                                    {formData.imageUrl ? (
                                        <img
                                            src={formData.imageUrl}
                                            alt="Preview"
                                            className="w-100 h-100 rounded"
                                            style={{ objectFit: 'cover' }}
                                            onError={(e) => {
                                                e.target.onerror = null;
                                                e.target.src = 'https://via.placeholder.com/800x400?text=Invalid+Image';
                                            }}
                                        />
                                    ) : (
                                        <div className="text-center">
                                            <CloudUpload size={32} className="mb-2" />
                                            <p className="mb-0">
                                                {uploadType === 'url' ? 'Enter an image URL' : 'Upload an image'} to preview
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="form-actions">
                            <Link to="/profile" className="btn-cancel">Cancel</Link>
                            <button type="submit" className="btn-submit" disabled={isLoading}>
                                {isLoading ? 'Adding Place...' : <><CheckCircle /> Submit Place</>}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
            {showCategoryModal && (
                <div className="modal-overlay" style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000,
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                    <div className="bg-white p-4 rounded shadow-lg" style={{ width: '100%', maxWidth: '400px' }}>
                        <div className="d-flex justify-content-between align-items-center mb-3">
                            <h3 className="h5 mb-0">Add New Category</h3>
                            <button
                                className="btn btn-link p-0 text-dark"
                                onClick={() => setShowCategoryModal(false)}
                            >
                                <X size={24} />
                            </button>
                        </div>
                        <div className="mb-3">
                            <label className="form-label">Category Name</label>
                            <input
                                type="text"
                                className="form-control"
                                value={newCategoryName}
                                onChange={(e) => setNewCategoryName(e.target.value)}
                                placeholder="e.g. Sushi Bar"
                                autoFocus
                            />
                        </div>
                        <div className="d-flex justify-content-end gap-2">
                            <button
                                className="btn btn-secondary"
                                onClick={() => setShowCategoryModal(false)}
                            >
                                Cancel
                            </button>
                            <button
                                className="btn btn-primary"
                                onClick={handleCreateCategory}
                                disabled={!newCategoryName.trim()}
                            >
                                Create Category
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AddPlace;
