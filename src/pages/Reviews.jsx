import React, { useEffect, useState } from 'react'
import { API_BASE } from '../config'

export default function Reviews() {
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function loadReviews() {
      try {
        setLoading(true)
        setError(null)
        const res = await fetch(`${API_BASE}reviews`) // GET all reviews
        if (!res.ok) {
          throw new Error(`Failed to fetch: ${res.status}`)
        }
        const data = await res.json()
        if (Array.isArray(data)) {
          setReviews(data)
        } else {
          setError('Unexpected response from server.')
        }
      } catch (e) {
        console.error(e)
        setError('Failed to load reviews. Ensure backend endpoint /api/reviews is implemented.')
      } finally {
        setLoading(false)
      }
    }
    loadReviews()
  }, [])

  if (loading) return <div className="text-center py-8">Loading reviews...</div>

  if (error) return (
    <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
      <p className="font-semibold">Error Loading Reviews</p>
      <p className="text-sm mt-1">{error}</p>
    </div>
  )

  if (reviews.length === 0) return <p className="text-gray-500">No reviews available yet.</p>

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-4">All Reviews</h1>
      <div className="space-y-4">
        {reviews.map(r => (
          <div key={r._id} className="bg-white p-4 rounded shadow">
            <div className="font-semibold">
              {r.user?.name || 'Anonymous'} — 
              <span className="text-sm text-gray-500 ml-2">{r.book?.title || 'Unknown Book'}</span>
            </div>
            <div className="text-sm text-gray-600 mt-1">{r.comment}</div>
            <div className="text-xs text-gray-500 mt-1">Rating: {r.rating}/5</div>
          </div>
        ))}
      </div>
    </div>
  )
}
