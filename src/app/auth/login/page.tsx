'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter, CardAction } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';




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
      // Aquí iría tu lógica de autenticación
      console.log('Datos del formulario:', formData);
      
      // Simular llamada a API
     // await new Promise(resolve => setTimeout(resolve, 1000));

     const response = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/login`, formData);
     const { access_token } = response.data;

     // Guardar el token (localStorage o cookies, según tu estrategia)
     //version localStorage
     //localStorage.setItem('token', token);
     //version cookies
     document.cookie = `token=${access_token}; path=/`;

      
      // Si el login es exitoso, redirigir
      router.push('/core/dashboard');
    } catch (err) {
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
          <Button variant="link">Registrate</Button>
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
                  href="#"
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