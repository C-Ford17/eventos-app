// src/app/register/page.tsx
'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
  const [nombre, setNombre] = useState('');  // <-- Cambiado de 'name' a 'nombre'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
  e.preventDefault();
  setError('');
  setLoading(true);
  
  try {
    const res = await fetch('/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nombre, email, password })
    });
    
    setLoading(false);
    
    // Verifica si la respuesta es JSON antes de parsear
    const contentType = res.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      const data = await res.json();
      
      if (res.ok) {
        router.push('/login');
      } else {
        setError(data.error || 'No se pudo registrar el usuario.');
        console.error('Error del servidor:', data);
      }
    } else {
      // La respuesta no es JSON, probablemente un error del servidor
      const text = await res.text();
      console.error('Respuesta no-JSON del servidor:', text);
      setError('Error del servidor. Por favor, revisa la consola para más detalles.');
    }
    
  } catch (err: any) {
    setLoading(false);
    setError('Error de conexión con el servidor');
    console.error('Error:', err);
  }
}


  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <h2 className="text-2xl font-bold mb-4">Registro</h2>
      <form className="bg-neutral-900 p-6 rounded w-full max-w-sm space-y-4 shadow" onSubmit={handleSubmit}>
        <input
          className="w-full px-3 py-2 rounded bg-neutral-800 text-white"
          type="text"
          placeholder="Nombre completo"
          value={nombre}
          onChange={e => setNombre(e.target.value)}
          required
        />
        <input
          className="w-full px-3 py-2 rounded bg-neutral-800 text-white"
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
        />
        <input
          className="w-full px-3 py-2 rounded bg-neutral-800 text-white"
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
        />
        {error && <div className="text-red-400 text-sm">{error}</div>}
        <button 
          type="submit" 
          disabled={loading}
          className="w-full py-2 bg-blue-600 hover:bg-blue-700 rounded text-white font-semibold disabled:opacity-50"
        >
          {loading ? 'Registrando...' : 'Registrarse'}
        </button>
      </form>
      <p className="mt-4 text-sm text-neutral-300">
        ¿Ya tienes cuenta? <a href="/login" className="text-blue-400 hover:underline">Iniciar sesión</a>
      </p>
    </div>
  );
}
