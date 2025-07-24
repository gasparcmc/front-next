"use client"
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ProtectedRoute from "@/app/auth/ProtectedRoute";
import { apiClient } from "@/lib/apiClient";
import { Proveedor } from "./proveedor.interface";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, Building2, Phone, Mail, Globe, MapPin } from "lucide-react";

export default function Proveedores() {
  const router = useRouter();
  const [proveedores, setProveedores] = useState<Proveedor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getProveedores = async () => {
    try {
      setLoading(true);
      const response = await apiClient<Proveedor[]>('proveedor');
      console.log(response);
      setProveedores(response);
      setError(null);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al cargar los proveedores');
      console.error('Error al obtener proveedores:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProveedor = () => {
    router.push('/core/administration/proveedor/insert');
  };

  const handleEditProveedor = (proveedor: Proveedor) => {
    router.push(`/core/administration/proveedor/update?id=${proveedor.id}`);
  };

  const handleDeleteProveedor = async (proveedorId: number) => {
    if (confirm('¿Estás seguro de que quieres eliminar este proveedor?')) {
      try {
        await apiClient(`/proveedor/${proveedorId}`, { method: 'DELETE' });
        getProveedores(); // Recargar la lista
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Error al eliminar el proveedor');
      }
    }
  };

  const getEstadoColor = (estado: string) => {
    console.log(estado);
    switch (estado) {
      case 'activo':
        return 'bg-green-100 text-green-800';
      case 'inactivo':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  useEffect(() => {
    getProveedores();
  }, []);

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
            <Building2 className="h-8 w-8 text-blue-600" />
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Proveedores</h1>
              <p className="text-muted-foreground">
                Gestiona la información de tus proveedores y contactos comerciales
              </p>
            </div>
          </div>
          <Button onClick={handleCreateProveedor} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Nuevo Proveedor
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

        {/* Proveedores Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {proveedores.map((proveedor) => (
            <Card key={proveedor.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg line-clamp-1">{proveedor.razonSocial}</CardTitle>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditProveedor(proveedor)}
                      className="h-8 w-8 p-0"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteProveedor(proveedor.id)}
                      className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <CardDescription className="flex items-center gap-2">
                  <span>ID: {proveedor.id}</span>
                  <span>•</span>
                  <Badge className={`text-xs ${getEstadoColor(proveedor.estado)}`}>
                    {proveedor.estado}
                  </Badge>
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Rubro */}
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-gray-500" />
                  <span className="text-sm font-medium text-gray-700">Rubro:</span>
                  <span className="text-sm text-gray-600">{proveedor.rubro}</span>
                </div>

                {/* Dirección */}
                {proveedor.direccion && (
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 text-gray-500 mt-0.5" />
                    <div className="flex-1">
                      <span className="text-sm font-medium text-gray-700">Dirección:</span>
                      <p className="text-sm text-gray-600 line-clamp-2">{proveedor.direccion}</p>
                    </div>
                  </div>
                )}

                {/* Contacto */}
                <div className="space-y-2">
                  {proveedor.telefono && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-gray-500" />
                      <span className="text-sm text-gray-600">{proveedor.telefono}</span>
                    </div>
                  )}
                  
                  {proveedor.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-gray-500" />
                      <span className="text-sm text-gray-600 line-clamp-1">{proveedor.email}</span>
                    </div>
                  )}
                  
                  {proveedor.web && (
                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4 text-gray-500" />
                      <span className="text-sm text-gray-600 line-clamp-1">{proveedor.web}</span>
                    </div>
                  )}
                </div>

                {/* Observaciones */}
                {proveedor.observaciones && (
                  <div className="pt-2 border-t">
                    <p className="text-sm text-gray-600 line-clamp-2 italic">
                      {proveedor.observaciones}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {proveedores.length === 0 && !loading && !error && (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Building2 className="h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No hay proveedores registrados
              </h3>
              <p className="text-gray-500 text-center mb-4">
                Comienza agregando tu primer proveedor para gestionar tus contactos comerciales.
              </p>
              <Button onClick={handleCreateProveedor} className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Agregar Primer Proveedor
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </ProtectedRoute>
  );
}