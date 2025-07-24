'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/apiClient';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter, CardAction } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function ResetPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');
    try {
      const response = await apiClient<{ success: boolean, message: string }>('/auth/resetPassword', {
        method: 'POST',
        body: {
          email
        }
      });
      if (response.success) {
        setSuccess('Si el correo existe, recibirás instrucciones para restablecer tu contraseña.');
      }
    } catch (err: unknown) {  
      setError('Hubo un error al intentar restablecer la contraseña.'+(err instanceof Error ? err.message : 'Error desconocido'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>Restablecer contraseña</CardTitle>
        <CardDescription>
          Ingresa tu correo electrónico para recibir instrucciones de recuperación
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
          <Button variant="link" onClick={() => router.push('/auth/login')}>Volver a iniciar sesión</Button>
        </CardAction>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit}>
          <div className="flex flex-col gap-6">
            <div className="grid gap-2">
              <Label htmlFor="email">Correo electrónico</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="correo@ejemplo.com"
                required
                value={email}
                onChange={handleChange}
              />
            </div>
          </div>
        </form>
      </CardContent>
      <CardFooter className="flex-col gap-2">
        <Button type="submit" className="w-full" onClick={handleSubmit} disabled={isLoading}>
          Enviar instrucciones
        </Button>
      </CardFooter>
    </Card>
  );
}
