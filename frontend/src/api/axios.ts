/// <reference types="vite/client" />
import axios, { AxiosInstance, AxiosError } from 'axios'
import toast from 'react-hot-toast'

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api/v1'

const instance: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

instance.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 404) {
      toast.error('Resource not found')
    } else if (error.response?.status === 500) {
      toast.error('Server error. Please try again later.')
    } else if (error.message === 'Network Error') {
      toast.error('Network error. Check your connection.')
    } else if (error.response?.data) {
      const data = error.response.data as Record<string, unknown>
      const message = data.detail || 'An error occurred'
      toast.error(String(message))
    }
    return Promise.reject(error)
  },
)

export default instance
