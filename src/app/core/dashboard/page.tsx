"use client";
import { useEffect, useState } from 'react';
import ProtectedRoute from '@/app/auth/ProtectedRoute';

export default function Dashboard() {



    return (
        <ProtectedRoute>
            <div>
                <h1>Dashboard</h1>
            </div>
        </ProtectedRoute>
    )
}