'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function RegisterForm() {
  const [nombre, setNombre] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    // Llama a tu API para crear usuario
    const res = await fetch('/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nombre, email, password })
    })
    setLoading(false)
    if (res.ok) {
      router.push('/login')
    } else {
      setError('No se pudo registrar el usuario')
    }
  }

  return (
    <form className="max-w-md mx-auto p-4 space-y-4" onSubmit={handleSubmit}>
      <h2 className="text-xl font-semibold">Registrarse</h2>
      <input
        type="text"
        placeholder="Nombre completo"
        value={nombre}
        onChange={e => setNombre(e.target.value)}
        className="w-full border rounded px-2 py-1"
        required
      />
      <input
        type="email"
        placeholder="Correo"
        value={email}
        onChange={e => setEmail(e.target.value)}
        className="w-full border rounded px-2 py-1"
        required
      />
      <input
        type="password"
        placeholder="Contraseña"
        value={password}
        onChange={e => setPassword(e.target.value)}
        className="w-full border rounded px-2 py-1"
        required
      />
      {error && <div className="text-red-500 text-sm">{error}</div>}
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700"
      >
        {loading ? 'Registrando...' : 'Registrarse'}
      </button>
    </form>
  )
}
