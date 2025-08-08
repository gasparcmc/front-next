import { Card } from "@/components/ui/card";
import React from "react";
import { Star, Heart } from "lucide-react";

interface ProductoPreviewCardProps {
  // Imagen/portada
  galeriaPreviews: string[];
  portadaIndex: number;
  // Cabecera
  nombre: string; // Título principal (ej: Garbarino)
  descripcion: string; // Subtítulo (usado como fallback)
  precio: number; // Fallback para totales
  // Estados visuales
  mejorPrecio?: boolean;
  favorito?: boolean;
  disponible?: boolean;
  // Totales
  total?: number; // Total a la derecha
  numProductos?: number; // Cantidad de productos
  // Ítems fijos (no dinámicos)
  item1Nombre?: string;
  item1PrecioUnitario?: number;
  item1Marca?: string;
  item1Origen?: "Local" | "ML";

  item2Nombre?: string;
  item2PrecioUnitario?: number;
  item2Marca?: string;
  item2Origen?: "Local" | "ML";

  // Acción botón
  onGuardar?: () => void;
}

const formatMoney = (value: number): string => {
  if (Number.isNaN(value)) return "$0.00";
  try {
    return `$${value.toLocaleString("es-AR")}`;
  } catch {
    return `$${value}`;
  }
};

const Chip: React.FC<{ label: string; color?: string }> = ({ label, color = "bg-purple-100 text-purple-700" }) => (
  <span className={`text-xs px-2 py-1 rounded-full ${color}`}>{label}</span>
);

const ItemRow: React.FC<{
  titulo: string;
  precioUnitario: number;
  marca: string;
  origen: "Local" | "ML";
}> = ({ titulo, precioUnitario, marca, origen }) => (
  <div className="bg-white/80 backdrop-blur-sm border border-gray-200 rounded-2xl px-5 py-4 flex items-start justify-between shadow-sm">
    <div className="space-y-2">
      <p className="font-medium text-gray-800 leading-5">{titulo}</p>
      <p className="text-xs text-gray-500">notebook (x1) - {formatMoney(precioUnitario)} c/u</p>
      <div className="flex items-center gap-2">
        <Chip label={marca} color="bg-fuchsia-100 text-fuchsia-700" />
        <Chip label={origen} color={origen === "Local" ? "bg-emerald-100 text-emerald-700" : "bg-yellow-100 text-yellow-700"} />
      </div>
    </div>
    <div className="text-right">
      <p className="text-gray-800 font-bold">{formatMoney(precioUnitario)}</p>
    </div>
  </div>
);

const ProductoPreviewCard: React.FC<ProductoPreviewCardProps> = ({
  galeriaPreviews,
  portadaIndex,
  nombre,
  descripcion,
  precio,
  mejorPrecio = false,
  favorito = false,
  disponible = true,
  total,
  numProductos = 2,
  item1Nombre,
  item1PrecioUnitario,
  item1Marca,
  item1Origen,
  item2Nombre,
  item2PrecioUnitario,
  item2Marca,
  item2Origen,
  onGuardar,
}) => {
  // Valores por defecto para mantener compatibilidad
  const resolvedTotal = typeof total === "number" ? total : precio;

  const resolvedItem1Nombre = item1Nombre ?? "notebook dell inspiron";
  const resolvedItem1Precio = typeof item1PrecioUnitario === "number" ? item1PrecioUnitario : Math.max(Math.floor(precio * 0.58), 0);
  const resolvedItem1Marca = item1Marca ?? "Dell";
  const resolvedItem1Origen = item1Origen ?? "Local";

  const resolvedItem2Nombre = item2Nombre ?? "Laptop Dell Inspiron 15 3000 ...";
  const resolvedItem2Precio = typeof item2PrecioUnitario === "number" ? item2PrecioUnitario : Math.max(Math.floor(precio * 0.42), 0);
  const resolvedItem2Marca = item2Marca ?? "Dell";
  const resolvedItem2Origen = item2Origen ?? "ML";

  return (
    <Card
      className={`relative shadow-lg p-6 md:p-7 mb-8 mx-2 border-2 rounded-3xl ${
        mejorPrecio ? "border-yellow-300 bg-yellow-50" : "border-gray-200 bg-white"
      }`}
    >
      {/* Badge Mejor Precio */}
      {mejorPrecio && (
        <div className="absolute -top-4 left-4 flex items-center bg-yellow-400 text-white px-3 py-1 rounded-full shadow text-sm font-bold z-10">
          <Star className="w-4 h-4 mr-1 fill-white" /> Mejor Precio
        </div>
      )}

      {/* Botón favorito */}
      <div className="absolute -top-4 right-4 bg-white rounded-full shadow p-2 z-10">
        {favorito ? (
          <Heart className="w-5 h-5 text-red-500 fill-red-500" />
        ) : (
          <Heart className="w-5 h-5 text-gray-300" />
        )}
      </div>

      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          {/* Avatar/imagen */}
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-400 to-fuchsia-500 grid place-items-center shadow">
            {galeriaPreviews.length > 0 ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={galeriaPreviews[portadaIndex]}
                alt="Portada"
                className="w-10 h-10 object-cover rounded-xl border border-white/50"
              />
            ) : (
              <span className="text-white text-lg font-bold">🛍️</span>
            )}
          </div>
          <div>
            <h3 className="text-2xl font-bold text-gray-900">{nombre || "Nombre"}</h3>
            <div className="flex items-center gap-3 text-sm mt-1">
              <span className="text-gray-600">{numProductos} productos</span>
              {disponible ? (
                <span className="text-emerald-600 font-semibold">Disponible</span>
              ) : (
                <span className="text-red-500 font-semibold">No disponible</span>
              )}
            </div>
            {descripcion && (
              <p className="text-xs text-gray-400 mt-1">{descripcion}</p>
            )}
          </div>
        </div>
        <div className="text-right">
          <div className={`${mejorPrecio ? "text-yellow-500" : "text-blue-600"} text-3xl font-extrabold`}>
            {formatMoney(resolvedTotal)}
          </div>
          <div className="text-xs text-gray-500">Total</div>
        </div>
      </div>

      {/* Items */}
      <div className="mt-6 space-y-4">
        <ItemRow
          titulo={resolvedItem1Nombre}
          precioUnitario={resolvedItem1Precio}
          marca={resolvedItem1Marca}
          origen={resolvedItem1Origen}
        />
        <ItemRow
          titulo={resolvedItem2Nombre}
          precioUnitario={resolvedItem2Precio}
          marca={resolvedItem2Marca}
          origen={resolvedItem2Origen}
        />
      </div>

      {/* Footer */}
      <div className="mt-6 pt-4 border-t border-gray-200 flex items-center justify-between">
        <div className="text-gray-600">Presupuesto total:</div>
        <div className={`${mejorPrecio ? "text-yellow-500" : "text-blue-600"} text-2xl font-bold`}>{formatMoney(resolvedTotal)}</div>
      </div>

      <button
        className={`mt-4 w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold shadow transition-colors ${
          mejorPrecio
            ? "bg-yellow-400 hover:bg-yellow-500 text-white"
            : "bg-gradient-to-r from-indigo-500 to-fuchsia-600 hover:from-indigo-600 hover:to-fuchsia-700 text-white"
        }`}
        onClick={() => {
          if (onGuardar) onGuardar();
          else alert("Apretaste el botón");
        }}
        type="button"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
        </svg>
        Guardar Presupuesto
      </button>
    </Card>
  );
};

export default ProductoPreviewCard;
