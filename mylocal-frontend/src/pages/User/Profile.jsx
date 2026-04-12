// src/pages/User/Profile.jsx
import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { getUserFavorites } from '../../api/favorite.api';
import { getReviewsByUser } from '../../api/review.api';
import { getPlacesByUser, deletePlace } from '../../api/place.api';
import { getUserById, updateUser } from '../../api/user.api';
import './Profile.css';
import {
    Person,
    Heart,
    Star,
    Gear,
    BoxArrowRight,
    GeoAltFill,
    StarFill,
    PlusCircle,
    Camera,
    CheckCircle,
    Pencil,
    InfoCircle,
    Clock,
    Map,
    Phone,
    Building,
    Envelope,
    GeoAlt,
    ChatDots,
    Moon,
    Sun,
    Bell,
    Globe,
    Eye,
    ShieldCheck,
    Palette,
    Trash
} from 'react-bootstrap-icons';

const getCategoryName = (id) => {
    const categories = {
        1: 'Restaurant',
        2: 'Coffee Shop',
        3: 'Park',
        4: 'Museum',
        5: 'Co-working',
        6: 'Shop'
    };
    return categories[id] || 'Place';
};

// Profile completion indicator
const ProfileCompletion = ({ user }) => {
    const calculateCompletion = () => {
        // Only count fields that exist in the User entity
        const fields = [
            user?.firstName,
            user?.lastName,
            user?.phone,
            user?.city,
            user?.avatar
        ];
        const completedFields = fields.filter(field => field && field.trim() !== '').length;
        return Math.round((completedFields / fields.length) * 100);
    };

    const completion = calculateCompletion();

    return (
        <div className="profile-completion mb-4">
            <div className="d-flex justify-content-between align-items-center mb-2">
                <small className="text-muted fw-semibold">Profile Completion</small>
                <span className="badge bg-primary">{completion}%</span>
            </div>
            <div className="progress" style={{ height: '6px', borderRadius: '10px' }}>
                <div
                    className="progress-bar bg-primary"
                    role="progressbar"
                    style={{ width: `${completion}%`, borderRadius: '10px' }}
                    aria-valuenow={completion}
                    aria-valuemin="0"
                    aria-valuemax="100"
                ></div>
            </div>
            {completion < 100 && (
                <small className="text-muted d-block mt-2">
                    Complete your profile to unlock all features!
                </small>
            )}
        </div>
    );
};

// Avatar Upload Component
const AvatarUpload = ({ currentAvatar, onUpload, disabled }) => {
    const [preview, setPreview] = useState(currentAvatar || '');
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState('');

    // Update preview when currentAvatar changes
    useEffect(() => {
        setPreview(currentAvatar || '');
    }, [currentAvatar]);

    const compressImage = (file, maxWidth = 400, maxHeight = 400, quality = 0.8) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    let width = img.width;
                    let height = img.height;

                    // Calculate new dimensions
                    if (width > height) {
                        if (width > maxWidth) {
                            height = (height * maxWidth) / width;
                            width = maxWidth;
                        }
                    } else {
                        if (height > maxHeight) {
                            width = (width * maxHeight) / height;
                            height = maxHeight;
                        }
                    }

                    canvas.width = width;
                    canvas.height = height;

                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, width, height);

                    // Convert to base64
                    const base64String = canvas.toDataURL('image/jpeg', quality);
                    resolve(base64String);
                };
                img.onerror = reject;
                img.src = e.target.result;
            };
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    };

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Validate file
        if (!file.type.startsWith('image/')) {
            setError('Please upload an image file');
            return;
        }

        if (file.size > 5 * 1024 * 1024) { // 5MB limit
            setError('Image size should be less than 5MB');
            return;
        }

        setUploading(true);
        setError('');

        try {
            // Compress and resize image before converting to base64
            const compressedBase64 = await compressImage(file, 400, 400, 0.8);
            setPreview(compressedBase64);

            // Upload immediately to save in database
            try {
                await onUpload(compressedBase64);
                setUploading(false);
            } catch (uploadError) {
                console.error('Upload failed:', uploadError);
                setError('Failed to save avatar. Please try again.');
                setUploading(false);
                setPreview(currentAvatar); // Revert to previous avatar
            }

        } catch (err) {
            console.error('Upload failed:', err);
            setError('Failed to process image. Please try again.');
            setUploading(false);
        }
    };

    const handleRemoveAvatar = () => {
        setPreview('');
        onUpload('');
    };

    return (
        <div className="avatar-upload-container text-center mb-4">
            <div className="position-relative d-inline-block">
                <div className="user-avatar-large mb-3">
                    {preview ? (
                        <img src={preview} alt="Avatar" className="w-100 h-100" />
                    ) : (
                        <div className="w-100 h-100 d-flex align-items-center justify-content-center bg-light text-muted">
                            <Person size={48} />
                        </div>
                    )}
                </div>
                <label className="position-absolute bottom-0 end-0 mb-2 me-2">
                    <div className="bg-primary text-white rounded-circle p-2 cursor-pointer d-flex align-items-center justify-content-center"
                        style={{ width: '36px', height: '36px' }}>
                        {uploading ? (
                            <div className="spinner-border spinner-border-sm" role="status">
                                <span className="visually-hidden">Loading...</span>
                            </div>
                        ) : (
                            <Camera size={16} />
                        )}
                    </div>
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        disabled={uploading || disabled}
                        style={{ display: 'none' }}
                    />
                </label>
                {preview && (
                    <button
                        type="button"
                        onClick={handleRemoveAvatar}
                        className="position-absolute top-0 end-0 mt-2 me-2 btn btn-sm btn-danger rounded-circle p-1"
                        style={{ width: '28px', height: '28px' }}
                        disabled={uploading || disabled}
                    >
                        ×
                    </button>
                )}
            </div>
            {error && (
                <div className="text-danger small mt-2">{error}</div>
            )}
            <small className="text-muted d-block">
                Click the camera icon to upload a new avatar
            </small>
        </div>
    );
};

