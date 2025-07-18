'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter, CardAction } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { apiClient } from '@/lib/apiClient';
import { useSearchParams } from 'next/navigation';

export default function RegisterPage() {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: ''
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const router = useRouter();
    const token = useSearchParams().get('token');


    const handleRegister = async () => {
        try {
        const response = await apiClient<{ success: boolean, message: string }>('/auth/register?token=' + token, {
            method: 'GET'
        });
        if (response.success) {
            setSuccess('Registro confirmado correctamente, ya puedes iniciar sesión.');
            setTimeout(() => router.push('/auth/login'), 2000);
        } else {
            setError(response.message || 'Error al confirmar el usuario.');
        }
    } catch (err: any) {
        setError(err.message || 'Error al confirmar el usuario.');
    }
    }

    useEffect(() => {
        if (token) {
            handleRegister();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [token]);




    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        setSuccess('');
        try {
            const response = await apiClient<{ success: boolean, message: string }>('/auth/register', {
                method: 'POST',
                body: formData
            });
            if (response.success) {
                setSuccess('¡Registro exitoso! Revisa tu correo para activar tu cuenta.');
                setTimeout(() => router.push('/auth/login'), 2000);
            } else {
                setError(response.message || 'Error al registrar usuario.');
            }
        } catch (err: any) {
            setError(err.message || 'Error al registrar usuario.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Card className="w-full max-w-sm">
            <CardHeader>
                <CardTitle>Crear cuenta</CardTitle>
                <CardDescription>
                    Ingresa tus datos para crear una cuenta nueva
                </CardDescription>
                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                        {error}
                    </div>
                )}
                {success && (
                    <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
                        {success}
                    </div>
                )}
                <CardAction>
                    <Button variant="link" onClick={() => router.push('/auth/login')}>¿Ya tienes cuenta? Inicia sesión</Button>
                </CardAction>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit}>
                    <div className="flex flex-col gap-6">
                        <div className="grid gap-2">
                            <Label htmlFor="username">Usuario</Label>
                            <Input
                                id="username"
                                name="username"
                                type="text"
                                placeholder="Usuario"
                                required
                                value={formData.username}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="email">Correo electrónico</Label>
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                placeholder="correo@ejemplo.com"
                                required
                                value={formData.email}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="password">Contraseña</Label>
                            <Input
                                id="password"
                                name="password"
                                type="password"
                                placeholder="Contraseña"
                                required
                                value={formData.password}
                                onChange={handleChange}
                            />
                        </div>
                    </div>
                </form>
            </CardContent>
            <CardFooter className="flex-col gap-2">
                <Button type="submit" className="w-full" onClick={handleSubmit} disabled={isLoading}>
                    Registrarse
                </Button>
            </CardFooter>
        </Card>
    );
}
