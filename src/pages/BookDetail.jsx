import React, { useEffect, useState, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { API_BASE } from '../config';
import { getAuthHeaders, clearAuth } from '../utils/auth';
import { CartContext } from '../context/CartContext.jsx';

function resolveImageSrc(cover) {
  if (!cover) return '/placeholder.svg';
  if (cover.startsWith('/api/')) {
    const backendRoot = API_BASE.replace(/\/api\/?$/, '');
    return backendRoot + cover;
  }
  return cover;
}

export default function BookDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useContext(CartContext);

  const [book, setBook] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [comment, setComment] = useState('');
  const [rating, setRating] = useState(5);
  const [loadingBook, setLoadingBook] = useState(true);
  const [loadingReviews, setLoadingReviews] = useState(true);
  const [bookError, setBookError] = useState(null);
  const [reviewsError, setReviewsError] = useState(null);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState(false);

  // Load book & reviews
  useEffect(() => {
    async function load() {
      // Load book
      try {
        const res = await fetch(API_BASE + 'books/' + id);
        if (res.status === 404) setBookError('Book not found');
        else {
          const data = await res.json();
          if (data.error) setBookError(data.error);
          else setBook(data);
        }
      } catch (e) {
        console.error(e);
        setBookError('Failed to load book details. Please try again.');
      } finally {
        setLoadingBook(false);
      }

      // Load reviews
      try {
        const rr = await fetch(API_BASE + 'reviews/' + id);
        const rdata = await rr.json();
        if (Array.isArray(rdata)) setReviews(rdata);
        else if (rdata.error) setReviewsError(rdata.error);
      } catch (e) {
        console.error(e);
        setReviewsError('Failed to load reviews.');
      } finally {
        setLoadingReviews(false);
      }
    }
    load();
  }, [id]);

  async function submitReview() {
    try {
      setSubmittingReview(true);
      const res = await fetch(API_BASE + 'reviews', {
        method: 'POST',
        headers: getAuthHeaders(),
        credentials: 'include',
        body: JSON.stringify({ book: id, rating, comment }),
      });

      if (res.status === 401 || res.status === 400) {
        clearAuth();
        alert('Please login to submit reviews.');
        navigate('/login');
        return;
      }

      const data = await res.json();
      if (!data.error) {
        setComment('');
        setRating(5);
        setReviewSuccess(true);
        setTimeout(() => setReviewSuccess(false), 2000);

        // Reload reviews
        try {
          const rr = await fetch(API_BASE + 'reviews/' + id);
          const rdata = await rr.json();
          if (Array.isArray(rdata)) setReviews(rdata);
        } catch (e) {
          console.error(e);
        }
      } else alert(data.error || 'Failed to submit review.');
    } catch (e) {
      console.error(e);
    } finally {
      setSubmittingReview(false);
    }
  }

  if (loadingBook) return <div className="text-center py-8">Loading book details...</div>;

  if (bookError)
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        <p>{bookError}</p>
        <button
          onClick={() => navigate('/')}
          className="mt-2 bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
        >
          Go Back
        </button>
      </div>
    );

  if (!book) return <div>Book not found</div>;

  return (
    <div className="grid md:grid-cols-3 gap-6">
      {/* Book Info */}
      <div className="md:col-span-2 bg-white p-6 rounded shadow">
        <div className="mb-4 flex items-start">
          <img
            src={resolveImageSrc(book.cover)}
            alt={book.title}
            className="w-40 h-56 object-cover rounded mr-4"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = '/placeholder.svg';
            }}
          />
          <div>
            <h2 className="text-2xl font-bold">{book.title}</h2>
            <p className="text-gray-600">by {book.author}</p>
            <p className="mt-1 font-semibold">
              Price: {book.price || book.Price ? `${book.price || book.Price} ₹` : 'N/A'}
            </p>
            <button
              onClick={() => addToCart(book, 1)}
              className="mt-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Add to Cart
            </button>
          </div>
        </div>
        <p className="mt-4">{book.description}</p>
      </div>

      {/* Reviews */}
      <aside className="bg-white p-6 rounded shadow">
        <h3 className="font-semibold">Reviews</h3>
        {reviewsError && (
          <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-3 py-2 rounded text-sm mb-3">
            {reviewsError}
          </div>
        )}
        {loadingReviews ? (
          <p className="text-gray-500 mt-2">Loading reviews...</p>
        ) : reviews.length === 0 ? (
          <p className="text-gray-500 mt-2">No reviews yet</p>
        ) : (
          <ul className="space-y-3 mt-3">
            {reviews.map((r) => (
              <li key={r._id} className="border p-3 rounded">
                <div className="font-semibold">{r.user.name}</div>
                <div className="text-sm text-gray-600">{r.comment}</div>
                <div className="text-xs text-gray-500">Rating: {r.rating}/5</div>
              </li>
            ))}
          </ul>
        )}

        {/* Add Review */}
        <div className="mt-4">
          <h4 className="font-semibold">Add Review</h4>
          {reviewSuccess && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-3 py-2 rounded text-sm mb-2">
              Review submitted successfully!
            </div>
          )}
          <textarea
            className="w-full border p-2 rounded mt-2"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            disabled={submittingReview}
            placeholder="Write your review..."
          />
          <div className="mt-2 flex items-center">
            <label className="mr-2">Rating:</label>
            <select
              value={rating}
              onChange={(e) => setRating(parseInt(e.target.value, 10))}
              className="border p-1 rounded"
              disabled={submittingReview}
            >
              <option value={5}>5</option>
              <option value={4}>4</option>
              <option value={3}>3</option>
              <option value={2}>2</option>
              <option value={1}>1</option>
            </select>
          </div>
          <button
            className="mt-3 bg-blue-600 text-white px-4 py-2 rounded disabled:bg-blue-400"
            onClick={submitReview}
            disabled={submittingReview}
          >
            {submittingReview ? 'Submitting...' : 'Submit'}
          </button>
        </div>
      </aside>
    </div>
  );
}
