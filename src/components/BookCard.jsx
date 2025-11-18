import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { API_BASE } from "../config";

export default function BookCard({ book }) {
  const [imgSrc, setImgSrc] = useState("/placeholder.svg");

  useEffect(() => {
    if (!book.cover) {
      setImgSrc("/placeholder.svg");
      return;
    }

    const backendRoot = API_BASE.replace(/\/api\/?$/, "");

    let finalSrc = book.cover;

    // If it's external (http, https), leave it
    if (book.cover.startsWith("http")) {
      finalSrc = book.cover;
    }

    // If it's stored as /api/images/filename
    else if (book.cover.startsWith("/api/")) {
      finalSrc = backendRoot + book.cover;
    }

    // If database stored only filename like "17349129301.jpg"
    else {
      finalSrc = backendRoot + "/api/images/" + book.cover;
    }

    setImgSrc(finalSrc);
  }, [book.cover]);

  const handleError = () => {
    console.log("[BookCard] Image failed → placeholder");
    setImgSrc("/placeholder.svg");
  };

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <img
        src={imgSrc}
        alt={book.title}
        className="w-full h-48 object-cover rounded"
        onError={handleError}
      />
      <h3 className="mt-3 font-semibold">{book.title}</h3>
      <p className="text-sm text-gray-600">by {book.author}</p>
      <div className="mt-3 flex justify-between items-center">
        <Link to={`/books/${book._id}`} className="text-sm text-blue-600">
          View
        </Link>
        <div className="text-sm text-gray-500">{book.genre}</div>
      </div>
    </div>
  );
}
