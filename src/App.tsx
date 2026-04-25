import './App.css'
import { Routes, Route } from 'react-router-dom'
import { BrowserRouter } from 'react-router-dom'
import Homepage from './route/Homepage'

function App() {
  return (
    <BrowserRouter>
      <main className="App"> 
      <h1>Hello World!</h1>
      <header className="App-header">
        <Routes>
          <Route path="/home" element={<Homepage />} />
        </Routes>
      </header>
      </main>
    </BrowserRouter>
  )
}

export default App
