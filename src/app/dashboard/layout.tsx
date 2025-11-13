// src/app/dashboard/layout.tsx
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen flex-col md:flex-row md:overflow-hidden">
      <nav className="w-full md:w-64 bg-gray-100 p-4">
        {/* Aquí puedes poner navegación lateral, logo, o menú según tus mockups */}
        <p className="font-bold">Panel principal</p>
        {/* Enlaces de navegación, se pueden personalizar por rol */}
      </nav>
      <main className="grow p-6 md:overflow-y-auto md:p-12">{children}</main>
    </div>
  );
}
