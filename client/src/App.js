import './App.css';
import React, { useState, useEffect } from 'react'
import io from 'socket.io-client'

// import WithMoveValidation from './components/Chess'
import Game from './components/Game'

const PORT = '/'

const App = () => {
  const [socket, setSocket] = useState(null)
  const [roomData, setRoomData] = useState(null);

  useEffect(() => {
    setSocket(io(PORT))
  }, [])

  useEffect(() => {
    if(socket){
        socket.on('gameStart', (data) => {
          setRoomData(data)
            console.log(data)
        })
    }
  })


  return (
    <div>
      {roomData ? <Game socket={socket} roomData={roomData} /> : <button>Find Game</button>}
    </div>
  )
}

export default App;
