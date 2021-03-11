const express = require('express')
const app = express()
const httpServer = require('http').createServer(app)
const io = require('socket.io')(httpServer)
const EloRank = require('elo-rank')
const elo = new EloRank(32) // k-factor = 32

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

io.on('connection', (socket) => {
	console.log(`Socket ${socket.id} has connected`)
	socket.playerId = socket.handshake.query.playerId // attach playerId to socket
	socket.playerName = socket.handshake.query.playerName // attach playerName to socket

	// if not guest, attempt to reconnect
	if (socket.playerId.substring(0, 5) !== 'guest') {
		socket.isGuest = false
		attemptReconnect(socket)
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
			startGame(playerQueue)
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
		updateStatsOnGameEnd(data)
		swapColor(data.roomId)

		socket
			.to(data.roomId)
			.emit('gameEnd', { ...data, move: { from: data.move.from, to: data.move.to, promotion: 'q' } })
	})

	socket.on('rematch', (data) => {
		// update color on socket object
		socket.color = socket.color === 'white' ? 'black' : 'white'

		socket.to(data.roomId).emit('rematch', { ...data.opponent })
	})

	socket.on('playerLeave', async (data) => {
		const oppColor = socket.color === 'white' ? 'black' : 'white'
		try {
			const room = await Room.findById(data.roomId)
			if (!room || !room.inProgress) return

			// calculate expected score to update elo rating
			const myExpectedScore = elo.getExpected(room[socket.color].elo, room[oppColor].elo)
			const oppExpectedScore = elo.getExpected(room[oppColor].elo, room[socket.color].elo)

			// if game is in progress
			// if opposing player is: active - player lose, opp win | inactive - player win, opp lose
			if (room[oppColor].isActive) {
				updateUserGames(socket.playerId, 'loss', room[socket.color].elo, myExpectedScore)
				updateUserGames(room[oppColor].playerId, 'win', room[oppColor].elo, oppExpectedScore)
			} else {
				updateUserGames(socket.playerId, 'win', room[socket.color].elo, myExpectedScore)
				updateUserGames(room[oppColor].playerId, 'loss', room[oppColor].elo, oppExpectedScore)
			}
			// close the room
			closeRoom(data.roomId)
			socket.to(data.roomId).emit('playerLeave', 'Opponent has disconnected')
		} catch (e) {
			console.error(e)
		}
	})

	socket.on('disconnecting', () => {
		disconnectProcess(socket)
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
