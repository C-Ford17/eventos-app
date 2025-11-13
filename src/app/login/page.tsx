// src/app/login/page.tsx
'use client';
import { useState } from 'react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    // Aquí va tu lógica de autenticación, por ejemplo:
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      if (!res.ok) throw new Error('Credenciales incorrectas.');
      // Redirección al dashboard, por ejemplo
      window.location.href = '/dashboard';
    } catch (err: any) {
      setError(err.message);
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <h2 className="text-2xl font-bold mb-4">Iniciar sesión</h2>
      <form className="bg-neutral-900 p-6 rounded w-full max-w-sm space-y-4 shadow" onSubmit={handleSubmit}>
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
        <button type="submit" className="w-full py-2 bg-blue-600 hover:bg-blue-700 rounded text-white font-semibold">Entrar</button>
      </form>
      <p className="mt-4 text-sm text-neutral-300">
        ¿No tienes cuenta? <a href="/register" className="text-blue-400 hover:underline">Regístrate</a>
      </p>
    </div>
  );
}
