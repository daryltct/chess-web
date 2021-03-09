const express = require('express')
const app = express()
const httpServer = require('http').createServer(app)
const io = require('socket.io')(httpServer)

const connectDB = require('./db')
const { attemptReconnect, startGame, swapColor, disconnectProcess, closeRoom } = require('./utils/helper')

// connect database
connectDB()

// routes & middleware
app.use(express.json({ extended: false }))
app.use('/api/users', require('./routes/users'))
app.use('/api/auth', require('./routes/auth'))

// player queue
let playerQueue = []
let activeRooms = []

io.on('connection', (socket) => {
	console.log(`Socket ${socket.id} has connected`)
	socket.playerId = socket.handshake.query.playerId // attach playerId to socket
	// if not guest, attempt to reconnect
	if (socket.playerId.substring(0, 5) !== 'guest') {
		attemptReconnect(socket, activeRooms)
	}

	socket.on('findGame', (signal) => {
		if (signal) {
			playerQueue.push(socket)
		} else {
			// remove user from player queue
			const playerIndex = playerQueue.findIndex((s) => s.id === socket.id)
			if (playerIndex !== -1) playerQueue.splice(playerIndex, 1)
		}

		if (playerQueue.length >= 2) {
			startGame(playerQueue, activeRooms)
		}
		console.log(playerQueue.length)
		playerQueue.map((soc) => console.log(soc.playerId))
	})

	socket.on('move', (data) => {
		// update active room: new game state
		const roomIndex = activeRooms.findIndex((room) => room.roomId == data.roomId)
		activeRooms[roomIndex].pgn = data.pgn // keeps track of state of the game

		console.log(activeRooms)
		socket.to(data.roomId).emit('move', { from: data.move.from, to: data.move.to, promotion: 'q' })
	})

	socket.on('gameEnd', (data) => {
		swapColor(data.roomId, activeRooms)

		socket
			.to(data.roomId)
			.emit('gameEnd', { ...data, move: { from: data.move.from, to: data.move.to, promotion: 'q' } })
	})

	socket.on('rematch', (data) => {
		// update color on socket object
		socket.color = socket.color === 'white' ? 'black' : 'white'

		socket.to(data.roomId).emit('rematch', { ...data.opponent })
	})

	socket.on('playerLeave', (data) => {
		closeRoom(data.roomId, activeRooms)
		socket.to(data.roomId).emit('playerLeave', 'Opponent has disconnected')
	})

	socket.on('disconnecting', () => {
		disconnectProcess(socket, activeRooms)
	})

	socket.on('disconnect', () => {
		// remove user from player queue
		const playerIndex = playerQueue.findIndex((s) => s.id === socket.id)
		if (playerIndex !== -1) playerQueue.splice(playerIndex, 1)

		console.log(`Socket ${socket.id} has disconnected`)
	})
})

httpServer.listen(5000, () => {
	console.log('listening on port 5000')
})
