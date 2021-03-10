const express = require('express')
const app = express()
const httpServer = require('http').createServer(app)
const io = require('socket.io')(httpServer)

const connectDB = require('./db')
const Room = require('./models/Room')
const {
	attemptReconnect,
	startGame,
	swapColor,
	disconnectProcess,
	closeRoom,
	updateStatsOnGameEnd,
	updateUserGames
} = require('./utils/helper')

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
		socket.isGuest = false
		attemptReconnect(socket, activeRooms)
	} else {
		socket.isGuest = true
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
	})

	socket.on('move', async (data) => {
		try {
			// update room in database with new game state
			await Room.findByIdAndUpdate(data.roomId, { $set: { pgn: data.pgn, inProgress: true } })

			socket.to(data.roomId).emit('move', { from: data.move.from, to: data.move.to, promotion: 'q' })
		} catch (e) {
			console.error(e)
		}
	})

	socket.on('gameEnd', (data) => {
		updateStatsOnGameEnd(data, activeRooms)
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
		const oppColor = socket.color === 'white' ? 'black' : 'white'
		// if game is in progress:
		const roomIndex = activeRooms.findIndex((room) => room.roomId === data.roomId)
		const roomObj = activeRooms[roomIndex]
		if (activeRooms[roomIndex].inProgress && roomIndex !== -1) {
			// if opposing player is: active - player lose, opp win | inactive - player win, opp lose
			if (roomObj[oppColor].isActive) {
				updateUserGames(socket.playerId, 'loss')
				updateUserGames(roomObj[oppColor].playerId, 'win')
			} else {
				updateUserGames(socket.playerId, 'win')
				updateUserGames(roomObj[oppColor].playerId, 'loss')
			}
		}

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
