import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE } from '../config';

export default function AddBook() {
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [genre, setGenre] = useState('');
  const [price, setPrice] = useState('');
  const [cover, setCover] = useState('');
  const [file, setFile] = useState(null);
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  function validateForm() {
    if (!title || !author || !genre || !description || !price) {
      setError('Please fill in all required fields.');
      return false;
    }
    return true;
  }

  function clearError() {
    setError(null);
  }

  // Upload cover image to backend
  async function uploadCoverFile(file) {
    const fd = new FormData();
    fd.append('file', file);

    const res = await fetch(API_BASE + 'upload/book', {
      method: 'POST',
      body: fd
    });

    if (!res.ok) throw new Error('Upload failed');

    const data = await res.json();
    return data.url; // "/uploads/books/xxx.jpg"
  }

  async function submit() {
    if (!validateForm()) return;

    try {
      setSubmitting(true);
      setError(null);

      let coverUrl = cover;

      // Upload file if selected
      if (file) {
        setUploadingCover(true);
        try {
          coverUrl = await uploadCoverFile(file);
        } catch (err) {
          console.error(err);
          setError('Cover upload failed. Please try again.');
          setUploadingCover(false);
          setSubmitting(false);
          return;
        }
        setUploadingCover(false);
      }

      // Get token from localStorage
      const token = localStorage.getItem('token');
      if (!token) {
        setError('You must be logged in as admin to add a book.');
        setSubmitting(false);
        return;
      }

      // Save book in database
      const res = await fetch(API_BASE + 'books', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + token
        },
        body: JSON.stringify({
          title,
          author,
          genre,
          description,
          cover: coverUrl,
          price
        })
      });

      const data = await res.json();

      if (res.status === 401 || res.status === 403) {
        setError('Unauthorized. Please login as admin.');
      } else if (!data.error) {
        alert('Book added successfully!');
        navigate('/admin');
      } else {
        setError(data.error);
      }

    } catch (e) {
      console.error(e);
      setError('Failed to add book. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-xl mx-auto bg-white p-6 rounded shadow">
      <h2 className="text-xl font-semibold mb-4">Add Book</h2>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-3 py-2 rounded mb-4 text-sm">
          {error}
        </div>
      )}

      <input
        className="w-full border p-2 rounded mb-2"
        placeholder="Title *"
        value={title}
        onChange={e => { setTitle(e.target.value); clearError(); }}
        disabled={submitting}
      />

      <input
        className="w-full border p-2 rounded mb-2"
        placeholder="Author *"
        value={author}
        onChange={e => { setAuthor(e.target.value); clearError(); }}
        disabled={submitting}
      />

      <input
        className="w-full border p-2 rounded mb-2"
        placeholder="Genre *"
        value={genre}
        onChange={e => { setGenre(e.target.value); clearError(); }}
        disabled={submitting}
      />

      <input
        className="w-full border p-2 rounded mb-2"
        placeholder="Price *"
        value={price}
        onChange={e => { setPrice(e.target.value); clearError(); }}
        disabled={submitting}
      />

      <input
        className="w-full border p-2 rounded mb-2"
        placeholder="Cover URL (optional)"
        value={cover}
        onChange={e => { setCover(e.target.value); clearError(); }}
        disabled={submitting || uploadingCover}
      />

      <label className="block text-sm text-gray-600 mb-1">Or upload a cover image</label>
      <input
        type="file"
        accept="image/*"
        className="w-full mb-2"
        onChange={e => {
          const f = e.target.files && e.target.files[0];
          if (f) setFile(f);
          clearError();
        }}
        disabled={submitting || uploadingCover}
      />

      <textarea
        className="w-full border p-2 rounded mb-2"
        placeholder="Description *"
        value={description}
        onChange={e => { setDescription(e.target.value); clearError(); }}
        disabled={submitting}
      />

      <p className="text-xs text-gray-500 mb-3">* Required fields</p>

      <button
        className="w-full bg-blue-600 text-white py-2 rounded disabled:bg-blue-400 hover:bg-blue-700"
        onClick={submit}
        disabled={submitting}
      >
        {submitting ? "Adding Book..." : "Add Book"}
      </button>
    </div>
  );
}
