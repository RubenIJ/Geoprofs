import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

export default function ProtectedRoute() {
    const user = localStorage.getItem('geoprofs_user');
    if (!user) {
        return <Navigate to="/inloggen" replace />;
    }
    return <Outlet />;
}