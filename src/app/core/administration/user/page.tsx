"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiClient } from "@/lib/apiClient";
import ProtectedRoute from "@/app/auth/ProtectedRoute";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, Users } from "lucide-react";

interface User {
  id: number;
  username: string;
  email: string;
}

export default function UserPage() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await apiClient<User[]>('/user');
      setUsers(data);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Error al cargar los usuarios');
      console.error('Error al obtener usuarios:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = () => {
    router.push('/core/administration/user/insert');
  };

  const handleEditUser = (user: User) => {
    router.push(`/core/administration/user/update?id=${user.id}`);
  };

  const handleDeleteUser = async (userId: number) => {
    if (confirm('¿Estás seguro de que quieres eliminar este usuario?')) {
      try {
        await apiClient(`/user/${userId}`, { method: 'DELETE' });
        fetchUsers(); // Recargar la lista
      } catch (err: any) {
        setError(err.message || 'Error al eliminar el usuario');
      }
    }
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="p-6">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Users className="h-8 w-8 text-blue-600" />
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Usuarios</h1>
              <p className="text-muted-foreground">
                Gestiona los usuarios del sistema
              </p>
            </div>
          </div>
          <Button onClick={handleCreateUser} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Nuevo Usuario
          </Button>
        </div>

        {/* Error Message */}
        {error && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <p className="text-red-700">{error}</p>
            </CardContent>
          </Card>
        )}

        {/* Users Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {users.map((user) => (
            <Card key={user.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{user.username}</CardTitle>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditUser(user)}
                      className="h-8 w-8 p-0"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteUser(user.id)}
                      className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <CardDescription>
                  ID: {user.id}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-700">Email:</span>
                    <span className="text-sm text-gray-500">{user.email}</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-700">Usuario:</span>
                    <Badge variant="secondary" className="text-xs">
                      {user.username}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {users.length === 0 && !loading && !error && (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Users className="h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No hay usuarios registrados
              </h3>
              <p className="text-gray-500 text-center mb-4">
                Comienza creando tu primer usuario para gestionar el sistema.
              </p>
              <Button onClick={handleCreateUser} className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Crear Primer Usuario
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </ProtectedRoute>
  );
}
