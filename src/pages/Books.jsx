import React, {useEffect, useState} from 'react'
import BookCard from '../components/BookCard'
import { API_BASE } from '../config'

export default function Books(){
  const [books, setBooks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const load = async () => {
    try{
      setLoading(true)
      setError(null)
      const res = await fetch(API_BASE + 'books')
      const data = await res.json()
      if (Array.isArray(data)) {
        setBooks(data)
      } else if (data.error) {
        setError(data.error)
      } else {
        setError('Invalid response format')
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
        <h1 className="text-2xl font-semibold">All Books</h1>
      </div>
      {books.length === 0 ? (
        <p className="text-gray-500">No books available yet.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {books.map(b=> <BookCard key={b._id} book={b} />)}
        </div>
      )}
    </div>
  )
}
