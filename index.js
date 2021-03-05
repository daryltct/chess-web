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

	whitePlayer.color = 'white'
	blackPlayer.color = 'black'

	const roomId = uniqid() // generate random room id
	whitePlayer.join(roomId)
	blackPlayer.join(roomId)
	console.log(roomId)

	whitePlayer.emit('gameStart', { color: 'white', roomId: roomId })
	blackPlayer.emit('gameStart', { color: 'black', roomId: roomId })
}

io.on('connection', (socket) => {
	//playerQueue.push(socket)
	console.log(`Socket ${socket.id} has connected | Length of queue: ${playerQueue.length}`)
	// if (playerQueue.length >= 2) {
	// 	startGame()
	// }

	socket.on('findGame', (signal) => {
		if (signal) {
			playerQueue.push(socket)
		} else {
			playerQueue = playerQueue.filter((s) => socket.id !== s.id)
		}

		if (playerQueue.length >= 2) {
			startGame()
		}
	})

	socket.on('move', (data) => {
		socket.to(data.roomId).emit('move', { from: data.move.from, to: data.move.to, promotion: 'q' })
	})

	socket.on('gameEnd', (data) => {
		socket
			.to(data.roomId)
			.emit('gameEnd', { ...data, move: { from: data.move.from, to: data.move.to, promotion: 'q' } })
	})

	socket.on('rematch', (data) => {
		socket.to(data.roomId).emit('rematch', { ...data })
	})

	socket.on('disconnecting', () => {
		// socket.to(socket.room)
		socket.rooms.forEach((room) => {
			socket.to(room).emit('playerDisconnect', 'Opponent has disconnected')
		})
	})

	socket.on('disconnect', () => {
		playerQueue = playerQueue.filter((s) => socket.id !== s.id)
		console.log(`Socket ${socket.id} has disconnected | Length of queue: ${playerQueue.length}`)
	})
})

httpServer.listen(5000, () => {
	console.log('listening on port 5000')
})
