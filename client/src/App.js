import './App.css';
import React, { useEffect } from 'react'
import io from 'socket.io-client'
//const io = require('socket.io-client')

let socket
const PORT = '/'

const App = () => {

  useEffect(() => {
    socket = io(PORT)

  }, [PORT])

  const connect = () => {
    socket.emit('join', 'pressed')
  }

  return <div className='App'>Chess App <button onClick={connect}>click</button></div>
}

export default App;
