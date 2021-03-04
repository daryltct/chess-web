import './App.css';
import React, { useState, useEffect } from 'react'
import io from 'socket.io-client'

// import WithMoveValidation from './components/Chess'
import Game from './components/Game'

const PORT = '/'

const App = () => {
  const [socket, setSocket] = useState(null)

  useEffect(() => {
    setSocket(io(PORT))
  }, [])


  return (
    <div>
      <Game socket={socket}/>
    </div>
  )
}

export default App;
