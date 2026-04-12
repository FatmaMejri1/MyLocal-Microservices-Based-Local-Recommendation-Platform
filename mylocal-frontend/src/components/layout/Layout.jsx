// src/components/layout/Layout.jsx
import { Suspense } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';

const Layout = () => {
    return (
        <div className="app-wrapper">
            <Navbar />
            <main className="main-content">
                <Suspense fallback={<div className="loading-container">Loading...</div>}>
                    <Outlet />
                </Suspense>
            </main>
            <Footer />
        </div>
    );
};

export default Layout;
