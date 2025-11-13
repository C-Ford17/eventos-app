'use client'
import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'

export default function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    const res = await signIn('credentials', {
      email,
      password,
      redirect: false
    })
    if (res?.ok) {
      router.push('/') // Redirecciona al home tras login correcto
    } else {
      setError('Credenciales incorrectas')
    }
  }

  return (
    <form className="max-w-md mx-auto p-4 space-y-4" onSubmit={handleSubmit}>
      <h2 className="text-xl font-semibold">Iniciar sesión</h2>
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
        className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
      >
        Entrar
      </button>
    </form>
  )
}
