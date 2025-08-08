import { Card } from "@/components/ui/card";
import React from "react";
import { Star, MapPin, Truck, Plus, Eye } from "lucide-react";

interface ProductoPreviewCardProps {
  galeriaPreviews: string[];
  portadaIndex: number;
  nombre: string;
  descripcion: string;
  precio: number;
  marketplace?: string; // Ej: MercadoLibre
  rating?: number; // Ej: 4.8
  ubicacion?: string; // Ej: Buenos Aires
  stock?: number; // Ej: 15
  envioGratis?: boolean; // true -> muestra "Envío gratis"
  onAgregar?: () => void; // Click del botón Agregar
}

const formatMoney = (value: number): string => {
  if (Number.isNaN(value)) return "$0.00";
  try {
    return `$${value.toLocaleString("es-AR")}`;
  } catch {
    return `$${value}`;
  }
};

const ProductoPreviewCard: React.FC<ProductoPreviewCardProps> = ({
  galeriaPreviews,
  portadaIndex,
  nombre,
  descripcion,
  precio,
  marketplace = "MercadoLibre",
  rating = 4.8,
  ubicacion = "Buenos Aires",
  stock = 0,
  envioGratis = true,
  onAgregar,
}) => {
  return (
    <Card className="rounded-2xl shadow-lg overflow-hidden bg-white">
      {/* Chip marketplace */}
      <div className="absolute mt-3 ml-3 z-10">
        <span className="bg-yellow-100 text-yellow-700 text-xs px-3 py-1 rounded-full shadow-sm">
          {marketplace}
        </span>
      </div>

      {/* Imagen / placeholder */}
      <div className="h-44 bg-gray-200 grid place-items-center text-gray-400 text-2xl font-semibold">
        {galeriaPreviews && galeriaPreviews.length > 0 ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={galeriaPreviews[portadaIndex]}
            alt={nombre}
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="px-4 text-center leading-tight">{nombre || "Producto"}</span>
        )}
      </div>

      {/* Cuerpo */}
      <div className="p-4 space-y-3">
        <h3 className="font-semibold text-gray-900 leading-5">
          {nombre || "Nombre del producto"}
        </h3>

        {/* Rating */}
        <div className="flex items-center gap-2 text-sm text-gray-700">
          <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
          <span>{rating}</span>
        </div>

        {/* Ubicación */}
        <div className="flex items-center gap-2 text-sm text-gray-700">
          <MapPin className="w-4 h-4 text-gray-500" />
          <span>{ubicacion}</span>
        </div>

        {/* Precio y stock */}
        <div className="flex items-baseline justify-between mt-1">
          <div className="text-blue-600 font-bold text-xl">{formatMoney(precio)}</div>
          <div className="text-gray-500 text-sm">Stock: {stock}</div>
        </div>

        {/* Envío */}
        {envioGratis && (
          <div className="flex items-center gap-2 text-sm text-emerald-600 mt-1">
            <Truck className="w-4 h-4" />
            <span>Envío gratis</span>
          </div>
        )}

        {/* Botones */}
        <div className="mt-2 flex items-center gap-3">
          <button
            type="button"
            className="flex-1 inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl shadow"
            onClick={() => (onAgregar ? onAgregar() : alert("Apretaste el botón"))}
          >
            <Plus className="w-5 h-5" /> Agregar
          </button>
          <button
            type="button"
            className="w-12 h-12 grid place-items-center rounded-xl bg-gray-100 text-gray-600 hover:bg-gray-200 shadow"
            aria-label="Ver"
          >
            <Eye className="w-5 h-5" />
          </button>
        </div>
      </div>
    </Card>
  );
};

export default ProductoPreviewCard;
