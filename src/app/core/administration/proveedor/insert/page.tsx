"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiClient } from "@/lib/apiClient";
import ProtectedRoute from "@/app/auth/ProtectedRoute";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Save, Building2 } from "lucide-react";

export default function CreateProveedorPage() {
  const router = useRouter();

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Campos del formulario
  const [razonSocial, setRazonSocial] = useState("");
  const [rubro, setRubro] = useState("");
  const [direccion, setDireccion] = useState("");
  const [telefono, setTelefono] = useState("");
  const [email, setEmail] = useState("");
  const [web, setWeb] = useState("");
  const [observaciones, setObservaciones] = useState("");
  const [estado, setEstado] = useState("Activo");
  const [cuit, setCuit] = useState("");

  const handleSave = async () => {
    // Validaciones
    if (!razonSocial.trim()) {
      setError("La razón social es requerida");
      return;
    }

    if (!rubro.trim()) {
      setError("El rubro es requerido");
      return;
    }

    if (!cuit.trim()) {
      setError("El CUIT es requerido");
      return;
    }

    // Validación básica de email si se proporciona
    if (email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError("El formato del email no es válido");
      return;
    }

    // Validación básica de URL si se proporciona
//    if (web.trim() && !web.startsWith('http://') && !web.startsWith('https://')) {
//      setError("La URL debe comenzar con http:// o https://");
//      return;
//    }

    try {
      setSaving(true);
      setError(null);
      setSuccess(null);

      const response = await apiClient<{ success: boolean, message: string }>('/proveedor', {
        method: 'POST',
        body: {
          razonSocial: razonSocial.trim(),
          rubro: rubro.trim(),
          direccion: direccion.trim(),
          telefono: telefono.trim(),
          email: email.trim(),
          web: web.trim(),
          observaciones: observaciones.trim(),
          estado: estado,
          cuit: cuit.trim()
        }
      });

      if (response.success) {
        setSuccess("Proveedor creado correctamente");
        
        // Limpiar formulario
        setRazonSocial("");
        setRubro("");
        setDireccion("");
        setTelefono("");
        setEmail("");
        setWeb("");
        setObservaciones("");
        setEstado("Activo");
        
        setTimeout(() => {
          setSuccess(null);
          router.push('/core/administration/proveedor');
        }, 2000);
      } else {
        setError(response.message || 'Error al crear el proveedor');
      }

    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al crear el proveedor');
    } finally {
      setSaving(false);
    }
  };

  const handleBack = () => {
    router.push('/core/administration/proveedor');
  };

  return (
    <ProtectedRoute>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button onClick={handleBack} variant="ghost" size="sm" className="h-8 w-8 p-0">
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <Building2 className="h-8 w-8 text-blue-600" />
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Crear Nuevo Proveedor</h1>
              <p className="text-muted-foreground">
                Agrega un nuevo proveedor a tu base de datos
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
            {saving ? "Creando..." : "Crear Proveedor"}
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

        <div className="grid gap-6 md:grid-cols-2">
          {/* Información Principal */}
          <Card>
            <CardHeader>
              <CardTitle>Información Principal</CardTitle>
              <CardDescription>
                Datos básicos del proveedor
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="razonSocial">Razón Social *</Label>
                <Input
                  id="razonSocial"
                  value={razonSocial}
                  onChange={(e) => setRazonSocial(e.target.value)}
                  placeholder="Ingresa la razón social"
                />
              </div>

              <Separator />

              <div className="space-y-2">
                <Label htmlFor="rubro">Rubro *</Label>
                <Input
                  id="rubro"
                  value={rubro}
                  onChange={(e) => setRubro(e.target.value)}
                  placeholder="Ej: Tecnología, Alimentación, etc."
                />
              </div>

              <Separator />

              <div className="space-y-2">
                <Label htmlFor="estado">Estado</Label>
                <select
                  id="estado"
                  value={estado}
                  onChange={(e) => setEstado(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="Activo">Activo</option>
                  <option value="Inactivo">Inactivo</option>
                </select>
              </div>
            </CardContent>
          </Card>

          {/* Información de Contacto */}
          <Card>
            <CardHeader>
              <CardTitle>Información de Contacto</CardTitle>
              <CardDescription>
                Datos de contacto del proveedor
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="telefono">Teléfono</Label>
                <Input
                  id="telefono"
                  value={telefono}
                  onChange={(e) => setTelefono(e.target.value)}
                  placeholder="Ingresa el número de teléfono"
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
                  placeholder="proveedor@ejemplo.com"
                />
              </div>

              <Separator />

              <div className="space-y-2">
                <Label htmlFor="web">Sitio Web</Label>
                <Input
                  id="web"
                  value={web}
                  onChange={(e) => setWeb(e.target.value)}
                  placeholder="https://www.ejemplo.com"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Información Adicional */}
        <Card>
          <CardHeader>
            <CardTitle>Información Adicional</CardTitle>
            <CardDescription>
              Datos complementarios del proveedor
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
          <div className="space-y-2">
              <Label htmlFor="cuit">CUIT</Label>
              <Input
                id="cuit"
                value={cuit}
                onChange={(e) => setCuit(e.target.value)}
                placeholder="Ingresa el CUIT"
              />
            </div>

          <Separator />

            <div className="space-y-2">
              <Label htmlFor="direccion">Dirección</Label>
              <Input
                id="direccion"
                value={direccion}
                onChange={(e) => setDireccion(e.target.value)}
                placeholder="Ingresa la dirección completa"
              />
            </div>

            <Separator />

            <div className="space-y-2">
              <Label htmlFor="observaciones">Observaciones</Label>
              <textarea
                id="observaciones"
                value={observaciones}
                onChange={(e) => setObservaciones(e.target.value)}
                placeholder="Agrega observaciones adicionales sobre el proveedor..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[100px] resize-vertical"
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </ProtectedRoute>
  );
}
