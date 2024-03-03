import React, { useState } from 'react'
import { FaPlus, FaTrash, FaSun, FaMoon } from 'react-icons/fa'

export default function App() {
  const [todos, setTodos] = useState([])
  const [inputValue, setInputValue] = useState('')
  const [darkMode, setDarkMode] = useState(false)

  const handleAddTodo = () => {
    if (inputValue) {
      setTodos([...todos, { id: Date.now(), text: inputValue }])
      setInputValue('')
    }
  }

  const handleDeleteTodo = (id) => {
    setTodos(todos.filter((todo) => todo.id !== id))
  }

  const handleDarkMode = () => {
    setDarkMode(!darkMode)
  }

  return (
    <div className={`flex flex-col items-center h-screen ${darkMode ? 'bg-gray-800 text-white' : 'bg-gray-200 text-gray-800'}`}>
      <h1 className="text-3xl font-semibold my-8">Todo List</h1>
      <div className={`w-full max-w-md flex flex-col bg-white rounded-lg shadow-lg overflow-hidden ${darkMode ? 'text-white' : ''}`}>
        <div className={`flex items-center ${darkMode ? 'bg-gray-700' : 'bg-gray-100'} px-4 py-2`}>
          <input
            type="text"
            className={`w-full px-2 py-1 mr-2 rounded ${darkMode ? 'bg-gray-700 text-white' : ''}`}
            placeholder="Add a new todo"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
          />
          <button
            className={`rounded-lg px-2 py-1 ${darkMode ? 'bg-gray-500' : 'bg-blue-500 text-white'}`}
            onClick={handleAddTodo}
          >
            <FaPlus />
          </button>
        </div>
        <ul className="divide-y divide-gray-200">
          {todos.map((todo) => (
            <li key={todo.id} className={`flex items-center justify-between px-4 py-2 ${darkMode ? 'bg-gray-700' : ''}`}>
              <span className={`${darkMode ? 'text-white' : ''}`}>{todo.text}</span>
              <button
                className={`text-red-500 ${darkMode ? 'text-red-200' : ''}`}
                onClick={() => handleDeleteTodo(todo.id)}
              >
                <FaTrash />
              </button>
            </li>
          ))}
        </ul>
      </div>
      <div className="flex items-center mt-4">
        <button
          className={`rounded-lg px-2 py-1 ${darkMode ? 'bg-gray-500' : 'bg-blue-500 text-white'}`}
          onClick={handleDarkMode}
        >
          {darkMode ? <FaSun /> : <FaMoon />}
        </button>
      </div>
    </div>
  )
}