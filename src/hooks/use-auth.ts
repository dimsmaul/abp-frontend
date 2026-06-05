import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { signIn, signUp, authClient } from '@/lib/auth-client'
import { toast } from 'sonner'

export function useAuth() {
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleLogin = async (data: any) => {
    setLoading(true)
    try {
      // No `callbackURL` — that field tells better-auth to issue a
      // server-side redirect, which the browser follows as a full page
      // reload. We want SPA navigation via react-router instead.
      const { error } = await signIn.email({
        email: data.email,
        password: data.password,
      })

      if (error) {
        toast.error(error.message || 'Gagal masuk. Silakan cek kembali email dan password Anda.')
        return
      }

      toast.success('Selamat datang kembali!')
      navigate('/')
    } catch (e: any) {
      // Network/CORS/5xx — better-auth client throws here. Always release loading.
      const msg =
        e?.message?.toLowerCase?.().includes('failed to fetch') ||
        e?.message?.toLowerCase?.().includes('network')
          ? 'Tidak bisa terhubung ke server. Cek koneksi atau coba lagi.'
          : e?.message || 'Terjadi kesalahan saat login.'
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = async (data: any) => {
    setLoading(true)
    try {
      // Same reasoning as handleLogin — keep navigation client-side.
      const { error } = await signUp.email({
        email: data.email,
        password: data.password,
        name: data.name,
      })

      if (error) {
        toast.error(error.message || 'Gagal mendaftar. Silakan coba lagi.')
        return
      }

      toast.success('Pendaftaran berhasil!')
      navigate('/')
    } catch (e: any) {
      const msg =
        e?.message?.toLowerCase?.().includes('failed to fetch') ||
        e?.message?.toLowerCase?.().includes('network')
          ? 'Tidak bisa terhubung ke server. Cek koneksi atau coba lagi.'
          : e?.message || 'Terjadi kesalahan saat registrasi.'
      toast.error(msg)
    } finally {
      setLoading(false)
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
