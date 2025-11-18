import React, {useState} from 'react'
import { useNavigate } from 'react-router-dom'
import { API_BASE } from '../config'

export default function Register(){
  const [name,setName] = useState('')
  const [email,setEmail] = useState('')
  const [password,setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)
  const navigate = useNavigate()

  function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return re.test(email)
  }

  function validateForm() {
    if (!name || !email || !password) {
      setError('Please fill in all required fields.')
      return false
    }
    if (!validateEmail(email)) {
      setError('Please enter a valid email address.')
      return false
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters long.')
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
      const res = await fetch(API_BASE + 'auth/register', {
        method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({name,email,password}), credentials: 'include'
      })
      const data = await res.json()
      if(data.message && !data.error){
        setSuccess(true)
        setTimeout(() => {
          navigate('/login')
        }, 1500)
      } else {
        setError(data.error || 'Registration failed')
      }
    }catch(e){ 
      console.error(e)
      setError('Registration failed. Please check your connection and try again.')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="max-w-md mx-auto bg-white p-6 rounded shadow">
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded text-center">
          <p>Registration successful! Redirecting to login...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded shadow">
      <h2 className="text-xl font-semibold mb-4">Register</h2>
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-3 py-2 rounded mb-4 text-sm">
          {error}
        </div>
      )}
      <input 
        className="w-full border p-2 rounded mb-2" 
        placeholder="Name" 
        value={name} 
        onChange={e=>{setName(e.target.value); clearError()}} 
        disabled={loading}
      />
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
        {loading ? 'Registering...' : 'Register'}
      </button>
      <p className="text-sm text-gray-600 mt-4 text-center">
        Already have an account? <a href="/login" className="text-blue-600 hover:underline">Login</a>
      </p>
    </div>
  )
}
