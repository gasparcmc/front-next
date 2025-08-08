"use client";
import { useState, useEffect, Suspense } from "react";
import { useRouter, useParams } from "next/navigation";
import { apiClient } from "@/lib/apiClient";
import ProtectedRoute from "@/app/auth/ProtectedRoute";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Save, ImagePlus } from "lucide-react";
import { Proveedor } from "../../proveedor/proveedor.interface";
import { Producto } from "../producto.interface";
import { useSearchParams } from "next/navigation";
import ProductoPreviewCard from "@/components/ProductoPreviewCard";


function UpdateProductoPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const productoId = searchParams.get('id');
  console.log(productoId);

  // Estados del producto
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [precio, setPrecio] = useState<number>(0);
  const [categoria, setCategoria] = useState("");
  const [subcategoria, setSubcategoria] = useState("");
  const [marca, setMarca] = useState("");
  const [galeriaFiles, setGaleriaFiles] = useState<File[]>([]);
  const [galeriaPreviews, setGaleriaPreviews] = useState<string[]>([]);
  const [portadaIndex, setPortadaIndex] = useState<number>(0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [proveedor, setProveedor] = useState<Proveedor[]>([]);
  const [proveedorSeleccionado, setProveedorSeleccionado] = useState<string>("");
  const [updateFile, setUpdateFile] = useState<boolean>(false);


  // URL de la galería
  const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL +   '/uploads/galeria';

  // Cargar datos del producto y proveedores
  useEffect(() => {
    const fetchData = async () => {
      const prod = await apiClient<Producto>(`/producto/${productoId}`, { method: "GET" });
      console.log(prod);
      setNombre(prod.nombre || "");
      setDescripcion(prod.descripcion || "");
      setPrecio(Number(prod.precio) || 0);
      setCategoria(prod.categoria || "");
      setSubcategoria(prod.subcategoria || "");
      setMarca(prod.marca || "");
      setProveedorSeleccionado(prod.proveedorId ? prod.proveedorId.toString() : "");

      // Si hay galería, cargar previews (asumiendo URLs)
      if (prod.galeria && Array.isArray(prod.galeria)) {
        // Cargar previews y archivos
        setGaleriaPreviews(prod.galeria.map((img: string) => `${baseUrl}/${img}`));
        // Cargar archivos
        (async () => {
          setGaleriaFiles(await Promise.all(
            prod.galeria.map(img =>
              fetch(`${baseUrl}/${img}`)
                .then(res => res.blob())
                .then(blob => new File([blob], img, { type: blob.type }))
            )
          ));
        })();

        setPortadaIndex(Number(prod.portada))

      }
    };
    const fetchProveedores = async () => {
      const proveedores = await apiClient<Proveedor[]>("/proveedor", { method: "GET" });
      setProveedor(proveedores);
    };
    if (productoId) {
      fetchData();
      fetchProveedores();
    }
  }, []);

  // Manejar selección de galería
  const handleGaleriaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUpdateFile(true);
    const files = Array.from(e.target.files || []);
    setGaleriaFiles(prev => [...prev, ...files]);
    setGaleriaPreviews(prev => [...prev, ...files.map(file => URL.createObjectURL(file))]);
    setPortadaIndex(0);
  };

  // Eliminar imagen de la galería
  const handleRemoveImage = (removeIdx: number) => {
    setUpdateFile(true);
    setGaleriaFiles(prev => prev.filter((_, idx) => idx !== removeIdx));
    setGaleriaPreviews(prev => prev.filter((_, idx) => idx !== removeIdx));
    setPortadaIndex(prevPortada => {
      if (removeIdx === prevPortada) return 0;
      else if (removeIdx < prevPortada) return prevPortada - 1;
      else return prevPortada;
    });
  };

  // Guardar cambios
  const handleSave = async () => {
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
    if (!proveedorSeleccionado) {
      setError("El proveedor es requerido");
      return;
    }
    // No obligo galeriaFiles, puede mantener las imágenes actuales
    try {
      setSaving(true);
      setError(null);
      setSuccess(null);
      // Actualizar producto
      await apiClient<any>(`/producto/${productoId}`, {
        method: "PUT",
        body: {
          nombre: nombre.trim(),
          descripcion: descripcion.trim(),
          precio,
          categoria: categoria.trim(),
          subcategoria: subcategoria.trim(),
          marca: marca.trim(),
          proveedor_id: proveedorSeleccionado ? Number(proveedorSeleccionado) : 0,
          fileModificado: updateFile,
        }
      });
      // Subir nuevas imágenes si hay
      if (updateFile) {
      let idx = 0;
      for (const file of galeriaFiles) {
        try {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("portada", portadaIndex === idx ? idx.toString() : "false");
        const response = await apiClient<{ success: boolean, message: string}>(`/producto/${productoId}/galeria`, {
          headers: { "Content-Type": "multipart/form-data" },
          method: "POST",
          body: formData,
        });

        if (!response.success) {
          setError(response.message);
          return;
        }
        idx++;
        } catch (err: any) {
          setError(err.message || "Error al actualizar la galería");
          return
        }
      }

    }

      setSuccess("Producto actualizado correctamente");

      setTimeout(() => {
        setSuccess(null);
        router.push("/core/administration/producto");
      }, 2000);
    } catch (err: any) {
      setError(err.message || "Error al actualizar el producto");
    } finally {
      setSaving(false);
    }
  };

  const handlePortadaChange = (idx: number) => {
    setPortadaIndex(idx);
    setUpdateFile(true);
  };

  const handleBack = () => {
    router.push('/core/administration/producto');
  };

  return (
    <ProtectedRoute>
      <div className="p-10 space-y-8">
        <Card className="mx-2 mb-8 mr-10">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button onClick={handleBack} variant="ghost" size="sm" className="h-8 w-8 p-0 mx-10">
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <ImagePlus className="h-8 w-8 text-blue-600" />
              <div>
                <h1 className="text-3xl font-bold tracking-tight">Editar Producto</h1>
                <p className="text-muted-foreground">
                  Modifica la información del producto
                </p>
              </div>
            </div>
            <Button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 mx-10"
            >
              {saving ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <Save className="h-4 w-4" />
              )}
              {saving ? "Guardando..." : "Actualizar Producto"}
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

          {/* Formulario principal y previsualización */}
          <div className="grid md:grid-cols-3 mt-8">
            {/* Formulario principal */}
            <div className="md:col-span-2 flex flex-col ">
              <Card className="p-8 mb-8 mx-2">
                {/* Header, Información Principal */}
                <CardHeader>
                  <CardTitle>Información Principal</CardTitle>
                  <CardDescription>
                    Datos básicos del producto
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
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
                  <Separator />
                  <div className="space-y-2">
                    <Label htmlFor="proveedor">Proveedor *</Label>
                    <Select
                      value={proveedorSeleccionado}
                      onValueChange={setProveedorSeleccionado}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona un proveedor" />
                      </SelectTrigger>
                      <SelectContent>
                        {proveedor.map((p) => (
                          <SelectItem key={p.id} value={p.id.toString()}>
                            {p.razonSocial}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
              <Card className="p-8 mb-8 mx-2">
                {/* Clasificación */}
                <CardHeader>
                  <CardTitle>Clasificación</CardTitle>
                  <CardDescription>
                    Categoría, subcategoría y marca
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
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
            {/* Previsualización */}
            <div >
              <ProductoPreviewCard
                galeriaPreviews={galeriaPreviews}
                portadaIndex={portadaIndex}
                nombre={nombre}
                descripcion={descripcion}
                precio={precio}
              />
            </div>
          </div>

          {/* Galería al final */}
          <div className="mt-10 mx-2">
            <Label>Galería de imágenes *</Label>
            <Input
              type="file"
              accept="image/*"
              multiple
              onChange={handleGaleriaChange}
            />
            {galeriaPreviews.length > 0 && (
              <div className="flex gap-4 mt-6 flex-wrap">
                {galeriaPreviews.map((src, idx) => (
                  <div key={idx} className="flex flex-col items-center relative group">
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(idx)}
                      className="absolute top-1 right-1 bg-red-500 hover:bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center shadow-md opacity-80 group-hover:opacity-100 transition-opacity z-10"
                      title="Eliminar imagen"
                      style={{ lineHeight: 1 }}
                    >
                      ×
                    </button>
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
                        onChange={() => handlePortadaChange(idx)}
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
      <UpdateProductoPage />
    </Suspense>
  );
}