// Settings Form Component
const SettingsForm = ({ user, onUpdate, showHeader = true, mode = 'edit', onCancel }) => {
    // Initialize form data with user data
    const [formData, setFormData] = useState({
        firstName: user?.firstName || '',
        lastName: user?.lastName || '',
        phone: user?.phone || '',
        city: user?.city || '',
        avatar: user?.avatar || '',
        bio: user?.bio || ''
    });

    // Update form data when user changes
    useEffect(() => {
        if (user) {
            setFormData({
                firstName: user.firstName || '',
                lastName: user.lastName || '',
                phone: user.phone || '',
                city: user.city || '',
                avatar: user.avatar || '',
                bio: user.bio || ''
            });
        }
    }, [user]);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [errors, setErrors] = useState({});

    const validateForm = () => {
        const newErrors = {};

        if (!formData.firstName.trim()) {
            newErrors.firstName = 'First name is required';
        }

        if (!formData.lastName.trim()) {
            newErrors.lastName = 'Last name is required';
        }

        if (formData.phone && !/^[\d\s\-\+\(\)]{10,}$/.test(formData.phone)) {
            newErrors.phone = 'Please enter a valid phone number';
        }

        // Bio is stored locally only (not in backend), so validation is optional
        if (formData.bio && formData.bio.length > 500) {
            newErrors.bio = 'Bio must be less than 500 characters';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        // Clear error for this field
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }

        setMessage('');
    };

    const handleAvatarUpload = async (avatarUrl) => {
        // Update form data immediately for preview
        setFormData(prev => ({
            ...prev,
            avatar: avatarUrl
        }));

        // Save avatar to database immediately if user exists
        if (user && user.id && avatarUrl) {
            try {
                console.log('Saving avatar for user:', user.id);
                // Save just the avatar to the database
                await updateUser(user.id, { avatar: avatarUrl });
                setMessage('Avatar saved successfully!');

                // Update localStorage
                const updatedUser = {
                    ...user,
                    avatar: avatarUrl
                };
                localStorage.setItem('user', JSON.stringify(updatedUser));
                window.dispatchEvent(new Event('authChange'));
            } catch (error) {
                console.error('Error saving avatar:', error);
                setMessage('Failed to save avatar. Please try again.');
            }
        } else if (!avatarUrl) {
            // Remove avatar if empty string
            if (user && user.id) {
                try {
                    await updateUser(user.id, { avatar: null });
                    setMessage('Avatar removed successfully!');

                    // Update localStorage
                    const updatedUser = {
                        ...user,
                        avatar: null
                    };
                    localStorage.setItem('user', JSON.stringify(updatedUser));
                    window.dispatchEvent(new Event('authChange'));
                } catch (error) {
                    console.error('Error removing avatar:', error);
                    setMessage('Failed to remove avatar. Please try again.');
                }
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            setMessage('Please fix the errors in the form');
            return;
        }

        setLoading(true);
        setMessage('');

        try {
            // Check if user has an ID
            if (!user || !user.id) {
                setMessage('Error: User ID not found. Please login again.');
                setLoading(false);
                return;
            }

            // Always use updateUser since user already exists after registration
            // Remove bio from formData as it's not in the backend User entity
            const { bio, ...userDataToUpdate } = formData;

            console.log('Updating user:', user.id, userDataToUpdate);
            console.log('API URL will be:', `/api/users/${user.id}`);

            const response = await updateUser(user.id, userDataToUpdate);
            console.log('Update response:', response);

            const successMessage = mode === 'create' ? 'Profile created successfully!' : 'Profile updated successfully!';
            setMessage(successMessage);

            // Reload user data
            if (onUpdate && user.id) {
                await onUpdate(user.id);
            }

            // Update localStorage (including bio for local storage only)
            const updatedUser = {
                ...user,
                ...formData, // Include bio for local storage
                name: `${formData.firstName} ${formData.lastName}`
            };
            localStorage.setItem('user', JSON.stringify(updatedUser));
            window.dispatchEvent(new Event('authChange'));

            // Auto-clear success message and return to view mode after save
            setTimeout(() => {
                setMessage('');
                if (onCancel && mode === 'edit') {
                    onCancel(); // Return to read-only view after saving
                }
            }, 1500);
        } catch (error) {
            console.error('Error saving profile:', error);
            console.error('Error details:', {
                message: error.message,
                response: error.response?.data,
                status: error.response?.status,
                url: error.config?.url,
                user: user?.id,
                userObject: user
            });

            let errorMsg = 'Failed to save profile. Please try again.';

            if (error.response?.status === 404) {
                errorMsg = 'User not found. Please login again.';
            } else if (error.response?.data?.message) {
                errorMsg = error.response.data.message;
            } else if (error.message) {
                errorMsg = error.message;
            }

            setMessage(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            {showHeader && (
                <div className="content-header d-flex justify-content-between align-items-center">
                    <div>
                        <h2>{mode === 'create' ? 'Complete Your Profile' : 'Edit Profile'}</h2>
                        <p className="text-muted mb-0">
                            {mode === 'create'
                                ? 'Please complete your profile to get started'
                                : 'Update your personal information'}
                        </p>
                    </div>
                    <div className="d-flex gap-2 align-items-center">
                        {mode === 'create' && (
                            <div className="badge bg-warning text-dark">Required</div>
                        )}
                        {mode === 'edit' && onCancel && (
                            <button
                                className="btn btn-outline-secondary"
                                onClick={onCancel}
                                disabled={loading}
                            >
                                Cancel
                            </button>
                        )}
                    </div>
                </div>
            )}

            {message && (
                <div className={`alert ${message.includes('success') ? 'alert-success' : 'alert-danger'} alert-dismissible fade show`}>
                    {message}
                    <button type="button" className="btn-close" onClick={() => setMessage('')}></button>
                </div>
            )}

            <form onSubmit={handleSubmit}>
                <div className="row g-4">
                    {/* Left Column - Avatar & Bio */}
                    <div className="col-lg-4">
                        <div className="card border-0 shadow-sm p-3 h-100">
                            <h5 className="mb-3 d-flex align-items-center gap-2">
                                <Person size={18} />
                                Profile Picture
                            </h5>
                            <AvatarUpload
                                currentAvatar={formData.avatar}
                                onUpload={handleAvatarUpload}
                                disabled={loading}
                            />

                            <div className="form-group">
                                <label className="form-label d-flex align-items-center gap-2">
                                    <ChatDots size={14} />
                                    Bio <small className="text-muted">(Optional)</small>
                                </label>
                                <textarea
                                    name="bio"
                                    className={`form-control ${errors.bio ? 'is-invalid' : ''}`}
                                    value={formData.bio}
                                    onChange={handleChange}
                                    rows="6"
                                    placeholder="Tell us a little about yourself..."
                                    maxLength={500}
                                    disabled={loading}
                                />
                                {errors.bio && (
                                    <div className="invalid-feedback">{errors.bio}</div>
                                )}
                                <div className="d-flex justify-content-between align-items-center mt-2">
                                    <small className="text-muted">
                                        {formData.bio.length}/500 characters
                                    </small>
                                    <InfoCircle size={12} className="text-muted"
                                        title="Share something interesting about yourself!" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Form Fields */}
                    <div className="col-lg-8">
                        <div className="card border-0 shadow-sm p-4 h-100">
                            <h5 className="mb-4 d-flex align-items-center gap-2">
                                <Person size={18} />
                                Personal Information
                            </h5>

                            <div className="row g-3">
                                <div className="col-md-6">
                                    <div className="form-group">
                                        <label className="form-label d-flex align-items-center gap-2">
                                            <Person size={14} />
                                            First Name <span className="text-danger">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            name="firstName"
                                            className={`form-control ${errors.firstName ? 'is-invalid' : ''}`}
                                            value={formData.firstName}
                                            onChange={handleChange}
                                            required
                                            disabled={loading}
                                            placeholder="Enter your first name"
                                        />
                                        {errors.firstName && (
                                            <div className="invalid-feedback">{errors.firstName}</div>
                                        )}
                                    </div>
                                </div>

                                <div className="col-md-6">
                                    <div className="form-group">
                                        <label className="form-label d-flex align-items-center gap-2">
                                            <Person size={14} />
                                            Last Name <span className="text-danger">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            name="lastName"
                                            className={`form-control ${errors.lastName ? 'is-invalid' : ''}`}
                                            value={formData.lastName}
                                            onChange={handleChange}
                                            required
                                            disabled={loading}
                                            placeholder="Enter your last name"
                                        />
                                        {errors.lastName && (
                                            <div className="invalid-feedback">{errors.lastName}</div>
                                        )}
                                    </div>
                                </div>

                                <div className="col-md-6">
                                    <div className="form-group">
                                        <label className="form-label d-flex align-items-center gap-2">
                                            <Phone size={14} />
                                            Phone Number
                                        </label>
                                        <input
                                            type="tel"
                                            name="phone"
                                            className={`form-control ${errors.phone ? 'is-invalid' : ''}`}
                                            value={formData.phone}
                                            onChange={handleChange}
                                            placeholder="+1 (555) 123-4567"
                                            disabled={loading}
                                        />
                                        {errors.phone && (
                                            <div className="invalid-feedback">{errors.phone}</div>
                                        )}
                                    </div>
                                </div>

                                <div className="col-md-6">
                                    <div className="form-group">
                                        <label className="form-label d-flex align-items-center gap-2">
                                            <GeoAlt size={14} />
                                            City
                                        </label>
                                        <input
                                            type="text"
                                            name="city"
                                            className="form-control"
                                            value={formData.city}
                                            onChange={handleChange}
                                            placeholder="New York, NY"
                                            disabled={loading}
                                        />
                                    </div>
                                </div>

                                <div className="col-12">
                                    <div className="form-group">
                                        <label className="form-label d-flex align-items-center gap-2">
                                            <Envelope size={14} />
                                            Email Address
                                        </label>
                                        <input
                                            type="email"
                                            className="form-control bg-light"
                                            value={user.email}
                                            readOnly
                                            disabled
                                        />
                                        <small className="text-muted mt-1 d-block">
                                            Contact support to change your email address
                                        </small>
                                    </div>
                                </div>
                            </div>

                            <div className="d-flex flex-column flex-md-row gap-2 mt-5 pt-4 border-top">
                                <button
                                    type="submit"
                                    className="btn btn-primary px-4 py-2 d-flex align-items-center justify-content-center gap-2"
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <>
                                            <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                                            Saving...
                                        </>
                                    ) : mode === 'create' ? (
                                        <>
                                            <CheckCircle size={18} />
                                            Complete Profile
                                        </>
                                    ) : (
                                        <>
                                            <CheckCircle size={18} />
                                            Save Changes
                                        </>
                                    )}
                                </button>

                                {mode === 'create' && (
                                    <button
                                        type="button"
                                        className="btn btn-outline-secondary"
                                        onClick={() => window.location.href = '/'}
                                        disabled={loading}
                                    >
                                        Skip for Now
                                    </button>
                                )}

                                <div className="ms-auto d-flex align-items-center gap-2 text-muted">
                                    <InfoCircle size={14} />
                                    <small>Fields marked with * are required</small>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
};

// User Info Card Component
const UserInfoCard = ({ user }) => (
    <div className="card border-0 shadow-sm mb-4">
        <div className="card-body">
            <h5 className="card-title d-flex align-items-center gap-2 mb-3">
                <Person size={18} />
                Profile Information
            </h5>
            <div className="row g-3">
                <div className="col-md-6">
                    <div className="d-flex align-items-center gap-2 mb-2">
                        <Person size={14} className="text-muted" />
                        <small className="text-muted">Full Name</small>
                    </div>
                    <p className="mb-0 fw-semibold">{user.name || 'Not set'}</p>
                </div>
                <div className="col-md-6">
                    <div className="d-flex align-items-center gap-2 mb-2">
                        <Envelope size={14} className="text-muted" />
                        <small className="text-muted">Email</small>
                    </div>
                    <p className="mb-0 fw-semibold">{user.email}</p>
                </div>
                <div className="col-md-6">
                    <div className="d-flex align-items-center gap-2 mb-2">
                        <Phone size={14} className="text-muted" />
                        <small className="text-muted">Phone</small>
                    </div>
                    <p className="mb-0 fw-semibold">{user.phone || 'Not set'}</p>
                </div>
                <div className="col-md-6">
                    <div className="d-flex align-items-center gap-2 mb-2">
                        <GeoAlt size={14} className="text-muted" />
                        <small className="text-muted">Location</small>
                    </div>
                    <p className="mb-0 fw-semibold">{user.city || 'Not set'}</p>
                </div>
                {user.bio && (
                    <div className="col-12">
                        <div className="d-flex align-items-center gap-2 mb-2">
                            <ChatDots size={14} className="text-muted" />
                            <small className="text-muted">Bio</small>
                        </div>
                        <p className="mb-0 text-muted">{user.bio}</p>
                    </div>
                )}
            </div>
        </div>
    </div>
);

// Settings Component for Theme and Preferences
const SettingsComponent = ({ user }) => {
    const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
    const [notifications, setNotifications] = useState(localStorage.getItem('notifications') !== 'false');
    const [language, setLanguage] = useState(localStorage.getItem('language') || 'en');
    const [emailNotifications, setEmailNotifications] = useState(localStorage.getItem('emailNotifications') !== 'false');
    const [saveLoading, setSaveLoading] = useState(false);

    useEffect(() => {
        // Apply theme to document
        if (theme === 'dark') {
            document.documentElement.setAttribute('data-theme', 'dark');
            document.body.classList.add('dark-theme');
        } else {
            document.documentElement.setAttribute('data-theme', 'light');
            document.body.classList.remove('dark-theme');
        }
    }, [theme]);

    const handleThemeChange = (newTheme) => {
        setTheme(newTheme);
        localStorage.setItem('theme', newTheme);
    };

    const handleSavePreferences = () => {
        setSaveLoading(true);
        localStorage.setItem('notifications', notifications.toString());
        localStorage.setItem('language', language);
        localStorage.setItem('emailNotifications', emailNotifications.toString());

        setTimeout(() => {
            setSaveLoading(false);
            alert('Preferences saved successfully!');
        }, 500);
    };

    return (
        <div>
            <div className="content-header">
                <div>
                    <h2>Settings</h2>
                    <p className="text-muted mb-0">Customize your experience</p>
                </div>
            </div>

            <div className="row g-4">
                {/* Theme Settings */}
                <div className="col-12">
                    <div className="card border-0 shadow-sm">
                        <div className="card-body p-4">
                            <div className="d-flex align-items-center gap-3 mb-4">
                                <div className="settings-icon-wrapper bg-primary bg-opacity-10 p-3 rounded-circle">
                                    <Palette size={24} className="text-primary" />
                                </div>
                                <div>
                                    <h5 className="mb-0">Appearance</h5>
                                    <small className="text-muted">Choose your preferred theme</small>
                                </div>
                            </div>

                            <div className="theme-selector">
                                <div className="row g-3">
                                    <div className="col-md-6">
                                        <button
                                            className={`theme-option ${theme === 'light' ? 'active' : ''}`}
                                            onClick={() => handleThemeChange('light')}
                                        >
                                            <div className="theme-preview light-theme-preview">
                                                <Sun size={32} className="mb-2" />
                                            </div>
                                            <div className="d-flex align-items-center justify-content-between w-100">
                                                <span className="fw-semibold">Light Mode</span>
                                                {theme === 'light' && <CheckCircle size={20} className="text-primary" />}
                                            </div>
                                        </button>
                                    </div>
                                    <div className="col-md-6">
                                        <button
                                            className={`theme-option ${theme === 'dark' ? 'active' : ''}`}
                                            onClick={() => handleThemeChange('dark')}
                                        >
                                            <div className="theme-preview dark-theme-preview">
                                                <Moon size={32} className="mb-2" />
                                            </div>
                                            <div className="d-flex align-items-center justify-content-between w-100">
                                                <span className="fw-semibold">Dark Mode</span>
                                                {theme === 'dark' && <CheckCircle size={20} className="text-primary" />}
                                            </div>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Notification Settings */}
                <div className="col-12">
                    <div className="card border-0 shadow-sm">
                        <div className="card-body p-4">
                            <div className="d-flex align-items-center gap-3 mb-4">
                                <div className="settings-icon-wrapper bg-success bg-opacity-10 p-3 rounded-circle">
                                    <Bell size={24} className="text-success" />
                                </div>
                                <div>
                                    <h5 className="mb-0">Notifications</h5>
                                    <small className="text-muted">Manage your notification preferences</small>
                                </div>
                            </div>

                            <div className="settings-options">
                                <div className="setting-item d-flex justify-content-between align-items-center p-3 border rounded mb-3">
                                    <div className="d-flex align-items-center gap-3">
                                        <Bell size={20} className="text-muted" />
                                        <div>
                                            <h6 className="mb-0">Push Notifications</h6>
                                            <small className="text-muted">Receive notifications about new places and reviews</small>
                                        </div>
                                    </div>
                                    <div className="form-check form-switch">
                                        <input
                                            className="form-check-input"
                                            type="checkbox"
                                            checked={notifications}
                                            onChange={(e) => setNotifications(e.target.checked)}
                                            style={{ width: '3rem', height: '1.5rem', cursor: 'pointer' }}
                                        />
                                    </div>
                                </div>

                                <div className="setting-item d-flex justify-content-between align-items-center p-3 border rounded">
                                    <div className="d-flex align-items-center gap-3">
                                        <Envelope size={20} className="text-muted" />
                                        <div>
                                            <h6 className="mb-0">Email Notifications</h6>
                                            <small className="text-muted">Get updates via email</small>
                                        </div>
                                    </div>
                                    <div className="form-check form-switch">
                                        <input
                                            className="form-check-input"
                                            type="checkbox"
                                            checked={emailNotifications}
                                            onChange={(e) => setEmailNotifications(e.target.checked)}
                                            style={{ width: '3rem', height: '1.5rem', cursor: 'pointer' }}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Language Settings */}
                <div className="col-12">
                    <div className="card border-0 shadow-sm">
                        <div className="card-body p-4">
                            <div className="d-flex align-items-center gap-3 mb-4">
                                <div className="settings-icon-wrapper bg-info bg-opacity-10 p-3 rounded-circle">
                                    <Globe size={24} className="text-info" />
                                </div>
                                <div>
                                    <h5 className="mb-0">Language</h5>
                                    <small className="text-muted">Select your preferred language</small>
                                </div>
                            </div>

                            <select
                                className="form-select form-select-lg"
                                value={language}
                                onChange={(e) => setLanguage(e.target.value)}
                                style={{ maxWidth: '300px' }}
                            >
                                <option value="en">English</option>
                                <option value="fr">Français</option>
                                <option value="ar">العربية</option>
                                <option value="es">Español</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Privacy Settings */}
                <div className="col-12">
                    <div className="card border-0 shadow-sm">
                        <div className="card-body p-4">
                            <div className="d-flex align-items-center gap-3 mb-4">
                                <div className="settings-icon-wrapper bg-warning bg-opacity-10 p-3 rounded-circle">
                                    <ShieldCheck size={24} className="text-warning" />
                                </div>
                                <div>
                                    <h5 className="mb-0">Privacy</h5>
                                    <small className="text-muted">Control your privacy settings</small>
                                </div>
                            </div>

                            <div className="settings-options">
                                <div className="setting-item d-flex justify-content-between align-items-center p-3 border rounded mb-3">
                                    <div className="d-flex align-items-center gap-3">
                                        <Eye size={20} className="text-muted" />
                                        <div>
                                            <h6 className="mb-0">Profile Visibility</h6>
                                            <small className="text-muted">Make your profile visible to other users</small>
                                        </div>
                                    </div>
                                    <div className="form-check form-switch">
                                        <input
                                            className="form-check-input"
                                            type="checkbox"
                                            defaultChecked
                                            style={{ width: '3rem', height: '1.5rem', cursor: 'pointer' }}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Save Button */}
                <div className="col-12">
                    <div className="d-flex justify-content-end gap-3">
                        <button
                            className="btn btn-outline-secondary"
                            onClick={() => {
                                setTheme('light');
                                setNotifications(true);
                                setLanguage('en');
                                setEmailNotifications(true);
                            }}
                        >
                            Reset to Defaults
                        </button>
                        <button
                            className="btn btn-primary d-flex align-items-center gap-2"
                            onClick={handleSavePreferences}
                            disabled={saveLoading}
                        >
                            {saveLoading ? (
                                <>
                                    <span className="spinner-border spinner-border-sm" role="status"></span>
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <CheckCircle size={18} />
                                    Save Preferences
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Read-Only Profile View Component
const ProfileView = ({ user, onEdit }) => {
    return (
        <div>
            <div className="content-header d-flex justify-content-between align-items-center">
                <div>
                    <h2>My Profile</h2>
                    <p className="text-muted mb-0">View your profile information</p>
                </div>
                <button
                    className="btn btn-primary d-flex align-items-center gap-2"
                    onClick={onEdit}
                >
                    <Pencil size={18} />
                    Edit Profile
                </button>
            </div>

            <div className="row g-4 mt-3">
                {/* Left Column - Avatar */}
                <div className="col-lg-4">
                    <div className="card border-0 shadow-sm p-4 text-center">
                        <div className="mb-3">
                            {user.avatar ? (
                                <img
                                    src={user.avatar}
                                    alt="Avatar"
                                    className="user-avatar-large mx-auto"
                                    style={{ width: '150px', height: '150px', borderRadius: '50%', objectFit: 'cover' }}
                                />
                            ) : (
                                <div className="user-avatar-large mx-auto d-flex align-items-center justify-content-center bg-light text-muted"
                                    style={{ width: '150px', height: '150px', borderRadius: '50%', fontSize: '4rem' }}>
                                    {user.firstName?.[0]?.toUpperCase() || user.name?.[0]?.toUpperCase() || 'U'}
                                </div>
                            )}
                        </div>
                        <h4 className="mb-1">{user.name || 'User'}</h4>
                        <p className="text-muted mb-0">{user.email}</p>
                        {user.city && (
                            <p className="d-flex align-items-center justify-content-center gap-1 text-muted mt-2 mb-0">
                                <GeoAltFill size={14} />
                                {user.city}
                            </p>
                        )}
                    </div>
                </div>

                {/* Right Column - Profile Details */}
                <div className="col-lg-8">
                    <div className="card border-0 shadow-sm p-4">
                        <h5 className="mb-4 d-flex align-items-center gap-2">
                            <Person size={18} />
                            Personal Information
                        </h5>
                        <div className="row g-4">
                            <div className="col-md-6">
                                <div className="profile-info-item">
                                    <div className="d-flex align-items-center gap-2 mb-2">
                                        <Person size={14} className="text-muted" />
                                        <small className="text-muted fw-semibold">First Name</small>
                                    </div>
                                    <p className="mb-0 fw-semibold">{user.firstName || 'Not set'}</p>
                                </div>
                            </div>
                            <div className="col-md-6">
                                <div className="profile-info-item">
                                    <div className="d-flex align-items-center gap-2 mb-2">
                                        <Person size={14} className="text-muted" />
                                        <small className="text-muted fw-semibold">Last Name</small>
                                    </div>
                                    <p className="mb-0 fw-semibold">{user.lastName || 'Not set'}</p>
                                </div>
                            </div>
                            <div className="col-md-6">
                                <div className="profile-info-item">
                                    <div className="d-flex align-items-center gap-2 mb-2">
                                        <Phone size={14} className="text-muted" />
                                        <small className="text-muted fw-semibold">Phone Number</small>
                                    </div>
                                    <p className="mb-0 fw-semibold">{user.phone || 'Not set'}</p>
                                </div>
                            </div>
                            <div className="col-md-6">
                                <div className="profile-info-item">
                                    <div className="d-flex align-items-center gap-2 mb-2">
                                        <GeoAlt size={14} className="text-muted" />
                                        <small className="text-muted fw-semibold">City</small>
                                    </div>
                                    <p className="mb-0 fw-semibold">{user.city || 'Not set'}</p>
                                </div>
                            </div>
                            <div className="col-12">
                                <div className="profile-info-item">
                                    <div className="d-flex align-items-center gap-2 mb-2">
                                        <Envelope size={14} className="text-muted" />
                                        <small className="text-muted fw-semibold">Email Address</small>
                                    </div>
                                    <p className="mb-0 fw-semibold">{user.email}</p>
                                    <small className="text-muted">Email cannot be changed</small>
                                </div>
                            </div>
                            {user.bio && (
                                <div className="col-12">
                                    <div className="profile-info-item">
                                        <div className="d-flex align-items-center gap-2 mb-2">
                                            <ChatDots size={14} className="text-muted" />
                                            <small className="text-muted fw-semibold">Bio</small>
                                        </div>
                                        <p className="mb-0 text-muted">{user.bio}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const Profile = () => {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const activeTab = searchParams.get('tab') || 'overview';
    const [user, setUser] = useState(null);
    const [myPlaces, setMyPlaces] = useState([]);
    const [savedPlaces, setSavedPlaces] = useState([]);
    const [myReviews, setMyReviews] = useState([]);
    const [loadingFavorites, setLoadingFavorites] = useState(false);
    const [loadingReviews, setLoadingReviews] = useState(false);
    const [loadingMyPlaces, setLoadingMyPlaces] = useState(false);
    const [initialCheckDone, setInitialCheckDone] = useState(false);
    const [requiresProfileCompletion, setRequiresProfileCompletion] = useState(false);
    const [loading, setLoading] = useState(true);
    const [isEditingProfile, setIsEditingProfile] = useState(false);

    // Check if user needs to complete profile
    const checkProfileCompletion = useCallback((userData) => {
        if (!userData) return false;

        // Check required fields
        const requiredFields = ['firstName', 'lastName'];
        const missingFields = requiredFields.filter(field => !userData[field] || userData[field].trim() === '');

        return missingFields.length > 0;
    }, []);

    // Define load functions before they're used
    const loadFavorites = useCallback(async (userId) => {
        setLoadingFavorites(true);
        try {
            const response = await getUserFavorites(userId);
            setSavedPlaces(response.data || []);
        } catch (error) {
            console.error('Error loading favorites:', error);
            setSavedPlaces([]);
        } finally {
            setLoadingFavorites(false);
        }
    }, []);

    const loadReviews = useCallback(async (userId) => {
        setLoadingReviews(true);
        try {
            const response = await getReviewsByUser(userId);
            setMyReviews(response.data || []);
        } catch (error) {
            console.error('Error loading reviews:', error);
            setMyReviews([]);
        } finally {
            setLoadingReviews(false);
        }
    }, []);

    const loadMyPlaces = useCallback(async (userId) => {
        setLoadingMyPlaces(true);
        try {
            const response = await getPlacesByUser(userId);
            setMyPlaces(response.data || []);
        } catch (error) {
            console.error('Error loading my places:', error);
            setMyPlaces([]);
        } finally {
            setLoadingMyPlaces(false);
        }
    }, []);

    // Initial Load & Auth Check
    useEffect(() => {
        const initializeProfile = async () => {
            setLoading(true);
            const storedUser = localStorage.getItem('user');

            if (!storedUser) {
                navigate('/login');
                return;
            }

            try {
                const userData = JSON.parse(storedUser);
                let completeUserData = userData;

                // If user has ID, load full data from API
                if (userData.id) {
                    try {
                        const response = await getUserById(userData.id);
                        completeUserData = {
                            ...userData,
                            ...response.data
                        };
                    } catch (error) {
                        console.warn('Could not fetch user from API, using localStorage data');
                    }
                }

                // Format user object
                const formattedUser = {
                    ...completeUserData,
                    name: `${completeUserData.firstName || ''} ${completeUserData.lastName || ''}`.trim() || completeUserData.name || 'User',
                    avatar: completeUserData.avatar || null
                };

                setUser(formattedUser);

                // Check profile completion (for display only, not for restrictions)
                const needsCompletion = checkProfileCompletion(completeUserData);
                setRequiresProfileCompletion(needsCompletion);

                // Load user content if they have ID
                if (completeUserData.id) {
                    await Promise.all([
                        loadFavorites(completeUserData.id),
                        loadReviews(completeUserData.id),
                        loadMyPlaces(completeUserData.id)
                    ]);
                }

            } catch (error) {
                console.error('Error initializing profile:', error);
                navigate('/login');
            } finally {
                setLoading(false);
                setInitialCheckDone(true);
            }
        };

        initializeProfile();
    }, [navigate, checkProfileCompletion, loadFavorites, loadReviews, loadMyPlaces]);

    // Listen for auth changes (like logout from other tabs)
    useEffect(() => {
        const handleAuthChange = () => {
            const storedUser = localStorage.getItem('user');
            if (!storedUser) {
                navigate('/login');
            }
        };

        window.addEventListener('authChange', handleAuthChange);
        return () => window.removeEventListener('authChange', handleAuthChange);
    }, [navigate]);

    // Listen for favorites changes
    useEffect(() => {
        const handleFavoritesChanged = () => {
            if (user && user.id) {
                loadFavorites(user.id);
            }
        };

        window.addEventListener('favoritesChanged', handleFavoritesChanged);
        return () => window.removeEventListener('favoritesChanged', handleFavoritesChanged);
    }, [user]);

    const loadUserData = async (userId) => {
        try {
            const response = await getUserById(userId);
            const userData = response.data;

            const formattedUser = {
                ...userData,
                name: `${userData.firstName || ''} ${userData.lastName || ''}`.trim() || 'User',
                avatar: userData.avatar || null
            };

            setUser(formattedUser);

            // Check profile completion
            const needsCompletion = checkProfileCompletion(userData);
            setRequiresProfileCompletion(needsCompletion);

            // Update localStorage
            localStorage.setItem('user', JSON.stringify(formattedUser));

        } catch (error) {
            console.error('Error loading user data:', error);
            // Fallback to localStorage data
            const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
            setUser({
                ...storedUser,
                name: storedUser.name || `${storedUser.firstName || ''} ${storedUser.lastName || ''}`.trim() || 'User',
                avatar: storedUser.avatar || null
            });
        }
    };


    const handleLogout = () => {
        localStorage.removeItem('user');
        window.dispatchEvent(new Event('authChange'));
        navigate('/');
    };

    const handleDeletePlace = async (placeId) => {
        if (window.confirm('Are you sure you want to delete this place? This action cannot be undone.')) {
            try {
                await deletePlace(placeId);
                if (user) loadMyPlaces(user.id);
                // Show toast or alert
                alert('Place deleted successfully');
            } catch (error) {
                console.error('Error deleting place:', error);
                alert('Failed to delete place');
            }
        }
    };

    const handleProfileUpdate = async (userId) => {
        await loadUserData(userId);
        setRequiresProfileCompletion(false);

        // Show success message
        const messageEvent = new CustomEvent('showToast', {
            detail: {
                message: 'Profile updated successfully!',
                type: 'success'
            }
        });
        window.dispatchEvent(messageEvent);
    };

    const renderContent = () => {
        switch (activeTab) {
            case 'profile':
                // Always show edit form in profile tab
                if (!user || !user.id) {
                    return (
                        <div className="alert alert-warning">
                            <h5>User not loaded</h5>
                            <p>Please wait while we load your profile information...</p>
                        </div>
                    );
                }
                return (
                    <SettingsForm
                        user={user}
                        onUpdate={handleProfileUpdate}
                        showHeader={true}
                        mode="edit"
                        onCancel={() => setSearchParams({ tab: 'overview' })}
                    />
                );
            case 'saved':
                return (
                    <div>
                        <div className="content-header">
                            <div>
                                <h2>Saved Places</h2>
                                <p className="text-muted mb-0">Your favorite places all in one spot</p>
                            </div>
                            {savedPlaces.length > 0 && (
                                <span className="badge bg-primary">{savedPlaces.length} places</span>
                            )}
                        </div>
                        {loadingFavorites ? (
                            <div className="text-center py-5">
                                <div className="spinner-border text-primary" role="status">
                                    <span className="visually-hidden">Loading...</span>
                                </div>
                                <p className="mt-2 text-muted">Loading your saved places...</p>
                            </div>
                        ) : savedPlaces.length > 0 ? (
                            <div className="saved-grid">
                                {savedPlaces.map(favorite => (
                                    <Link
                                        to={`/places/${favorite.placeId || favorite.id}`}
                                        key={favorite.id}
                                        className="text-decoration-none text-dark"
                                    >
                                        <div className="mini-place-card">
                                            {favorite.place?.imageUrl || favorite.place?.image ? (
                                                <img
                                                    src={favorite.place.imageUrl || favorite.place.image}
                                                    alt={favorite.place?.name || 'Place'}
                                                    className="mini-img"
                                                />
                                            ) : (
                                                <div className="mini-img d-flex align-items-center justify-content-center bg-light text-muted">
                                                    <GeoAltFill size={32} />
                                                </div>
                                            )}
                                            <div className="mini-content">
                                                <h4>{favorite.place?.name || 'Saved Place'}</h4>
                                                <span className="mini-meta">{getCategoryName(favorite.place?.categoryId) || favorite.place?.category || 'Place'} • {favorite.place?.address || 'Location'}</span>
                                                <div className="d-flex justify-content-between align-items-center mt-2">
                                                    <div className="rating-pill d-flex align-items-center">
                                                        <StarFill size={12} className="text-primary me-1" />
                                                        <small className="fw-bold">{favorite.place?.rating || 'N/A'}</small>
                                                    </div>
                                                    <Heart size={14} className="text-danger" />
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        ) : (
                            <div className="empty-places-state">
                                <div className="empty-icon-wrapper">
                                    <Heart size={36} />
                                </div>
                                <h3 className="empty-state-title">No saved places yet</h3>
                                <p className="empty-state-text">
                                    Start saving your favorite places to see them here!
                                </p>
                                <Link to="/places" className="btn-add-place-primary">
                                    <GeoAltFill size={18} /> Discover Places
                                </Link>
                            </div>
                        )}
                    </div>
                );

            case 'reviews':
                return (
                    <div>
                        <div className="content-header">
                            <div>
                                <h2>My Reviews</h2>
                                <p className="text-muted mb-0">Your contributions help others discover great places</p>
                            </div>
                            {myReviews.length > 0 && (
                                <span className="badge bg-primary">{myReviews.length} reviews</span>
                            )}
                        </div>

                        {loadingReviews ? (
                            <div className="text-center py-5">
                                <div className="spinner-border text-primary" role="status">
                                    <span className="visually-hidden">Loading...</span>
                                </div>
                                <p className="mt-2 text-muted">Loading your reviews...</p>
                            </div>
                        ) : myReviews.length > 0 ? (
                            <div className="reviews-list">
                                {myReviews.map(review => {
                                    const reviewDate = review.createdAt
                                        ? new Date(review.createdAt).toLocaleDateString('en-US', {
                                            year: 'numeric',
                                            month: 'short',
                                            day: 'numeric'
                                        })
                                        : 'Recently';
                                    return (
                                        <div key={review.id} className="user-review-item">
                                            <div className="d-flex justify-content-between align-items-start mb-2">
                                                <Link
                                                    to={`/places/${review.placeId}`}
                                                    className="review-place-link"
                                                >
                                                    {review.place?.name || `Place #${review.placeId}`}
                                                </Link>
                                                <span className="review-date">{reviewDate}</span>
                                            </div>
                                            <div className="review-stars mb-2">
                                                {[...Array(5)].map((_, i) => (
                                                    <StarFill
                                                        key={i}
                                                        className={i < review.rating ? "text-primary" : "text-muted"}
                                                        size={16}
                                                    />
                                                ))}
                                            </div>
                                            <p className="mb-0 text-muted">{review.content}</p>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="empty-places-state">
                                <div className="empty-icon-wrapper">
                                    <Star size={36} />
                                </div>
                                <h3 className="empty-state-title">No reviews yet</h3>
                                <p className="empty-state-text">
                                    Start reviewing places you've visited to help others discover great spots!
                                </p>
                                <Link to="/places" className="btn-add-place-primary">
                                    <GeoAltFill size={18} /> Discover Places
                                </Link>
                            </div>
                        )}
                    </div>
                );

            case 'places':
                return (
                    <div>
                        <div className="content-header d-flex justify-content-between align-items-center">
                            <div>
                                <h2>My Places</h2>
                                <p className="text-muted mb-0">Manage the places you've shared</p>
                            </div>
                            <button className="btn btn-primary d-flex align-items-center gap-2" onClick={() => navigate('/add-place')}>
                                <PlusCircle size={18} />
                                Add New
                            </button>
                        </div>
                        {loadingMyPlaces ? (
                            <div className="text-center py-5">
                                <div className="spinner-border text-primary" role="status">
                                    <span className="visually-hidden">Loading...</span>
                                </div>
                                <p className="mt-2 text-muted">Loading your places...</p>
                            </div>
                        ) : myPlaces.length > 0 ? (
                            <div className="saved-grid">
                                {myPlaces.map(place => (
                                    <div key={place.id} className="mini-place-card h-100 d-flex flex-column">
                                        <div className="position-relative">
                                            <div style={{ height: '160px', overflow: 'hidden' }}>
                                                <img
                                                    src={place.imageUrl || place.image || 'https://placehold.co/400x300?text=No+Image'}
                                                    className="w-100 h-100"
                                                    style={{ objectFit: 'cover' }}
                                                    alt={place.name}
                                                    onError={(e) => {
                                                        e.target.onerror = null;
                                                        e.target.src = 'https://placehold.co/400x300?text=No+Image';
                                                    }}
                                                />
                                            </div>
                                            <div className="position-absolute top-0 end-0 p-2 d-flex gap-2" style={{ zIndex: 100, pointerEvents: 'auto' }}>
                                                <button
                                                    className="btn btn-light btn-sm rounded-circle shadow-sm d-flex align-items-center justify-content-center"
                                                    style={{ width: '32px', height: '32px', cursor: 'pointer' }}
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        e.stopPropagation();
                                                        navigate(`/places/edit/${place.id}`);
                                                    }}
                                                    title="Edit Place"
                                                    type="button"
                                                >
                                                    <Pencil size={14} className="text-primary" />
                                                </button>
                                                <button
                                                    className="btn btn-light btn-sm rounded-circle shadow-sm d-flex align-items-center justify-content-center"
                                                    style={{ width: '32px', height: '32px', cursor: 'pointer' }}
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        e.stopPropagation();
                                                        handleDeletePlace(place.id);
                                                    }}
                                                    title="Delete Place"
                                                    type="button"
                                                >
                                                    <Trash size={14} className="text-danger" />
                                                </button>
                                            </div>
                                            <div className="position-absolute top-0 start-0 p-2">
                                                <span className="badge bg-white text-dark shadow-sm">
                                                    {getCategoryName(place.categoryId)}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="mini-content flex-grow-1 d-flex flex-column">
                                            <div className="mb-2">
                                                <h5 className="mb-1 text-truncate">
                                                    <Link to={`/places/${place.id}`} className="text-decoration-none text-dark">
                                                        {place.name}
                                                    </Link>
                                                </h5>
                                                <p className="text-muted small mb-0 text-truncate">
                                                    <GeoAlt size={12} className="me-1" />
                                                    {place.address}
                                                </p>
                                            </div>

                                            <div className="mt-auto pt-2 border-top d-flex justify-content-between align-items-center">
                                                <div className="d-flex align-items-center gap-1">
                                                    <Clock size={12} className="text-muted" />
                                                    <small className="text-muted" style={{ fontSize: '0.75rem' }}>
                                                        {place.openingTime ? `${place.openingTime} - ${place.closingTime}` : 'Open'}
                                                    </small>
                                                </div>
                                                <div className="rating-pill d-flex align-items-center py-0 px-2" style={{ height: '22px' }}>
                                                    <StarFill size={10} className="text-primary me-1" />
                                                    <small className="fw-bold">{place.rating || 'New'}</small>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="empty-places-state">
                                <div className="empty-icon-wrapper">
                                    <Map size={36} />
                                </div>
                                <h3 className="empty-state-title">No places added yet</h3>
                                <p className="empty-state-text">
                                    You haven't added any places yet. Share your favorite spots!
                                </p>
                                <Link to="/add-place" className="btn-add-place-primary">
                                    <PlusCircle size={18} /> Add Your First Place
                                </Link>
                            </div>
                        )}
                    </div>
                );
            case 'settings':
                return (
                    <SettingsComponent user={user} />
                );
            case 'overview':
            default:
                return (
                    <div>
                        <div className="content-header">
                            <div>
                                <h2>Welcome back, {user?.name || 'User'}!</h2>
                                <p className="text-muted mb-0">Here's an overview of your activity</p>
                            </div>
                            <Link to="/places" className="btn-add-place-primary d-flex align-items-center gap-2">
                                <GeoAltFill size={18} /> Explore Places
                            </Link>
                        </div>

                        <ProfileCompletion user={user} />

                        <UserInfoCard user={user} />

                        <div className="row g-4 mb-5">
                            <div className="col-md-4">
                                <div className="card border-0 shadow-sm text-center p-4">
                                    <div className="mb-3">
                                        <Heart size={32} className="text-danger" />
                                    </div>
                                    <h3 className="h1 fw-bold text-primary mb-0">{savedPlaces.length}</h3>
                                    <p className="text-muted mb-0">Saved Places</p>
                                    <small className="text-muted mt-2 d-block">
                                        {savedPlaces.length === 0
                                            ? "Start saving your favorite places!"
                                            : `${savedPlaces.length} places saved`}
                                    </small>
                                </div>
                            </div>
                            <div className="col-md-4">
                                <div className="card border-0 shadow-sm text-center p-4">
                                    <div className="mb-3">
                                        <Star size={32} className="text-warning" />
                                    </div>
                                    <h3 className="h1 fw-bold text-success mb-0">{myReviews.length}</h3>
                                    <p className="text-muted mb-0">Reviews</p>
                                    <small className="text-muted mt-2 d-block">
                                        {myReviews.length === 0
                                            ? "Share your first review!"
                                            : `${myReviews.length} reviews posted`}
                                    </small>
                                </div>
                            </div>
                            <div className="col-md-4">
                                <div className="card border-0 shadow-sm text-center p-4">
                                    <div className="mb-3">
                                        <GeoAltFill size={32} className="text-info" />
                                    </div>
                                    <h3 className="h1 fw-bold text-info mb-0">{myPlaces.length}</h3>
                                    <p className="text-muted mb-0">Places Added</p>
                                    <small className="text-muted mt-2 d-block">
                                        {myPlaces.length === 0
                                            ? "Add your first place!"
                                            : `${myPlaces.length} places contributed`}
                                    </small>
                                </div>
                            </div>
                        </div>

                        <div className="card border-0 shadow-sm">
                            <div className="card-body">
                                <h5 className="card-title d-flex align-items-center gap-2 mb-3">
                                    <Person size={18} />
                                    Quick Actions
                                </h5>
                                <div className="row g-3">
                                    <div className="col-md-6">
                                        <button
                                            className="btn btn-outline-primary w-100 d-flex align-items-center justify-content-center gap-2 p-3"
                                            onClick={() => navigate('/add-place')}
                                        >
                                            <PlusCircle size={20} />
                                            Add a New Place
                                        </button>
                                    </div>
                                    <div className="col-md-6">
                                        <button
                                            className="btn btn-outline-success w-100 d-flex align-items-center justify-content-center gap-2 p-3"
                                            onClick={() => navigate('/places')}
                                        >
                                            <Star size={20} />
                                            Write a Review
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                );
        }
    };

    if (!initialCheckDone || loading) {
        return (
            <div className="profile-page">
                <div className="profile-container d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
                    <div className="text-center">
                        <div className="spinner-border text-primary" role="status" style={{ width: '3rem', height: '3rem' }}>
                            <span className="visually-hidden">Loading...</span>
                        </div>
                        <p className="mt-3 text-muted">Loading your profile...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (!user) return null;

    return (
        <div className="profile-page">
            <div className="profile-container">
                <main className="profile-layout">
                    {/* SIDEBAR */}
                    <aside className="profile-sidebar">
                        <div className="user-snippet">
                            {user.avatar ? (
                                <img src={user.avatar} alt="User" className="user-avatar-large" />
                            ) : (
                                <div className="user-avatar-large d-flex align-items-center justify-content-center bg-light text-muted">
                                    {user.firstName?.[0]?.toUpperCase() || user.name?.[0]?.toUpperCase() || 'U'}
                                </div>
                            )}
                            <h2>{user.name || 'User'}</h2>
                            <p className="user-email">{user.email}</p>
                            {user.city && (
                                <p className="d-flex align-items-center justify-content-center gap-1 text-muted mb-0 mt-1">
                                    <GeoAltFill size={14} />
                                    {user.city}
                                </p>
                            )}

                            <ProfileCompletion user={user} />
                        </div>

                        <nav className="profile-nav-links">
                            <button
                                className={`nav-item ${activeTab === 'overview' ? 'active' : ''}`}
                                onClick={() => setSearchParams({ tab: 'overview' })}
                            >
                                <Person size={18} />
                                Overview
                            </button>
                            <button
                                className={`nav-item ${activeTab === 'profile' ? 'active' : ''}`}
                                onClick={() => setSearchParams({ tab: 'profile' })}
                            >
                                <Pencil size={18} />
                                Edit Profile
                            </button>
                            <button
                                className={`nav-item ${activeTab === 'saved' ? 'active' : ''}`}
                                onClick={() => setSearchParams({ tab: 'saved' })}
                            >
                                <Heart size={18} />
                                Saved Places
                                {savedPlaces.length > 0 && (
                                    <span className="badge bg-primary ms-auto">{savedPlaces.length}</span>
                                )}
                            </button>
                            <button
                                className={`nav-item ${activeTab === 'places' ? 'active' : ''}`}
                                onClick={() => setSearchParams({ tab: 'places' })}
                            >
                                <GeoAltFill size={18} />
                                My Places
                                {myPlaces.length > 0 && (
                                    <span className="badge bg-primary ms-auto">{myPlaces.length}</span>
                                )}
                            </button>
                            <button
                                className={`nav-item ${activeTab === 'reviews' ? 'active' : ''}`}
                                onClick={() => setSearchParams({ tab: 'reviews' })}
                            >
                                <Star size={18} />
                                My Reviews
                                {myReviews.length > 0 && (
                                    <span className="badge bg-primary ms-auto">{myReviews.length}</span>
                                )}
                            </button>

                            <button
                                className={`nav-item ${activeTab === 'settings' ? 'active' : ''}`}
                                onClick={() => setSearchParams({ tab: 'settings' })}
                            >
                                <Gear size={18} />
                                Settings
                            </button>

                            <button className="nav-item logout" onClick={handleLogout}>
                                <BoxArrowRight size={18} /> Log Out
                            </button>
                        </nav>
                    </aside>

                    {/* CONTENT AREA */}
                    <section className="profile-content">
                        {renderContent()}
                    </section>
                </main>
            </div>
        </div>
    );
};

export default Profile;