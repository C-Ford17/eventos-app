import DataTable from '@/components/DataTable';
import StatWidget from '@/components/StatWidget'

export default function OrganizadorPanel() {
  // Datos "dummy" para ejemplo
  const eventos = [
    { nombre: 'Feria Tech', estado: 'Activo', fecha: '2025-12-05' },
    { nombre: 'Congreso Salud', estado: 'Finalizado', fecha: '2025-11-10' }
  ];
  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-semibold">Panel de Organizador</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatWidget title="Eventos Activos" value={2} icon="📅" />
        <StatWidget title="Reportes generados" value={5} icon="📊" />
        <StatWidget title="Total de asistentes" value={730} icon="👥" />
      </div>
      <DataTable
        title="Listado de eventos"
        columns={["nombre", "estado", "fecha"]}
        data={eventos}
      />
    </div>
  );
}
