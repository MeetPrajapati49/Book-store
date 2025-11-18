import React, { useState, useEffect, useContext } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { clearAuth } from '../utils/auth'
import { CartContext } from '../context/CartContext'

export default function Navbar(){
  const [user, setUser] = useState(null)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()

  const { cart } = useContext(CartContext)
  const cartCount = cart.reduce((sum, item) => sum + item.qty, 0)

  function syncFromStorage() {
    const userData = localStorage.getItem('user')
    if (userData) {
      try {
        const parsedUser = JSON.parse(userData)
        setUser(parsedUser)
        setIsLoggedIn(true)
      } catch (e) {
        console.error('Failed to parse user data:', e)
        setUser(null)
        setIsLoggedIn(false)
      }
    } else {
      setUser(null)
      setIsLoggedIn(false)
    }
  }

  useEffect(() => {
    syncFromStorage()
  }, [location])

  useEffect(() => {
    syncFromStorage()
    
    function handleStorageChange() {
      syncFromStorage()
    }
    
    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [])

  function handleLogout() {
    clearAuth()
    setUser(null)
    setIsLoggedIn(false)
    navigate('/login')
  }

  return (
    <header className="bg-white shadow">
      <div className="container flex items-center justify-between py-4">
        <Link to="/" className="font-bold text-xl">Book Club</Link>
        <nav className="space-x-4 flex items-center">
          <Link to="/books" className="hover:underline">Books</Link>
          <Link to="/reviews" className="hover:underline">Reviews</Link>

          {/* Cart link with count */}
          <Link to="/cart" className="hover:underline">
            Cart ({cartCount})
          </Link>

          {user?.role === 'admin' && (
            <>
              <Link to="/users" className="hover:underline">Members</Link>
              <Link to="/admin" className="hover:underline">Admin Dashboard</Link>
              <Link to="/admin/add" className="hover:underline">Add Book</Link>
            </>
          )}

          {!isLoggedIn ? (
            <>
              <Link to="/login" className="hover:underline">Login</Link>
              <Link to="/register" className="hover:underline">Register</Link>
            </>
          ) : (
            <>
              <span className="text-gray-600">Welcome, {user?.name}</span>
              <button onClick={handleLogout} className="text-blue-600 hover:underline cursor-pointer">Logout</button>
            </>
          )}
        </nav>
      </div>
    </header>
  )
}
s