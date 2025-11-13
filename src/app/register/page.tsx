// src/app/register/page.tsx
'use client';
import { useState } from 'react';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    // Aquí va tu lógica de registro:
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
      });
      if (!res.ok) throw new Error('No se pudo registrar el usuario.');
      window.location.href = '/login';
    } catch (err: any) {
      setError(err.message);
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <h2 className="text-2xl font-bold mb-4">Registro</h2>
      <form className="bg-neutral-900 p-6 rounded w-full max-w-sm space-y-4 shadow" onSubmit={handleSubmit}>
        <input
          className="w-full px-3 py-2 rounded bg-neutral-800 text-white"
          type="text"
          placeholder="Nombre"
          value={name}
          onChange={e => setName(e.target.value)}
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
        <button type="submit" className="w-full py-2 bg-blue-600 hover:bg-blue-700 rounded text-white font-semibold">Registrarse</button>
      </form>
      <p className="mt-4 text-sm text-neutral-300">
        ¿Ya tienes cuenta? <a href="/login" className="text-blue-400 hover:underline">Iniciar sesión</a>
      </p>
    </div>
  );
}
