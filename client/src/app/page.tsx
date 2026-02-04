'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { GraduationCap, Briefcase, KeyRound, Search, HelpCircle } from 'lucide-react';
import { useSettings } from '@/context/SettingsContext';

export default function Home() {
  const { settings } = useSettings();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-2xl text-center">
        <div className="flex justify-center mb-6">
          <img
            src={settings.logo_url || '/logo.png'}
            alt="Soporte Petén"
            className="h-32 w-auto object-contain"
            onError={(e) => (e.target as HTMLImageElement).style.display = 'none'}
          />
        </div>
        <h1 className="text-center text-5xl font-extrabold text-blue-900 tracking-tight mb-4">
          {settings.nombre_app || 'Soporte Petén'}
        </h1>
        <p className="text-center text-xl text-gray-600 mb-12">
          Selecciona tu perfil para iniciar una solicitud
        </p>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-4xl">
        <div className="bg-white py-12 px-6 shadow-xl sm:rounded-2xl sm:px-12">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">

            {/* Opción Docente */}
            <div className="relative group border-2 border-transparent hover:border-blue-500 rounded-xl p-6 transition-all duration-200 bg-blue-50 hover:bg-white hover:shadow-lg flex flex-col items-center text-center">
              <div className="h-20 w-20 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <GraduationCap className="h-10 w-10" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Soy Docente</h3>
              <p className="text-gray-500 mb-8 flex-1">
                Reporta problemas con equipos de aula, proyectores o software educativo.
              </p>
              <Link href="/solicitud?role=docente" className="w-full">
                <Button className="w-full text-lg py-4 shadow-md bg-blue-600 hover:bg-blue-700">
                  Ingresar Solicitud
                </Button>
              </Link>
            </div>

            {/* Opción Administrativo */}
            <div className="relative group border-2 border-transparent hover:border-indigo-500 rounded-xl p-6 transition-all duration-200 bg-indigo-50 hover:bg-white hover:shadow-lg flex flex-col items-center text-center">
              <div className="h-20 w-20 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Briefcase className="h-10 w-10" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Administrativo</h3>
              <p className="text-gray-500 mb-8 flex-1">
                Solicita soporte para equipos de oficina, redes, impresoras y sistemas.
              </p>
              <Link href="/solicitud?role=administrativo" className="w-full">
                <Button className="w-full text-lg py-4 shadow-md bg-indigo-600 hover:bg-indigo-700">
                  Ingresar Solicitud
                </Button>
              </Link>
            </div>

          </div>

          <div className="mt-12 border-t pt-8 text-center">
            <p className="text-gray-500 mb-4">¿Ya tienes una cuenta o eres técnico?</p>
            <Link href="/auth/login">
              <Button variant="outline" className="text-gray-600 border-gray-300 hover:bg-gray-50">
                <KeyRound className="h-4 w-4 mr-2" />
                Iniciar Sesión
              </Button>
            </Link>
            <Link href="/consultar" className="ml-4">
              <Button variant="outline" className="text-blue-600 border-blue-200 bg-blue-50 hover:bg-blue-100 hover:border-blue-300">
                <Search className="h-4 w-4 mr-2" />
                Consultar Estado
              </Button>
            </Link>
            <Link href="/faq" className="ml-4">
              <Button variant="outline" className="text-green-600 border-green-200 bg-green-50 hover:bg-green-100 hover:border-green-300">
                <HelpCircle className="h-4 w-4 mr-2" />
                Preguntas Frecuentes
              </Button>
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}
