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
import { ArrowLeft, Save, Users } from "lucide-react";
import { Role } from "../user.interfase";

export default function CreateUserPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [selectedRoles, setSelectedRoles] = useState<number[]>([]);
  const [allRoles, setAllRoles] = useState<Role[]>([]);

  useEffect(() => {
    fetchAllRoles();
  }, []);

  const fetchAllRoles = async () => {
    try {
      setLoading(true);
      const data = await apiClient<Role[]>('/role');
      setAllRoles(data);
    } catch (err: any) {
      setError('Error al cargar los roles disponibles');
      console.error('Error al obtener roles:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!username.trim()) {
      setError("El nombre de usuario es requerido");
      return;
    }

    if (!email.trim()) {
      setError("El email es requerido");
      return;
    }

    if (!password.trim()) {
      setError("La contraseña es requerida");
      return;
    }

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }

    // Validación básica de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setError("El formato del email no es válido");
      return;
    }

    // Validación de contraseña (mínimo 6 caracteres)
    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres");
      return;
    }

    try {
      setSaving(true);
      setError(null);
      setSuccess(null);

      // Crear array de objetos con id para los roles seleccionados
      const selectedRoleObjects = selectedRoles.map(roleId => ({
        id: roleId
      }));

      await apiClient('/user', {
        method: 'POST',
        body: {
          username: username.trim(),
          email: email.trim(),
          password: password,
          roles: selectedRoleObjects
        }
      });

      setSuccess("Usuario creado correctamente");
      setUsername("");
      setEmail("");
      setPassword("");
      setConfirmPassword("");
      setSelectedRoles([]);
      setTimeout(() => {
        setSuccess(null);
        router.push('/core/administration/user');
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Error al crear el usuario');
    } finally {
      setSaving(false);
    }
  };

  const toggleRole = (roleId: number) => {
    setSelectedRoles(prev => 
      prev.includes(roleId) 
        ? prev.filter(id => id !== roleId)
        : [...prev, roleId]
    );
  };

  const isRoleSelected = (roleId: number): boolean => {
    return selectedRoles.includes(roleId);
  };

  const handleBack = () => {
    router.push('/core/administration/user');
  };

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
                <Users className="h-8 w-8 text-blue-600" />
                <div>
                  <h1 className="text-3xl font-bold tracking-tight">Crear Nuevo Usuario</h1>
                  <p className="text-muted-foreground">
                    Crea un nuevo usuario y asigna sus roles
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
                {saving ? "Creando..." : "Crear Usuario"}
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
                <CardTitle>Información del Usuario</CardTitle>
                <CardDescription>
                  Define los datos del nuevo usuario
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="username">Nombre de Usuario</Label>
                  <Input
                    id="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Ingresa el nombre de usuario"
                  />
                </div>
                
                <Separator />
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Ingresa el email del usuario"
                  />
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label htmlFor="password">Contraseña</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Ingresa la contraseña"
                  />
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirmar Contraseña</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirma la contraseña"
                  />
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label>Roles Asignados</Label>
                  <div className="space-y-1 max-h-96 overflow-y-auto border rounded-md p-4">
                    {allRoles.length > 0 ? (
                      allRoles.map((role) => (
                        <div key={role.id} className="flex items-center space-x-2 p-2 rounded-md hover:bg-gray-50 transition-colors">
                          <input
                            type="checkbox"
                            id={`role-${role.id}`}
                            checked={isRoleSelected(role.id)}
                            onChange={() => toggleRole(role.id)}
                            className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                          />
                          <Label 
                            htmlFor={`role-${role.id}`}
                            className="text-sm font-normal cursor-pointer"
                          >
                            {role.name}
                          </Label>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground italic">
                        No hay roles disponibles
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
