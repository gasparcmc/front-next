"use client";
import { useEffect, useState, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { apiClient } from "@/lib/apiClient";
import ProtectedRoute from "@/app/auth/ProtectedRoute";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Save, Building2 } from "lucide-react";
import { Proveedor } from "../proveedor.interface";
import { Sheet, SheetTrigger, SheetContent, SheetHeader, SheetTitle,  SheetClose } from "@/components/ui/sheet";

function ModifyProveedorPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const proveedorId = searchParams.get('id');

  const [proveedor, setProveedor] = useState<Proveedor | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Campos del proveedor
  const [razonSocial, setRazonSocial] = useState("");
  const [rubro, setRubro] = useState("");
  const [direccion, setDireccion] = useState("");
  const [telefono, setTelefono] = useState("");
  const [email, setEmail] = useState("");
  const [web, setWeb] = useState("");
  const [observaciones, setObservaciones] = useState("");
  const [estado, setEstado] = useState("");
  const [cuit, setCuit] = useState("");
  const [portada, setPortada] = useState("");
  const [portadaUrl, setPortadaUrl] = useState("");
  const [showPortadaSheet, setShowPortadaSheet] = useState(false);
  const [portadaFile, setPortadaFile] = useState<File | null>(null);
  const [portadaPreview, setPortadaPreview] = useState<string>("");

  const loadProveedorData = useCallback(async () => {
    if (!proveedorId) {
      setError("ID de proveedor no proporcionado");
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const data = await apiClient<Proveedor>(`/proveedor/${proveedorId}`);
      setProveedor(data);
      setRazonSocial(data.razonSocial);
      setRubro(data.rubro);
      setDireccion(data.direccion);
      setTelefono(data.telefono);
      setEmail(data.email);
      setWeb(data.web);
      setObservaciones(data.observaciones);
      setEstado(data.estado);
      setCuit(data.cuit || "");
      setPortada(data.portada || "");
      // Actualizar portadaUrl con query param para evitar caché
      setPortadaUrl(data.portada ? `${data.portada}?t=${Date.now()}` : "");
      setError(null);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al cargar datos');
      console.error('Error al cargar datos:', err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  }, [proveedorId]);

  useEffect(() => {
    loadProveedorData();
  }, [loadProveedorData]);


  // Nueva función para manejar la selección de archivo
  const handlePortadaFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPortadaFile(file);
      setPortadaPreview(URL.createObjectURL(file));
    }
  };

  // Nueva función para subir la portada
  const handlePortadaUpload = async () => {
    if (!portadaFile) {
      setError("Selecciona una imagen para la portada");
      return;
    }
    const formData = new FormData();
    formData.append("file", portadaFile);
    try {
      setSaving(true);
      setError(null);
      setSuccess(null);
      const response = await apiClient<{ success: boolean, message: string }>(`/proveedor/${proveedorId}/portada`, {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      if (response.success) {
        setSuccess("Portada actualizada correctamente");
        setShowPortadaSheet(false);
        setPortadaFile(null);
        setPortadaPreview("");
        // Actualizar portadaUrl para forzar recarga
        //setPortadaUrl(portada ? `${portada}?t=${Date.now()}` : "");
        await loadProveedorData();
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError(response.message || 'Error al actualizar la portada');
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al actualizar la portada');
    } finally {
      setSaving(false);
    }
  };
  // Funcion para guardar los datos del proveedor
  const handleSave = async () => {
    // Validaciones
    if (!razonSocial.trim() || razonSocial.length < 3) {
      setError("La razón social es requerida y debe tener al menos 3 caracteres");
      return;
    }
    if (!rubro.trim() || rubro.length < 3) {
      setError("El rubro es requerido y debe tener al menos 3 caracteres");
      return;
    }
    if (!direccion.trim() || direccion.length < 3) {
      setError("La dirección es requerida y debe tener al menos 3 caracteres");
      return;
    }
    if (!telefono.trim() || telefono.length < 10) {
      setError("El teléfono es requerido y debe tener al menos 10 caracteres");
      return;
    }
    if (!email.trim()) {
      setError("El email es requerido");
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setError("El formato del email no es válido");
      return;
    }
    if (!web.trim() || web.length < 3) {
      setError("La web es requerida y debe tener al menos 3 caracteres");
      return;
    }
    if (!observaciones.trim() || observaciones.length < 3) {
      setError("Las observaciones son requeridas y deben tener al menos 3 caracteres");
      return;
    }
    if (!estado.trim() || estado.length < 3) {
      setError("El estado es requerido y debe tener al menos 3 caracteres");
      return;
    }
    if (cuit && cuit.length > 20) {
      setError("El CUIT no puede tener más de 20 caracteres");
      return;
    }

    try {
      setSaving(true);
      setError(null);
      setSuccess(null);

      const response = await apiClient<{ success: boolean, message: string }>(`/proveedor/${proveedorId}`, {
        method: 'PUT',
        body: {
          razonSocial: razonSocial.trim(),
          rubro: rubro.trim(),
          direccion: direccion.trim(),
          telefono: telefono.trim(),
          email: email.trim(),
          web: web.trim(),
          observaciones: observaciones.trim(),
          estado: estado.trim(),
          cuit: cuit.trim(),
        }
      });

      if (response.success) {
        setSuccess("Proveedor actualizado correctamente");
        await loadProveedorData();
        setLoading(false);
        setError(null);
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError(response.message || 'Error al actualizar el proveedor');
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al actualizar el proveedor.');
    } finally {
      setSaving(false);
    }
  };

  const handleBack = () => {
    router.push('/core/administration/proveedor');
  };

  return (
    <ProtectedRoute>
      {loading ? (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      ) : proveedor ? (
        <div className="p-6 space-y-6">
        <Card>
      
        {/* Portada y botón de editar (solo en update) */}
        <div className="p-6 flex items-center gap-4 mb-4">
          {portada ? (
            <img 
              src={`${process.env.NEXT_PUBLIC_BACKEND_URL}/uploads/portadas/${portadaUrl}`}
              alt="Portada del proveedor"
              className="w-32 h-32 object-cover rounded border"
              key={portadaUrl}
            />
          ) : (
            <div className="w-32 h-32 flex items-center justify-center bg-gray-100 border rounded text-gray-400">
              Sin portada
            </div>
          )}
          <Sheet open={showPortadaSheet} onOpenChange={setShowPortadaSheet}>
            <SheetTrigger asChild>
              <Button variant="outline" onClick={() => setShowPortadaSheet(true)}>
                Editar imagen
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <SheetHeader>
                <SheetTitle>Cambiar imagen de portada</SheetTitle>
              </SheetHeader>
              <div className="flex flex-col gap-4 p-4">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePortadaFileChange}
                />
                {portadaPreview && !portadaFile && (
                  <img 
                    src={`${process.env.NEXT_PUBLIC_BACKEND_URL}/uploads/portadas/${portadaPreview}`}
                    alt="Vista previa"
                    className="w-48 h-48 object-cover rounded border"
                  />
                )}
                {portadaFile && portadaPreview && (
                  <img 
                    src={portadaPreview}
                    alt="Vista previa"
                    className="w-48 h-48 object-cover rounded border"
                  />
                )}
                <Button onClick={handlePortadaUpload} disabled={saving || !portadaFile}>
                  {saving ? "Guardando..." : "Guardar imagen"}
                </Button>
                <SheetClose asChild>
                  <Button variant="ghost">Cancelar</Button>
                </SheetClose>
              </div>
            </SheetContent>
          </Sheet>
        </div>

        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button onClick={handleBack} variant="ghost" size="sm" className="h-8 w-8 p-0">
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <Building2 className="h-8 w-8 text-blue-600" />
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Modificar Proveedor</h1>
              <p className="text-muted-foreground">
                Edita la información del proveedor
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
            <Separator />
            <div className="space-y-2">
              <Label>ID del Proveedor</Label>
              <div className="p-3 bg-gray-50 rounded-md">
                <span className="text-sm text-gray-600">{proveedorId}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </Card>
      </div>
      ) : (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <p className="text-red-700">No se encontró el proveedor</p>
          </CardContent>
        </Card>
      )}
    </ProtectedRoute>
  );
}

export default function PageWithSuspense() {
  return (
    <Suspense fallback={<div>Cargando...</div>}>
      <ModifyProveedorPage />
    </Suspense>
  );
}
