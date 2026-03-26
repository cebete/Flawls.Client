import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Products from './pages/Products'
import Scanner from './pages/Scanner'
import Barcodes from './pages/Barcodes'
import Users from './pages/Users'
import Layout from './components/Layout'

function PrivateRoute({ children }) {
  const { auth } = useAuth()
  return auth.token ? children : <Navigate to="/login" />
}

function AdminRoute({ children }) {
  const { auth } = useAuth()
  if (!auth.token) return <Navigate to="/login" />
  if (auth.role !== 'admin') return <Navigate to="/" />
  return children
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
          <Route index element={<Dashboard />} />
          <Route path="products" element={<Products />} />
          <Route path="scanner" element={<Scanner />} />
          <Route path="barcodes" element={<Barcodes />} />
          <Route path="users" element={<AdminRoute><Users /></AdminRoute>} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}