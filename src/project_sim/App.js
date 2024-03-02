import { FaPlus, FaTrash, FaSun, FaMoon } from 'react-icons/fa'
import TodoForm from './TodoForm'

export default function App() {
  const [todos, setTodos] = useState([])
  const [darkMode, setDarkMode] = useState(false)

  const handleAddTodo = (text) => {
    if (text) {
      setTodos([...todos, { id: Date.now(), text }])
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
      <TodoForm darkMode={darkMode} handleAddTodo={handleAddTodo} />
      <ul className="divide-y divide-gray-200 w-full max-w-md flex flex-col bg-white rounded-lg shadow-lg overflow-hidden">
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