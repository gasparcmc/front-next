export interface Producto {
  id: number;
  nombre: string;
  descripcion: string;
  precio: number;
  categoria: string;
  subcategoria: string;
  marca: string;
  proveedorId: number;
  galeria: string[];
  portada: string;
}