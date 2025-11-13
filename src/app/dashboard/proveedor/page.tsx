// src/app/dashboard/proveedor/page.tsx
export default function ProveedorPanel() {
  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-semibold">Panel de Proveedor</h1>
      <section>
        <h2 className="text-lg font-medium mb-2">Mis productos/servicios</h2>
        {/* Botón para agregar, editar o eliminar productos/servicios */}
        <button className="bg-green-600 text-white px-4 py-2 rounded">Agregar producto/servicio</button>
        {/* Tabla/Listado de productos/servicios */}
      </section>
      <section>
        <h2 className="text-lg font-medium mb-2">Solicitudes recibidas</h2>
        {/* Tabla de solicitudes de eventos, estado, acciones */}
      </section>
    </div>
  );
}
