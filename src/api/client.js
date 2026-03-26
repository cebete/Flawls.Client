import axios from 'axios'

const isLocalhost = window.location.hostname === 'localhost'

const client = axios.create({
  baseURL: isLocalhost
    ? 'http://localhost:5000/api'
    : 'http://192.168.68.55:5000/api',
})

client.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

export default client