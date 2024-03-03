import React, { useState } from 'react'
import TodoForm from './TodoForm'

export default function App() {
  const [todos, setTodos] = useState([])

  const handleAddTodo = (text) => {
    if (text.trim() !== '') {
      setTodos([...todos, { id: Date.now(), text }])
    }
  }

  const handleDeleteTodo = (id) => {
    setTodos(todos.filter((todo) => todo.id !== id))
  }

  return (
    <div className="flex flex-col items-center h-screen bg-gray-100">
      <h1 className="text-3xl font-bold mt-10 mb-5">Todo List</h1>
      <TodoForm onAddTodo={handleAddTodo} />
      {todos.length > 0 ? (
        <ul className="w-full max-w-md">
          {todos.map((todo) => (
            <li
              key={todo.id}
              className="flex justify-between items-center py-2 px-4 bg-white rounded-md shadow-md mb-2"
            >
              <span className="text-lg">{todo.text}</span>
              <button
                className="text-red-500 hover:text-red-600"
                onClick={() => handleDeleteTodo(todo.id)}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className="w-6 h-6"
                >
                  <path
                    fillRule="evenodd"
                    d="M3.707 5.293a1 1 0 011.414 0L10 10.586l4.293-4.293a1 1 0 111.414 1.414L11.414 12l4.293 4.293a1 1 0 01-1.414 1.414L10 13.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 12 4.293 7.707a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-lg text-gray-500">No todos yet. Add one above!</p>
      )}
    </div>
  )
}