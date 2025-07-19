'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter, CardAction } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { apiClient } from '@/lib/apiClient';




export default function LoginPage() {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

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

    try {
      const response = await apiClient<{ success: boolean, message: string }>('/auth/login', {
        method: 'POST',
        body: formData
      });

      // Si el backend envía el token en una cookie HTTP, no necesitas extraerlo del body
      // La cookie se establecerá automáticamente por el navegador
      
      // Verificar si la respuesta fue exitosa
      if (response.success) {
        // El token ya está en las cookies del navegador
        console.log('Login exitoso, token guardado en cookies');
        console.log('Cookies actuales:', document.cookie);
        
        // Redirigir al dashboard
        router.push('/core/dashboard');
      }
    } catch (err: any) {
      console.error('Error en login:', err.message);
      setError('Credenciales incorrectas');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>Inicia sesión en tu cuenta</CardTitle>
        <CardDescription>
          Ingresa tu usuario para iniciar sesión en tu cuenta
        </CardDescription>

         {/* Mensaje de error */}
         {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          
        <CardAction>
          <Button variant="link" onClick={() => router.push('/auth/register')}>Registrate</Button>
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
                placeholder="usuario"
                required
                value={formData.username}
                onChange={handleChange}
              />
            </div>
            <div className="grid gap-2">
              <div className="flex items-center">
                <Label htmlFor="password">Contraseña</Label>
                <a
                  href="/auth/resetpassword"
                  className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                >
                  Olvidaste tu contraseña?
                </a>
              </div>
              <Input 
                id="password" 
                name="password"
                type="password" 
                required
                value={formData.password}
                onChange={handleChange}
              />
            </div>
          </div>
        </form>
      </CardContent>
      <CardFooter className="flex-col gap-2">
        <Button type="submit" className="w-full"
        onClick={handleSubmit}
        disabled={isLoading}
        >
          Iniciar sesión
        </Button>
        <Button variant="outline" className="w-full"
        disabled={isLoading}
        >
          Iniciar sesión con Google
        </Button>
      </CardFooter>
    </Card>
  )
}