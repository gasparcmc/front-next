"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiClient } from "@/lib/apiClient";
import ProtectedRoute from "@/app/auth/ProtectedRoute";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Save, Shield, ChevronRight, ChevronDown } from "lucide-react";
import { Access } from "../role.interface";

interface HierarchicalAccess extends Access {
  children?: HierarchicalAccess[];
}

export default function CreateRolePage() {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [roleName, setRoleName] = useState("");
  const [selectedAccesses, setSelectedAccesses] = useState<number[]>([]);
  const [allAccesses, setAllAccesses] = useState<Access[]>([]);
  const [expandedParents, setExpandedParents] = useState<number[]>([]);

  useEffect(() => {
    fetchAllAccesses();
  }, []);

  const fetchAllAccesses = async () => {
    try {
      setLoading(true);
      const data = await apiClient<Access[]>('/role/access');
      setAllAccesses(data);
    } catch (err: any) {
      setError('Error al cargar los permisos disponibles');
      console.error('Error al obtener accesos:', err);
    } finally {
      setLoading(false);
    }
  };

  // Función para organizar accesos jerárquicamente
  const organizeAccessesHierarchically = (accesses: Access[]): HierarchicalAccess[] => {
    const accessMap = new Map<number, HierarchicalAccess>();
    const roots: HierarchicalAccess[] = [];

    // Crear mapa de accesos
    accesses.forEach(access => {
      accessMap.set(access.id, { ...access, children: [] });
    });

    // Organizar jerarquía
    accesses.forEach(access => {
      const hierarchicalAccess = accessMap.get(access.id)!;
      
      if (access.dad === null) {
        roots.push(hierarchicalAccess);
      } else {
        const parent = accessMap.get(access.dad);
        if (parent) {
          if (!parent.children) parent.children = [];
          parent.children.push(hierarchicalAccess);
        }
      }
    });

    // Ordenar por el campo 'order'
    const sortByOrder = (items: HierarchicalAccess[]) => {
      items.sort((a, b) => a.order - b.order);
      items.forEach(item => {
        if (item.children) {
          sortByOrder(item.children);
        }
      });
    };

    sortByOrder(roots);
    return roots;
  };

  const toggleParentExpansion = (parentId: number) => {
    setExpandedParents(prev => 
      prev.includes(parentId) 
        ? prev.filter(id => id !== parentId)
        : [...prev, parentId]
    );
  };

  const isParentExpanded = (parentId: number) => {
    return expandedParents.includes(parentId);
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

      // Crear array de objetos con id para los accesos seleccionados
      const selectedAccessObjects = selectedAccesses.map(accessId => ({
        id: accessId
      }));

      const response = await apiClient<{ success: boolean, message: string }>('/role', {
        method: 'POST',
        body: {
          name: roleName.trim(),
          accesses: selectedAccessObjects
        }
      });

      if (response.success) {

      setSuccess("Rol creado correctamente");
      setRoleName("");
      setSelectedAccesses([]);
      setTimeout(() => {
        setSuccess(null);
        router.push('/core/administration/role');
      }, 2000);

      } else {
        setError(response.message || 'Error al crear el rol');
      }
    } catch (err: any) {
      setError(err.message || 'Error al crear el rol');
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

  // Renderizar accesos jerárquicamente
  const renderAccessItem = (access: HierarchicalAccess, level: number = 0) => {
    const isParent = access.children && access.children.length > 0;
    const isExpanded = isParentExpanded(access.id);
    const hasChildren = isParent && access.children!.length > 0;

    return (
      <div key={access.id} className="space-y-1">
        <div 
          className={`flex items-center space-x-2 p-2 rounded-md hover:bg-gray-50 transition-colors ${
            level > 0 ? 'ml-6' : ''
          }`}
        >
          {hasChildren && (
            <button
              onClick={() => toggleParentExpansion(access.id)}
              className="p-1 hover:bg-gray-200 rounded"
            >
              {isExpanded ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </button>
          )}
          
          {!hasChildren && <div className="w-6" />}
          
          <input
            type="checkbox"
            id={`access-${access.id}`}
            checked={isAccessSelected(access.id)}
            onChange={() => toggleAccess(access.id)}
            className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
          />
          
          <Label 
            htmlFor={`access-${access.id}`}
            className={`text-sm font-normal cursor-pointer ${
              isParent ? 'font-medium' : ''
            }`}
          >
            {access.name}
          </Label>
        </div>

        {hasChildren && isExpanded && (
          <div className="ml-4 border-l border-gray-200 pl-2">
            {access.children!.map(child => renderAccessItem(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  const hierarchicalAccesses = organizeAccessesHierarchically(allAccesses);

  return (
    <ProtectedRoute>
      <div className="p-6 space-y-6">
        {loading ? (
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Button onClick={handleBack} variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <Shield className="h-8 w-8 text-blue-600" />
                <div>
                  <h1 className="text-3xl font-bold tracking-tight">Crear Nuevo Rol</h1>
                  <p className="text-muted-foreground">
                    Crea un nuevo rol y asigna sus permisos de acceso
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
                {saving ? "Creando..." : "Crear Rol"}
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
                  Define los datos básicos del nuevo rol
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
                  <Label>Permisos Disponibles</Label>
                  <div className="space-y-1 max-h-96 overflow-y-auto border rounded-md p-4">
                    {hierarchicalAccesses.length > 0 ? (
                      hierarchicalAccesses.map((access) => renderAccessItem(access))
                    ) : (
                      <p className="text-sm text-muted-foreground italic">
                        No hay permisos disponibles
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </ProtectedRoute>
  );
}