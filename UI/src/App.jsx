import { useState } from 'react'
import Loading from './Components/Loading'

function App() {
  const [isLoading, setIsLoading] = useState(false)
  const [size, setSize] = useState('md')

  return (
    <Loading />
  )
}

export default App
