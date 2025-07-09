

"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from 'axios';

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [checked, setChecked] = useState(false);
  const [isValidating, setIsValidating] = useState(true);

  useEffect(() => {
    const checkToken = async () => {
      try {
        // Hacer una petición simple para verificar que la cookie existe
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/check`,
          {
            withCredentials: true, // Envía automáticamente la cookie HttpOnly
          }
        );
        // Si la petición es exitosa, significa que la cookie existe y es válida
      
        if (response.status === 200) {
          console.log("Cookie de token encontrada");
          setChecked(true);
        } else {
          router.push("/auth/login");
        }

        setChecked(true);
      } catch (error) {
        console.error("No se encontró cookie de token válida:", error);
        router.push("/auth/login");
      } finally {
        setIsValidating(false);
      }
    };

    checkToken();
  }, [router]);

  // Mostrar loading mientras valida
  if (isValidating) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  // Si no está verificado, no mostrar nada
  if (!checked) {
    return null;
  }

  return <>{children}</>;
}
