import React, {useEffect, useState} from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { API_BASE } from '../config'
import { getAuthHeaders, clearAuth } from '../utils/auth'

export default function AdminDashboard(){
  const [books, setBooks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [deleting, setDeleting] = useState(null)
  const navigate = useNavigate()

  const load = async () => {
    try{
      setLoading(true)
      setError(null)
      const res = await fetch(API_BASE + 'books', { headers: getAuthHeaders(), credentials: 'include' })
      const data = await res.json()
      if (Array.isArray(data)) {
        setBooks(data)
      } else if (data.error) {
        setError(data.error)
      }
    }catch(e){ 
      console.error(e)
      setError('Failed to load books. Please try again later.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  async function del(id){
    if(!confirm('Delete this book?')) return
    try{
      setDeleting(id)
      const res = await fetch(API_BASE + 'books/' + id, { method: 'DELETE', headers: getAuthHeaders(), credentials: 'include' })
      if(res.status === 401 || res.status === 400){
        clearAuth()
        alert('Session expired. Please login again.')
        navigate('/login')
        return
      }
      const data = await res.json()
      if(data.message || !data.error) {
        setBooks(books.filter(b=>b._id!==id))
        alert('Book deleted successfully')
      } else alert(data.error || 'Failed')
    }catch(e){ 
      console.error(e)
      alert('Failed to delete book')
    } finally {
      setDeleting(null)
    }
  }

  if (loading) return <div className="text-center py-8">Loading books...</div>

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
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Admin Dashboard</h1>
        <Link to="/admin/add" className="bg-blue-600 text-white px-3 py-2 rounded hover:bg-blue-700">Add Book</Link>
      </div>
      {books.length === 0 ? (
        <p className="text-gray-500">No books available.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {books.map(b=> (
            <div key={b._id} className="bg-white p-4 rounded shadow">
              <div className="font-semibold">{b.title}</div>
              <div className="text-sm text-gray-600">{b.author}</div>
              <div className="mt-2 flex space-x-2">
                <button 
                  className="text-red-600 hover:text-red-800 disabled:text-red-400" 
                  onClick={()=>del(b._id)}
                  disabled={deleting === b._id}
                >
                  {deleting === b._id ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
