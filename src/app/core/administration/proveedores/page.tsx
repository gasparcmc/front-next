"use client"
import { useEffect, useState } from "react";
import axios from "axios";
import ProtectedRoute from "@/app/auth/ProtectedRoute";


export default function Proveedores() {

    const [proveedores, setProveedores] = useState([]);

    useEffect(() => {
        const token = document.cookie
            .split('; ')
            .find(row => row.startsWith('token='))
            ?.split('=')[1];
        const headers = {
            'Authorization': `Bearer ${token}`
        };
        try {


          } catch (error) {
            console.error('Error al obtener proveedores:', error);
          }
    

    const getProveedores = async () => {
        const response = await axios.get(
            `${process.env.NEXT_PUBLIC_BACKEND_URL}/suppliers`,
            { headers }
        );
        setProveedores(response.data);
    }
    
        }, []);

    return (
        <ProtectedRoute>
            
            <div>
                <h1>Proveedores</h1>
            </div>
        </ProtectedRoute>
    )
}