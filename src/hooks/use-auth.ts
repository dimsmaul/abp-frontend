import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { signIn, signUp, authClient } from '@/lib/auth-client'

export function useAuth() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleLogin = async (data: any) => {
    setLoading(true)
    setError('')

    const { error } = await signIn.email({
      email: data.email,
      password: data.password,
      callbackURL: '/'
    })

    if (error) {
      setError(error.message || 'Gagal masuk. Silakan cek kembali email dan password Anda.')
      setLoading(false)
    } else {
      navigate('/')
    }
  }

  const handleRegister = async (data: any) => {
    setLoading(true)
    setError('')

    const { error } = await signUp.email({
      email: data.email,
      password: data.password,
      name: data.name,
      callbackURL: '/'
    })

    if (error) {
      setError(error.message || 'Gagal mendaftar. Silakan coba lagi.')
      setLoading(false)
    } else {
      navigate('/')
    }
  }

  const handleGoogleAuth = async () => {
    await authClient.signIn.social({
      provider: 'google',
      callbackURL: window.location.origin
    })
  }

  return {
    loading,
    error,
    handleLogin,
    handleRegister,
    handleGoogleAuth
  }
}
