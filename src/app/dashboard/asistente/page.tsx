// src/app/dashboard/asistente/page.tsx
export default function AsistentePanel() {
  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-semibold">Panel de Asistente</h1>
      <section>
        <h2 className="text-lg font-medium mb-2">Mis reservas</h2>
        {/* Tabla de reservas, estado, fecha, método de pago */}
      </section>
      <section>
        <h2 className="text-lg font-medium mb-2">Boletos/Entradas</h2>
        {/* QR para acceder a eventos, ver detalles de la entrada */}
      </section>
      <section>
        <h2 className="text-lg font-medium mb-2">Notificaciones</h2>
        {/* Listado de notificaciones: reembolsos, cancelaciones, recordatorios */}
      </section>
    </div>
  );
}
