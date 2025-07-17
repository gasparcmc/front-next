'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import axios from '@/lib/axios';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { apiClient } from '@/lib/apiClient';

export default function NewPasswordPage() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!password || !confirmPassword) {
      setError('Por favor, completa ambos campos.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }
    if (!token) {
      setError('Token inválido o faltante.');
      return;
    }
    setIsLoading(true);
    try {
      const response = await apiClient<{ success: boolean, message: string }>('/auth/resetPassword', {
        method: 'POST',
        body: {
          token,
          password
        }
      });

      if (response.success) {
      setSuccess('Contraseña actualizada correctamente');
      setTimeout(() => {
        router.push('/auth/login');
      }, 2000);

      return {
        success: true,
        message: 'Contraseña reiniciada exitosamente'
      };

    }
  } catch (err) {
      setError('Hubo un error al actualizar la contraseña.');
    } finally {
      setIsLoading(false);
    }
  
  }

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>Establecer nueva contraseña</CardTitle>
        <CardDescription>
          Ingresa tu nueva contraseña dos veces para confirmarla
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
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit}>
          <div className="flex flex-col gap-6">
            <div className="grid gap-2">
              <Label htmlFor="password">Nueva contraseña</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="Nueva contraseña"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="confirmPassword">Confirmar contraseña</Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                placeholder="Repite la nueva contraseña"
                required
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
              />
            </div>
          </div>
        </form>
      </CardContent>
      <CardFooter className="flex-col gap-2">
        <Button type="submit" className="w-full" onClick={handleSubmit} disabled={isLoading}>
          Guardar nueva contraseña
        </Button>
      </CardFooter>
    </Card>
  );
}
