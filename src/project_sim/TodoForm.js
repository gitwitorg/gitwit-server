import { FaPlus } from 'react-icons/fa'

export default function TodoForm({ darkMode, handleAddTodo }) {
  const [inputValue, setInputValue] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    handleAddTodo(inputValue)
    setInputValue('')
  }

  return (
    <form onSubmit={handleSubmit} className={`w-full max-w-md flex flex-col bg-white rounded-lg shadow-lg overflow-hidden ${darkMode ? 'text-white' : ''} px-4 py-2`}>
      <input
        type="text"
        className={`w-full px-2 py-1 mr-2 rounded ${darkMode ? 'bg-gray-700 text-white' : ''}`}
        placeholder="Add a new todo"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
      />
      <button
        className={`rounded-lg px-2 py-1 ${darkMode ? 'bg-gray-500' : 'bg-blue-500 text-white'}`}
        type="submit"
      >
        <FaPlus />
      </button>
    </form>
  )
}