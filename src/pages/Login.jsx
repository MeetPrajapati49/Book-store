import React, {useState} from 'react'
import { useNavigate } from 'react-router-dom'
import { API_BASE } from '../config'

export default function Login(){
  const [email,setEmail] = useState('')
  const [password,setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  function validateForm() {
    if (!email || !password) {
      setError('Please enter both email and password.')
      return false
    }
    return true
  }

  function clearError() {
    setError(null)
  }

  async function submit(){
    if (!validateForm()) return

    try{
      setLoading(true)
      setError(null)
      // Debug: log request payload
      console.log('Login request payload:', { email, password: password ? '*****' : '' })
      const res = await fetch(API_BASE + 'auth/login', {
        method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({email,password}), credentials: 'include'
      })
      // Debug: log raw response for easier troubleshooting
      console.log('Login response status:', res.status)
      const raw = await res.text()
      console.log('Login response body (raw):', raw)
      let data = {}
      try { data = raw ? JSON.parse(raw) : {} } catch(e) { console.error('Failed to parse login response JSON', e) }
      if(data.token && data.user){
        // store user info and JWT token in localStorage
        localStorage.setItem('user', JSON.stringify(data.user))
        localStorage.setItem('token', data.token)
        if(data.user.role === 'admin') navigate('/admin')
        else navigate('/')
      } else {
        setError(data.error || 'Login failed')
      }
    }catch(e){ 
      console.error(e)
      setError('Login failed. Please check your connection and try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded shadow">
      <h2 className="text-xl font-semibold mb-4">Login</h2>
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-3 py-2 rounded mb-4 text-sm">
          {error}
        </div>
      )}
      <input 
        className="w-full border p-2 rounded mb-2" 
        placeholder="Email" 
        value={email} 
        onChange={e=>{setEmail(e.target.value); clearError()}} 
        disabled={loading}
      />
      <input 
        type="password" 
        className="w-full border p-2 rounded mb-2" 
        placeholder="Password" 
        value={password} 
        onChange={e=>{setPassword(e.target.value); clearError()}} 
        disabled={loading}
      />
      <button 
        className="w-full bg-blue-600 text-white py-2 rounded disabled:bg-blue-400" 
        onClick={submit}
        disabled={loading}
      >
        {loading ? 'Logging in...' : 'Login'}
      </button>
      <p className="text-sm text-gray-600 mt-4 text-center">
        Don't have an account? <a href="/register" className="text-blue-600 hover:underline">Register</a>
      </p>
    </div>
  )
}
