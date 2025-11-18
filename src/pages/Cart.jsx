import React, { useContext } from 'react'
import { CartContext } from '../context/CartContext.jsx'
import { useNavigate } from 'react-router-dom'

export default function Cart() {
  const { cart, addToCart, removeFromCart, clearCart } = useContext(CartContext)
  const navigate = useNavigate()

  const totalPrice = cart.reduce((sum, item) => sum + item.price * item.qty, 0)

  if (cart.length === 0) {
    return (
      <div className="text-center py-8">
        <h2 className="text-2xl font-semibold mb-4">Your Cart is Empty</h2>
        <p className="text-gray-600 mb-4">Add some books to your cart to see them here.</p>
        <button
          onClick={() => navigate('/books')}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Browse Books
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto py-8">
      <h2 className="text-2xl font-semibold mb-6">Your Cart</h2>
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-gray-100">
            <th className="border px-4 py-2 text-left">Book</th>
            <th className="border px-4 py-2">Price</th>
            <th className="border px-4 py-2">Quantity</th>
            <th className="border px-4 py-2">Subtotal</th>
            <th className="border px-4 py-2">Action</th>
          </tr>
        </thead>
        <tbody>
          {cart.map(item => (
            <tr key={item._id}>
              <td className="border px-4 py-2">{item.title}</td>
              <td className="border px-4 py-2 text-center">{item.price} ₹</td>
              <td className="border px-4 py-2 text-center">
                <button
                  onClick={() => addToCart(item, -1)}
                  className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300 mr-1"
                >
                  -
                </button>
                {item.qty}
                <button
                  onClick={() => addToCart(item, 1)}
                  className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300 ml-1"
                >
                  +
                </button>
              </td>
              <td className="border px-4 py-2 text-center">{item.price * item.qty} ₹</td>
              <td className="border px-4 py-2 text-center">
                <button
                  onClick={() => removeFromCart(item._id)}
                  className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
                >
                  Remove
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="mt-6 flex justify-between items-center">
        <button
          onClick={clearCart}
          className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
        >
          Clear Cart
        </button>

        <div className="text-lg font-semibold">
          Total: {totalPrice} ₹
        </div>

        <button
          onClick={() => alert('Proceeding to checkout...')}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          Checkout
        </button>
      </div>
    </div>
  )
}
