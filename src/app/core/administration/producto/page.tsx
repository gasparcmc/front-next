"use client";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { apiClient } from "@/lib/apiClient";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Shield } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Proveedor } from "./../proveedor/proveedor.interface";

interface Producto {
  id: number;
  nombre: string;
  descripcion: string;
  precio: string;
}

export default function ListarProductosPage() {
  const router = useRouter();
  const [productos, setProductos] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [proveedor, setProveedor] = useState<Proveedor[]>([]);
  // Filtros
  const [filtroNombre, setFiltroNombre] = useState("");
  const [filtroDescripcion, setFiltroDescripcion] = useState("");
  const [filtroPrecioMin, setFiltroPrecioMin] = useState("");
  const [filtroPrecioMax, setFiltroPrecioMax] = useState("");
  const [filtroProveedor, setFiltroProveedor] = useState<string>("");

  const filtros = { filtroNombre, filtroDescripcion, filtroPrecioMin, filtroPrecioMax, filtroProveedor, pageSize };
  const prevFiltros = useRef(filtros);

  useEffect(() => {
    if (JSON.stringify(prevFiltros.current) !== JSON.stringify(filtros)) {
      setPage(1);
      prevFiltros.current = filtros;
    }
    // eslint-disable-next-line
  }, [filtroNombre, filtroDescripcion, filtroPrecioMin, filtroPrecioMax, filtroProveedor, pageSize]);

  useEffect(() => {
    const fetchProductos = async () => {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        pageSize: pageSize.toString(),
        nombre: filtroNombre,
        descripcion: filtroDescripcion,
        precioMin: filtroPrecioMin,
        precioMax: filtroPrecioMax,
        proveedor_id: filtroProveedor ? filtroProveedor : "0",
      });
      const data = await apiClient<{ data: Producto[], total: number }>(`/producto?${params.toString()}`, { method: "GET" });
      setProductos(data.data || []);
      setTotal(data.total || 0);
      setLoading(false);
    };
    fetchProductos();
    fetchProveedores();
  }, [page, pageSize, filtroNombre, filtroDescripcion, filtroPrecioMin, filtroPrecioMax, filtroProveedor]);

  const fetchProveedores = async () => {
    let proveedores: Proveedor[] = [];
    proveedores.push({ id: 0, razonSocial: "Todos", rubro: "", direccion: "", telefono: "", email: "", cuit: "", web: "", observaciones: "", estado: 'true', portada: "" });
    const proveedoresData = await apiClient<Proveedor[]>("/proveedor", { method: "GET" });
    proveedores = proveedores.concat(proveedoresData);

    setProveedor(proveedores);
  }

  const handleEliminar = async (id: number) => {
    if (window.confirm("¿Seguro que deseas eliminar este producto?")) {
      await apiClient(`/producto/${id}`, { method: "DELETE" });
      setProductos(productos.filter(p => p.id !== id));
    }
  };

  // Calcular páginas
  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="p-10">
      <Card>
        <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield className="h-8 w-8 text-blue-600" />
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Productos</h1>
              <p className="text-muted-foreground">
                Gestiona tus productos
              </p>
            </div>
          </div>

          <Button onClick={() => router.push("/core/administration/producto/archive")} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Importar Archivo
          </Button>

          <Button onClick={() => router.push("/core/administration/producto/insert")} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Nuevo Producto
          </Button>
          </div>



        </CardHeader>
        <CardContent>
          {/* Filtros */}
          <div className="flex flex-col gap-4 mb-4">
            {/* Fila superior: nombre, descripción, proveedor */}
            <div className="flex flex-wrap gap-4">
              <div className="space-y-2">
              <Label htmlFor="nombre">Nombre</Label>
              <Input
                placeholder="Nombre"
                value={filtroNombre}
                onChange={e => setFiltroNombre(e.target.value)}
                className="w-40"
              />
              </div>
              <div className="space-y-2">
              <Label htmlFor="descripcion">Descripción</Label>
              <Input
                placeholder="Descripción"
                value={filtroDescripcion}
                onChange={e => setFiltroDescripcion(e.target.value)}
                className="w-40"
              />
              </div>
                  <div className="space-y-2">
                    <Label htmlFor="proveedor">Proveedor</Label>
                    <Select value={filtroProveedor} onValueChange={e => setFiltroProveedor(e)}>
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
            </div>

            {/* Fila inferior: precio mínimo, máximo y botón */}
            <div className="flex flex-wrap gap-4 items-end">
              <div className="space-y-2">
              <Label htmlFor="precioMin">Precio mínimo</Label>
              <Input
                placeholder="Precio mínimo"
                type="number"
                value={filtroPrecioMin}
                onChange={e => setFiltroPrecioMin(e.target.value)}
                className="w-32"
              />
              </div>
              <div className="space-y-2">
              <Label htmlFor="precioMax">Precio máximo</Label>
              <Input
                placeholder="Precio máximo"
                type="number"
                value={filtroPrecioMax}
                onChange={e => setFiltroPrecioMax(e.target.value)}
                className="w-32"
              />
              </div>
              <Button onClick={() => setPage(1)} variant="secondary">
                Filtrar
              </Button>
            </div>
          </div>
          {loading ? (
            <div>Cargando...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead className="w-1/2 min-w-[220px]">Descripción</TableHead>
                  <TableHead>Precio</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {productos.length === 0 ? (
                  Array.from({ length: pageSize }).map((_, idx) => (
                    <TableRow key={idx}>
                      <TableCell colSpan={4}>
                        {idx === 0 ? (
                          <div className="text-center text-gray-400 py-6">No hay productos para mostrar</div>
                        ) : null}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <>
                    {productos.map((prod) => (
                      <TableRow key={prod.id}>
                        <TableCell>{prod.nombre}</TableCell>
                        <TableCell className="w-1/2 min-w-[220px]">{prod.descripcion}</TableCell>
                        <TableCell>${parseFloat(prod.precio).toLocaleString('es-AR', { minimumFractionDigits: 2 })}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline" onClick={() => router.push(`/core/administration/producto/${prod.id}`)}>Visualizar</Button>
                            <Button size="sm" variant="secondary" onClick={() => router.push(`/core/administration/producto/update?id=${prod.id}`)}>Editar</Button>
                            <Button size="sm" variant="destructive" onClick={() => handleEliminar(prod.id)}>Eliminar</Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                    {/* Completar con filas vacías si hay menos productos que pageSize */}
                    {Array.from({ length: pageSize - productos.length }).map((_, idx) => (
                      <TableRow key={`empty-${idx}`}>
                        <TableCell>&nbsp;</TableCell>
                        <TableCell className="w-1/2 min-w-[220px]">&nbsp;</TableCell>
                        <TableCell>&nbsp;</TableCell>
                        <TableCell>&nbsp;</TableCell>
                      </TableRow>
                    ))}
                  </>
                )}
              </TableBody>
            </Table>
          )}
          {/* Paginado */}
          <div className="flex justify-between items-center mt-4">
            <div>
              <Button size="sm" disabled={page === 1} onClick={() => setPage(page - 1)}>Anterior</Button>
              <span className="mx-2">Página {page} de {totalPages || 1}</span>
              <Button size="sm" disabled={page === totalPages || totalPages === 0} onClick={() => setPage(page + 1)}>Siguiente</Button>
            </div>
            <div>
              <label className="mr-2">Filas por página:</label>
              <select value={pageSize} onChange={e => setPageSize(Number(e.target.value))} className="border rounded px-2 py-1">
                {[5, 10, 20, 50].map(size => (
                  <option key={size} value={size}>{size}</option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
