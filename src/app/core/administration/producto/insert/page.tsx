"use client";
import { useState, Suspense } from "react";
import { useRouter } from "next/navigation";
import { apiClient } from "@/lib/apiClient";
import ProtectedRoute from "@/app/auth/ProtectedRoute";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Save, ImagePlus } from "lucide-react";

function InsertProductoPage() {
  const router = useRouter();

  // Estados del producto
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [precio, setPrecio] = useState<number>(0);
  const [categoria, setCategoria] = useState("");
  const [subcategoria, setSubcategoria] = useState("");
  const [marca, setMarca] = useState("");
  const [galeriaFiles, setGaleriaFiles] = useState<File[]>([]);
  const [galeriaPreviews, setGaleriaPreviews] = useState<string[]>([]);
  const [portadaIndex, setPortadaIndex] = useState<number>(0); // índice de la imagen portada
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Manejar selección de galería
  const handleGaleriaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setGaleriaFiles(files);
    setGaleriaPreviews(files.map(file => URL.createObjectURL(file)));
    setPortadaIndex(0); // por defecto la primera es portada
  };

  // Guardar producto y subir imágenes
  const handleSave = async () => {
    // Validaciones básicas
    if (!nombre.trim() || nombre.length < 3) {
      setError("El nombre es requerido y debe tener al menos 3 caracteres");
      return;
    }
    if (!descripcion.trim() || descripcion.length < 3) {
      setError("La descripción es requerida y debe tener al menos 3 caracteres");
      return;
    }
    if (precio <= 0) {
      setError("El precio debe ser mayor a 0");
      return;
    }
    if (!categoria.trim()) {
      setError("La categoría es requerida");
      return;
    }
    if (!marca.trim()) {
      setError("La marca es requerida");
      return;
    }
    if (galeriaFiles.length === 0) {
      setError("Debes subir al menos una imagen a la galería");
      return;
    }

    try {
      setSaving(true);
      setError(null);
      setSuccess(null);

      // 1. Insertar producto (sin portada ni galería)
      const productoResponse = await apiClient<{ 
         id: number;
        message: string;
        success: boolean; }>(
        "/producto",
        {
          method: "POST",
          body: {
            nombre: nombre.trim(),
            descripcion: descripcion.trim(),
            precio,
            categoria: categoria.trim(),
            subcategoria: subcategoria.trim(),
            marca: marca.trim(),
            portada: "",
            galeria: [],
          }
        }
      );

      if (!productoResponse.success){
        setError(productoResponse.message || "Error al crear el producto");
        return;
      }

      // 2. Subir galería
      //const galeriaUrls: string[] = [];
      for (const file of galeriaFiles) {
        const formData = new FormData();
        formData.append("file", file);
        if (portadaIndex === idx){
          formData.append("portada", "true");
        }else{
          formData.append("portada", "false");
        }

        const galeriaRes = await apiClient<{ result: { success: boolean, message: string } }>(
          `/producto/${productoResponse.id}/galeria`,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
            method: "POST",
            body: formData,
          }
        );

        if (!galeriaRes.result.success){
          setError(" Se ha guardado el producto pero no se han subido las imágenes. Error: " + galeriaRes.result.message + ". Se redirigirá a la edicion del producto en 2 segundos.");
        }
        
      }



      setSuccess("Producto creado correctamente");
      //setTimeout(() => {
        //setSuccess(null);
        //router.push("/core/administration/producto");
      //}, 2000);
    } catch (err: any) {
      setError(err.message || "Error al crear el producto");
    } finally {
      setSaving(false);
    }
  };

  const handleBack = () => {
    router.push('/core/administration/producto');
  };

  return (
    <ProtectedRoute>
      <div className="p-6 space-y-6">
        <Card>
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button onClick={handleBack} variant="ghost" size="sm" className="h-8 w-8 p-0">
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <ImagePlus className="h-8 w-8 text-blue-600" />
              <div>
                <h1 className="text-3xl font-bold tracking-tight">Nuevo Producto</h1>
                <p className="text-muted-foreground">
                  Completa la información del producto
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
              {saving ? "Guardando..." : "Guardar Producto"}
            </Button>
          </div>

          {/* Mensajes */}
          {error && (
            <Card className="border-red-200 bg-red-50 mt-4">
              <CardContent className="pt-6">
                <p className="text-red-700">{error}</p>
              </CardContent>
            </Card>
          )}
          {success && (
            <Card className="border-green-200 bg-green-50 mt-4">
              <CardContent className="pt-6">
                <p className="text-green-700">{success}</p>
              </CardContent>
            </Card>
          )}

          {/* Formulario principal */}
          <div className="grid gap-6 md:grid-cols-2 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Información Principal</CardTitle>
                <CardDescription>
                  Datos básicos del producto
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="nombre">Nombre *</Label>
                  <Input
                    id="nombre"
                    value={nombre}
                    onChange={e => setNombre(e.target.value)}
                    placeholder="Nombre del producto"
                  />
                </div>
                <Separator />
                <div className="space-y-2">
                  <Label htmlFor="descripcion">Descripción *</Label>
                  <textarea
                    id="descripcion"
                    value={descripcion}
                    onChange={e => setDescripcion(e.target.value)}
                    placeholder="Descripción del producto"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[100px] resize-vertical"
                  />
                </div>
                <Separator />
                <div className="space-y-2">
                  <Label htmlFor="precio">Precio *</Label>
                  <Input
                    id="precio"
                    type="number"
                    value={precio}
                    onChange={e => setPrecio(Number(e.target.value))}
                    placeholder="Precio"
                  />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Clasificación</CardTitle>
                <CardDescription>
                  Categoría, subcategoría y marca
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="categoria">Categoría *</Label>
                  <Input
                    id="categoria"
                    value={categoria}
                    onChange={e => setCategoria(e.target.value)}
                    placeholder="Ej: Electrónica"
                  />
                </div>
                <Separator />
                <div className="space-y-2">
                  <Label htmlFor="subcategoria">Subcategoría</Label>
                  <Input
                    id="subcategoria"
                    value={subcategoria}
                    onChange={e => setSubcategoria(e.target.value)}
                    placeholder="Ej: Celulares"
                  />
                </div>
                <Separator />
                <div className="space-y-2">
                  <Label htmlFor="marca">Marca *</Label>
                  <Input
                    id="marca"
                    value={marca}
                    onChange={e => setMarca(e.target.value)}
                    placeholder="Ej: Samsung"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Galería al final */}
          <div className="mt-8">
            <Label>Galería de imágenes *</Label>
            <Input
              type="file"
              accept="image/*"
              multiple
              onChange={handleGaleriaChange}
            />
            {galeriaPreviews.length > 0 && (
              <div className="flex gap-4 mt-4 flex-wrap">
                {galeriaPreviews.map((src, idx) => (
                  <div key={idx} className="flex flex-col items-center">
                    <img
                      src={src}
                      alt={`galeria-preview-${idx}`}
                      className={`w-24 h-24 object-cover rounded border ${portadaIndex === idx ? "ring-2 ring-blue-500" : ""}`}
                    />
                    <label className="flex items-center mt-2 text-sm">
                      <input
                        type="radio"
                        name="portada"
                        checked={portadaIndex === idx}
                        onChange={() => setPortadaIndex(idx)}
                        className="mr-1"
                      />
                      Portada
                    </label>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>
      </div>
    </ProtectedRoute>
  );
}

export default function PageWithSuspense() {
  return (
    <Suspense fallback={<div>Cargando...</div>}>
      <InsertProductoPage />
    </Suspense>
  );
}