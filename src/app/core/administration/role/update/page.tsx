"use client";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { apiClient } from "@/lib/apiClient";
import ProtectedRoute from "@/app/auth/ProtectedRoute";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Save, Shield } from "lucide-react";
import { Role, Access } from "../role.interface";

export default function ModifyRolePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const roleId = searchParams.get('id');

  const [role, setRole] = useState<Role | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [roleName, setRoleName] = useState("");
  const [selectedAccesses, setSelectedAccesses] = useState<number[]>([]);
  const [allAccesses, setAllAccesses] = useState<Access[]>([]);

  useEffect(() => {
    if (roleId) {
      fetchRole();
      fetchAllAccesses();
    } else {
      setError("ID de rol no proporcionado");
      setLoading(false);
    }
  }, [roleId]);

  const fetchRole = async () => {
    try {
      setLoading(true);
      const data = await apiClient<Role>(`/role/${roleId}`);
      setRole(data);
      setRoleName(data.name);
      setSelectedAccesses(data.accesses.map(access => access.id));
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Error al cargar el rol');
      console.error('Error al obtener rol:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllAccesses = async () => {
    try {
      const data = await apiClient<Access[]>('/role/access');
      setAllAccesses(data);
    } catch (err: any) {
      console.error('Error al obtener accesos:', err);
    }
  };

  const handleSave = async () => {
    if (!roleName.trim()) {
      setError("El nombre del rol es requerido");
      return;
    }

    try {
      setSaving(true);
      setError(null);
      setSuccess(null);

      // Actualizar el rol
      await apiClient(`/role/${roleId}`, {
        method: 'PUT',
        body: {
          name: roleName.trim(),
          accessIds: selectedAccesses
        }
      });

      setSuccess("Rol actualizado correctamente");
      
      // Recargar los datos del rol
      await fetchRole();
      
      // Limpiar mensaje de éxito después de 3 segundos
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.message || 'Error al actualizar el rol');
    } finally {
      setSaving(false);
    }
  };

  const toggleAccess = (accessId: number) => {
    setSelectedAccesses(prev => 
      prev.includes(accessId) 
        ? prev.filter(id => id !== accessId)
        : [...prev, accessId]
    );
  };

  const isAccessSelected = (accessId: number) => {
    return selectedAccesses.includes(accessId);
  };

  const handleBack = () => {
    router.push('/core/administration/role');
  };

  if (loading) {
    return (
        <div className="p-6">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        </div>
    );
  }

  if (!role) {
    return (
        <div className="p-6">
          <Card className="border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <p className="text-red-700">{error || "Rol no encontrado"}</p>
              <Button onClick={handleBack} variant="outline" className="mt-4">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver a Roles
              </Button>
            </CardContent>
          </Card>
        </div>
    );
  }

  return (
    <ProtectedRoute>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button onClick={handleBack} variant="ghost" size="sm" className="h-8 w-8 p-0">
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <Shield className="h-8 w-8 text-blue-600" />
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Modificar Rol</h1>
              <p className="text-muted-foreground">
                Edita la información del rol y sus permisos de acceso
              </p>
            </div>
          </div>
          <Button 
            onClick={handleSave} 
            disabled={saving}
            className="flex items-center gap-2"
          >
            {saving ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : (
              <Save className="h-4 w-4" />
            )}
            {saving ? "Guardando..." : "Guardar Cambios"}
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

        {/* Success Message */}
        {success && (
          <Card className="border-green-200 bg-green-50">
            <CardContent className="pt-6">
              <p className="text-green-700">{success}</p>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Información del Rol</CardTitle>
            <CardDescription>
              Edita los datos básicos del rol
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="roleName">Nombre del Rol</Label>
              <Input
                id="roleName"
                value={roleName}
                onChange={(e) => setRoleName(e.target.value)}
                placeholder="Ingresa el nombre del rol"
              />
            </div>
            
            <Separator />
            
            <div className="space-y-2">
              <Label>ID del Rol</Label>
              <div className="text-sm text-muted-foreground bg-muted px-3 py-2 rounded-md">
                {role.id}
              </div>
            </div>

            <Separator />
            
            <div className="space-y-2">
              <Label>Permisos Seleccionados</Label>
              <div className="flex flex-wrap gap-2">
                {selectedAccesses.length > 0 ? (
                  selectedAccesses.map(accessId => {
                    const access = allAccesses.find(a => a.id === accessId);
                    return access ? (
                      <Badge key={accessId} variant="secondary">
                        {access.name}
                      </Badge>
                    ) : null;
                  })
                ) : (
                  <p className="text-sm text-muted-foreground italic">
                    No hay permisos seleccionados
                  </p>
                )}
              </div>
            </div>

            <Separator />
            
            <div className="space-y-2">
              <Label>Permisos Disponibles</Label>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {allAccesses.length > 0 ? (
                  allAccesses.map((access) => (
                    <div key={access.id} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={`access-${access.id}`}
                        checked={isAccessSelected(access.id)}
                        onChange={() => toggleAccess(access.id)}
                        className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                      />
                      <Label 
                        htmlFor={`access-${access.id}`}
                        className="text-sm font-normal cursor-pointer"
                      >
                        {access.name}
                      </Label>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground italic">
                    No hay permisos disponibles
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </ProtectedRoute>
  );
}
