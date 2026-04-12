// src/App.jsx
import React from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { lazy } from 'react';
import Layout from './components/layout/Layout';
import './App.css';

// Lazy load pages for better performance
const HomePage = lazy(() => import('./pages/Home/HomePage'));
const PlacesPage = lazy(() => import('./pages/Places/PlacesPage'));
const Login = lazy(() => import('./pages/Auth/Login'));
const Register = lazy(() => import('./pages/Auth/Register'));
const Profile = lazy(() => import('./pages/User/Profile'));
const PlaceDetails = lazy(() => import('./pages/Places/PlaceDetails'));
const AddPlace = lazy(() => import('./pages/Places/AddPlace'));
const EditPlace = lazy(() => import('./pages/Places/EditPlace'));
const AboutUs = lazy(() => import('./pages/About/AboutUs'));

// Create router with future flags to suppress warnings
const router = createBrowserRouter(
    [
        {
            path: '/',
            element: <Layout />,
            children: [
                {
                    index: true,
                    element: <HomePage />,
                },
                {
                    path: 'about',
                    element: <AboutUs />,
                },
                {
                    path: 'home',
                    element: <HomePage />,
                },
                {
                    path: 'places',
                    element: <PlacesPage />,
                },
                {
                    path: 'add-place',
                    element: <AddPlace />,
                },
                {
                    path: 'places/edit/:id',
                    element: <EditPlace />,
                },
                {
                    path: 'places/:id',
                    element: <PlaceDetails />,
                },
                {
                    path: 'login',
                    element: <Login />,
                },
                {
                    path: 'register',
                    element: <Register />,
                },
                {
                    path: 'profile',
                    element: <Profile />,
                },
                {
                    path: '*',
                    element: (
                        <div className="text-center p-5">
                            <h1>404 - Page Not Found</h1>
                            <p>The page you're looking for doesn't exist.</p>
                        </div>
                    ),
                },
            ],
        },
    ],
    {
        future: {
            v7_relativeSplatPath: true,
            v7_startTransition: true,
        },
    }
);

function App() {
    return <RouterProvider router={router} />;
}

export default App;
