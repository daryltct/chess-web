const app = require('express')()
const httpServer = require('http').createServer(app)
const io = require('socket.io')(httpServer)
const uniqid = require('uniqid')

// player queue
let playerQueue = []

const startGame = () => {
    const player1 = playerQueue.shift()
    const player2 = playerQueue.shift()

    const coinFlip = Math.random() > 0.5
    const whitePlayer = coinFlip ? player1 : player2
    const blackPlayer = coinFlip ? player2 : player1

    whitePlayer.color = 'w'
    blackPlayer.color = 'b'

    const roomId = uniqid() // generate random room id

    whitePlayer.emit('gameStart', {color: 'w'})
    blackPlayer.emit('gameStart', {color: 'b'})
}

io.on('connection', (socket) => {
    playerQueue.push(socket)
    console.log(`Socket ${socket.id} has connected | Length of queue: ${playerQueue.length}`)
    if (playerQueue.length >= 2) {
        startGame()
    }

    socket.on('join', (data) => {
        socket.join(data)
        console.log('user joined room' + data)
    })

    socket.on('move', (data) => {
        socket.broadcast.emit('move', {from: data.from, to: data.to, promotion: 'q'})
    })

    socket.on('disconnect', () => {
        playerQueue = playerQueue.filter((s) => socket.id !== s.id)
        console.log(`Socket ${socket.id} has disconnected | Length of queue: ${playerQueue.length}`)
    })
})

httpServer.listen(5000, () => {
    console.log('listening on port 5000')
})
