import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { signIn, signUp, authClient } from '@/lib/auth-client'
import { toast } from 'sonner'

export function useAuth() {
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleLogin = async (data: any) => {
    setLoading(true)

    const { error } = await signIn.email({
      email: data.email,
      password: data.password,
      callbackURL: '/'
    })

    if (error) {
      toast.error(error.message || 'Gagal masuk. Silakan cek kembali email dan password Anda.')
      setLoading(false)
    } else {
      toast.success('Selamat datang kembali!')
      navigate('/')
    }
  }

  const handleRegister = async (data: any) => {
    setLoading(true)

    const { error } = await signUp.email({
      email: data.email,
      password: data.password,
      name: data.name,
      callbackURL: '/'
    })

    if (error) {
      toast.error(error.message || 'Gagal mendaftar. Silakan coba lagi.')
      setLoading(false)
    } else {
      toast.success('Pendaftaran berhasil!')
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
    handleLogin,
    handleRegister,
    handleGoogleAuth
  }
}
