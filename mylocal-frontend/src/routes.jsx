import { Routes, Route, Navigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';

// Layout
import MainLayout from '../components/common/Layout/MainLayout';
import AdminLayout from '../components/common/Layout/AdminLayout';

// Public Pages
import HomePage from '../pages/Home/HomePage';
import PlacesPage from '../pages/Places/PlacesPage';
import PlaceDetailsPage from '../pages/Places/PlaceDetails/PlaceDetailsPage';
import CategoriesPage from '../pages/Categories/CategoriesPage';
import AboutPage from '../pages/About/AboutPage';
import ContactPage from '../pages/Contact/ContactPage';
import LoginPage from '../pages/Auth/LoginPage';
import RegisterPage from '../pages/Auth/RegisterPage';

// Protected Pages
import ProfilePage from '../pages/User/ProfilePage';
import ReviewsPage from '../pages/User/Reviews/ReviewsPage';

// Admin Pages
import AdminDashboard from '../pages/Admin/Dashboard';
import AdminUsers from '../pages/Admin/pages/UsersPage';
import AdminPlaces from '../pages/Admin/pages/PlacesPage';
import AdminAnalytics from '../pages/Admin/pages/AnalyticsPage';

// Protected Route Component
const ProtectedRoute = ({ children, requireAdmin = false }) => {
    const { user, isAuthenticated, isLoading } = useContext(AuthContext);

    if (isLoading) {
        return <div className="text-center py-5">Loading...</div>;
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" />;
    }

    if (requireAdmin && (!user || !user.roles?.includes('ROLE_ADMIN'))) {
        return <Navigate to="/" />;
    }

    return children;
};

const AppRoutes = () => {
    return (
        <Routes>
            {/* Public Routes */}
            <Route path="/" element={<MainLayout />}>
                <Route index element={<HomePage />} />
                <Route path="places" element={<PlacesPage />} />
                <Route path="places/:id" element={<PlaceDetailsPage />} />
                <Route path="categories" element={<CategoriesPage />} />
                <Route path="about" element={<AboutPage />} />
                <Route path="contact" element={<ContactPage />} />
                <Route path="login" element={<LoginPage />} />
                <Route path="register" element={<RegisterPage />} />
                <Route path="forgot-password" element={<ForgotPassword />} />

                {/* Protected User Routes */}
                <Route path="profile" element={
                    <ProtectedRoute>
                        <ProfilePage />
                    </ProtectedRoute>
                } />
                <Route path="my-reviews" element={
                    <ProtectedRoute>
                        <ReviewsPage />
                    </ProtectedRoute>
                } />
            </Route>

            {/* Admin Routes */}
            <Route path="/admin" element={
                <ProtectedRoute requireAdmin>
                    <AdminLayout />
                </ProtectedRoute>
            }>
                <Route index element={<AdminDashboard />} />
                <Route path="users" element={<AdminUsers />} />
                <Route path="places" element={<AdminPlaces />} />
                <Route path="analytics" element={<AdminAnalytics />} />
            </Route>

            {/* 404 */}
            <Route path="*" element={<Navigate to="/" />} />
        </Routes>
    );
};

export default AppRoutes;