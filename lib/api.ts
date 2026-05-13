import axios from 'axios'
import Cookies from 'js-cookie'

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: { 'Content-Type': 'application/json' },
})

// Baca token dari Cookies
api.interceptors.request.use((config) => {
  const token = Cookies.get('access')  // ← sama dengan yang disimpan login
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Kalau 401, redirect ke login
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      Cookies.remove('access')
      Cookies.remove('refresh')
      Cookies.remove('role')
      Cookies.remove('email')
      Cookies.remove('user_id')
      Cookies.remove('username')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default api
