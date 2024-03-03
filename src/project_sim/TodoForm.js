import React, { useState } from 'react'
import { FaPlus } from 'react-icons/fa'

export default function TodoForm({ onAddTodo }) {
  const [inputValue, setInputValue] = useState('')

  const handleInputChange = (e) => {
    setInputValue(e.target.value)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    onAddTodo && onAddTodo(inputValue)
    setInputValue('')
  }

  return (
    <form
      className="flex w-full px-4 py-2 mb-5 bg-white rounded-lg shadow-md"
      onSubmit={handleSubmit}
    >
      <input
        type="text"
        placeholder="Add a new todo"
        className="w-full mr-4 py-2 px-3 rounded-md border border-gray-300"
        value={inputValue}
        onChange={handleInputChange}
      />
      <button
        type="submit"
        className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md"
      >
        <FaPlus />
      </button>
    </form>
  )
}