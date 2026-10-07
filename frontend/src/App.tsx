import { useEffect, useState } from 'react'
import './App.css'

function App() {
  const [message, setMessage] = useState('Loading...')

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/api/health`)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`API returned ${response.status}`)
        }

        return response.json()
      })
      .then((data) => setMessage(data.message))
      .catch(() => setMessage('Cannot connect to API'))
  }, [])

  return (
    <main>
      <h1>{message}</h1>
    </main>
  )
}

export default App
