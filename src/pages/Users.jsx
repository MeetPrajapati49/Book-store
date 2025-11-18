import React, {useEffect, useState} from 'react'
import { useNavigate } from 'react-router-dom'
import { API_BASE } from '../config'
import { getAuthHeaders, clearAuth } from '../utils/auth'

export default function Users(){
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  const load = async () => {
    try{
      setLoading(true)
      setError(null)
      const res = await fetch(API_BASE + 'users', { headers: getAuthHeaders(), credentials: 'include' })
      if(res.status === 401 || res.status === 400){
        clearAuth()
        alert('Session expired or insufficient permissions. Please login again.')
        navigate('/login')
        return
      }
      const data = await res.json()
      if (Array.isArray(data)) {
        setUsers(data)
      } else if (data.error) {
        setError(data.error)
      }
    }catch(e){ 
      console.error(e)
      setError('Failed to load members. Please try again later.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  if (loading) return <div className="text-center py-8">Loading members...</div>

  if (error) return (
    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
      <p>{error}</p>
      <button onClick={load} className="mt-2 bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700">
        Retry
      </button>
    </div>
  )

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-4">Members</h1>
      {users.length === 0 ? (
        <p className="text-gray-500">No members found.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {users.map(u=> (
            <div key={u._id} className="bg-white p-4 rounded shadow">
              <div className="font-semibold">{u.name}</div>
              <div className="text-sm text-gray-600">{u.email}</div>
              <div className="text-xs text-gray-500">{u.role}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
