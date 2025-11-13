import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '../api/auth/[...nextauth]/route';

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect('/login');
  }

  // Simulación rápida de panel según el tipo de usuario
  const tipo = session.user.tipo_usuario;
  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Dashboard</h1>
      {tipo === 'proveedor' && <div>Panel de proveedor</div>}
      {tipo === 'organizador' && <div>Panel de organizador</div>}
      {tipo === 'asistente' && <div>Panel de asistente</div>}
    </div>
  );
}
