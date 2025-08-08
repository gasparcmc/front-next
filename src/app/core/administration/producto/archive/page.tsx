"use client";
import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import Papa from "papaparse";
import { apiClient } from "@/lib/apiClient";
import { Import } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";



interface Producto {
  id?: number;
  nombre: string;
  descripcion: string;
  precio: number;
  categoria: string;
  subcategoria: string;
  marca: string;
  proveedor_id: number;
}

interface Proveedor {
  id: number;
  razonSocial: string;
}

type EstadoFila = "pendiente" | "exito" | "error";

export default function ArchivoProductosPage() {
    const router = useRouter();
  const [productos, setProductos] = useState<Producto[]>([]);
  const [estadoFilas, setEstadoFilas] = useState<EstadoFila[]>([]);
  const [error, setError] = useState<string>("");
  const [proveedores, setProveedores] = useState<Proveedor[]>([]);
  const [proveedorSeleccionado, setProveedorSeleccionado] = useState<number>(0);
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    const fetchProveedores = async () => {
      try {
        const data = await apiClient<Proveedor[]>("/proveedor", { method: "GET" });
        setProveedores(data);
        if (data.length > 0) setProveedorSeleccionado(data[0].id);
      } catch (err) {
        setError("No se pudieron cargar los proveedores");
      }
    };
    fetchProveedores();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setError("");
    if (!file) return;
    if (!file.name.endsWith(".csv")) {
      setError("Solo se permiten archivos CSV.");
      return;
    }
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (result: Papa.ParseResult<any>) => {
        try {
          const data = (result.data as any[]).map((row) => ({
            nombre: row.nombre || "",
            descripcion: row.descripcion || "",
            precio: Number(row.precio),
            categoria: row.categoria || "",
            subcategoria: row.subcategoria || "",
            marca: row.marca || "",
            proveedor_id: proveedorSeleccionado,
          }));
          setProductos(data);
          setEstadoFilas(Array(data.length).fill("pendiente"));
        } catch (err) {
          setError("Error al procesar el archivo. Verifica el formato del CSV.");
        }
      },
      error: () => setError("No se pudo leer el archivo."),
    });
  };

  const handleProveedorChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setProveedorSeleccionado(Number(e.target.value));
    // Si ya hay productos cargados, actualiza el proveedorId de todos
    if (productos.length > 0) {
      setProductos(productos.map(p => ({ ...p, proveedorId: Number(e.target.value) })));
    }
  };

  const handleBack = () => {
    router.push('/core/administration/producto');
  };

  const crearProductos = async () => {
    setEnviando(true);
    let nuevoEstado = [...estadoFilas];
    for (let i = 0; i < productos.length; i++) {
      try {
        productos[i].proveedor_id = proveedorSeleccionado;
        const respuesta = await apiClient<{
            id: number;
            message: string;
            success: boolean;
          }>("/producto", { method: "POST", body: productos[i] });
        console.log("Respuesta del servidor", respuesta);

        if (respuesta.success) {
            productos[i].id = respuesta.id;
        
        nuevoEstado[i] = "exito";
        setEstadoFilas([...nuevoEstado]);
        } else {
          nuevoEstado[i] = "error";
          setEstadoFilas([...nuevoEstado]);
          setEnviando(false);
          return; // Detener en el primer error
        }
      } catch (err) {
        nuevoEstado[i] = "error";
        setEstadoFilas([...nuevoEstado]);
        setEnviando(false);
        return; // Detener en el primer error
      }
    }
    setEnviando(false);
  };



  return (
    <div className="p-10">
      <Card>
        <CardHeader>
        
          <div className="flex items-center gap-3">
          <Button onClick={handleBack} variant="ghost" size="sm" className="h-8 w-8 p-0 mx-10">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            <Import className="h-8 w-8 text-blue-600" />
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Importar productos</h1>
              <p className="text-muted-foreground">
                Importa productos desde un archivo CSV
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex flex-col gap-4 md:flex-row md:items-center">
            <div>
              <label className="block mb-1 font-medium">Proveedor</label>
              <select
                className="border rounded px-2 py-1"
                value={proveedorSeleccionado}
                onChange={handleProveedorChange}
                disabled={enviando}
              >
                {proveedores.map((p) => (
                  <option key={p.id} value={p.id}>{p.razonSocial}</option>
                ))}
              </select>
            </div>
            <div>
              <Input type="file" accept=".csv" onChange={handleFileChange} disabled={enviando} />
            </div>
            <div>
              <button
                className={`px-4 py-2 rounded text-white ${enviando ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"}`}
                onClick={crearProductos}
                disabled={enviando || productos.length === 0}
              >
                {enviando ? "Enviando..." : "Crear productos"}
              </button>
            </div>
          </div>
          {error && <div className="text-red-500 mt-2">{error}</div>}
          <div className="overflow-x-auto mt-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Descripción</TableHead>
                  <TableHead>Precio</TableHead>
                  <TableHead>Categoría</TableHead>
                  <TableHead>Subcategoría</TableHead>
                  <TableHead>Marca</TableHead>
                  <TableHead>Estado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {productos.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center text-gray-400 py-6">
                      No hay productos importados.
                    </TableCell>
                  </TableRow>
                ) : (
                  productos.map((prod, idx) => (
                    <TableRow key={idx} className={
                      estadoFilas[idx] === "exito"
                        ? "bg-green-100"
                        : estadoFilas[idx] === "error"
                        ? "bg-red-100"
                        : ""
                    }>
                      <TableCell>{prod.id? prod.id : ''}</TableCell>
                      <TableCell>{prod.nombre}</TableCell>
                      <TableCell>{prod.descripcion}</TableCell>
                      <TableCell>${prod.precio.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</TableCell>
                      <TableCell>{prod.categoria}</TableCell>
                      <TableCell>{prod.subcategoria}</TableCell>
                      <TableCell>{prod.marca}</TableCell>
                      <TableCell>
                        {estadoFilas[idx] === "exito" && <span className="text-green-700 font-bold">✔</span>}
                        {estadoFilas[idx] === "error" && <span className="text-red-700 font-bold">✖</span>}
                        {estadoFilas[idx] === "pendiente" && <span className="text-gray-400">Pendiente</span>}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
