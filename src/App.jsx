import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import Books from './pages/Books'
import BookDetail from './pages/BookDetail'
import Reviews from './pages/Reviews'
import Users from './pages/Users'
import Login from './pages/Login'
import Register from './pages/Register'
import AdminDashboard from './pages/AdminDashboard'
import AddBook from './pages/AddBook'
import Cart from './pages/Cart'

// ✅ Import CartProvider
import { CartProvider } from './context/CartContext.jsx'

function ProtectedRoute({ children, requireAdmin = false }) {
  const userData = localStorage.getItem('user')
  let user = null

  try {
    if (userData) user = JSON.parse(userData)
  } catch (e) {
    console.error('Failed to parse user data:', e)
  }

  if (!user) return <Navigate to="/login" replace />
  if (requireAdmin && user.role !== 'admin') return <Navigate to="/" replace />

  return children
}

export default function App() {
  return (
    <CartProvider>
      <div className="min-h-screen bg-gray-50 text-gray-800">
        <Navbar />
        <main className="container py-8">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/books" element={<Books />} />
            <Route path="/books/:id" element={<BookDetail />} />
            <Route path="/reviews" element={<Reviews />} />
            <Route path="/users" element={<ProtectedRoute requireAdmin={true}><Users /></ProtectedRoute>} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/admin" element={<ProtectedRoute requireAdmin={true}><AdminDashboard /></ProtectedRoute>} />
            <Route path="/admin/add" element={<ProtectedRoute requireAdmin={true}><AddBook /></ProtectedRoute>} />
            <Route path="/cart" element={<Cart />} /> {/* Cart route */}
          </Routes>
        </main>
        <footer className="bg-white mt-12 border-t py-6">
          <div className="container text-center text-sm text-gray-500">
            © {new Date().getFullYear()} Book Store
          </div>
        </footer>
      </div>
    </CartProvider>
  )
}
