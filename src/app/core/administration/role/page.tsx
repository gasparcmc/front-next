"use client";
import { useEffect, useState } from "react";
import { apiClient } from "@/lib/apiClient";
import ProtectedRoute from "@/app/auth/ProtectedRoute";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, Shield } from "lucide-react";

interface Access {
  id: number;
  name: string;
}

interface Role {
  id: number;
  name: string;
  accesses: Access[];
}

export default function RolePage() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    try {
      setLoading(true);
      const data = await apiClient<Role[]>('/role');
      setRoles(data);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Error al cargar los roles');
      console.error('Error al obtener roles:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRole = () => {
    // TODO: Implementar modal o página para crear rol
    console.log('Crear nuevo rol');
  };

  const handleEditRole = (role: Role) => {
    // TODO: Implementar modal o página para editar rol
    console.log('Editar rol:', role);
  };

  const handleDeleteRole = async (roleId: number) => {
    if (confirm('¿Estás seguro de que quieres eliminar este rol?')) {
      try {
        await apiClient(`/role/${roleId}`, { method: 'DELETE' });
        fetchRoles(); // Recargar la lista
      } catch (err: any) {
        setError(err.message || 'Error al eliminar el rol');
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
            <Shield className="h-8 w-8 text-blue-600" />
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Roles y Permisos</h1>
              <p className="text-muted-foreground">
                Gestiona los roles de usuario y sus permisos de acceso
              </p>
            </div>
          </div>
          <Button onClick={handleCreateRole} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Nuevo Rol
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

        {/* Roles Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {roles.map((role) => (
            <Card key={role.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{role.name}</CardTitle>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditRole(role)}
                      className="h-8 w-8 p-0"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteRole(role.id)}
                      className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <CardDescription>
                  ID: {role.id}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-700">Permisos:</span>
                    <span className="text-sm text-gray-500">
                      {role.accesses.length} acceso{role.accesses.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                  
                  {role.accesses.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {role.accesses.map((access) => (
                        <Badge key={access.id} variant="secondary" className="text-xs">
                          {access.name}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 italic">
                      Sin permisos asignados
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {roles.length === 0 && !loading && !error && (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Shield className="h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No hay roles configurados
              </h3>
              <p className="text-gray-500 text-center mb-4">
                Comienza creando tu primer rol para gestionar los permisos de los usuarios.
              </p>
              <Button onClick={handleCreateRole} className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Crear Primer Rol
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </ProtectedRoute>
  );
}


