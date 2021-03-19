const express = require('express')
const app = express()
const httpServer = require('http').createServer(app)
const io = require('socket.io')(httpServer)
const EloRank = require('elo-rank')
const elo = new EloRank(32) // k-factor = 32
const path = require('path')

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

// serve static assets in production
if (process.env.NODE_ENV === 'production') {
	// static folder
	app.use(express.static('client/build'))
	app.get('*', (req, res) => res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html')))
}

// player queue
const playerQueue = []
// private games
const hostedRooms = []

io.on('connection', (socket) => {
	console.log(`Socket ${socket.id} has connected`)
	socket.playerId = socket.handshake.query.playerId // attach playerId to socket
	socket.playerName = socket.handshake.query.playerName // attach playerName to socket

	// check if user is a guest
	if (socket.playerId.substring(0, 5) !== 'guest') {
		// if not guest, attempt to reconnect to an active game
		socket.isGuest = false
		attemptReconnect(socket)
	} else {
		socket.isGuest = true
	}

	// user joins/leaves player queue
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

	// user makes a move in chess game
	socket.on('move', async (data) => {
		try {
			// update room in database with new game state
			await Room.findByIdAndUpdate(data.roomId, { $set: { pgn: data.pgn, inProgress: true } })

			socket.to(data.roomId).emit('move', { from: data.move.from, to: data.move.to, promotion: 'q' })
		} catch (e) {
			console.error(e)
		}
	})

	// ongoing game has ended
	socket.on('gameEnd', (data) => {
		updateStatsOnGameEnd(data)
		swapColor(data.roomId)

		socket
			.to(data.roomId)
			.emit('gameEnd', { ...data, move: { from: data.move.from, to: data.move.to, promotion: 'q' } })
	})

	// user initiating/accepting/declining a rematch request
	socket.on('rematch', (data) => {
		// update color on socket object
		socket.color = socket.color === 'white' ? 'black' : 'white'

		socket.to(data.roomId).emit('rematch', { ...data.opponent })
	})

	// user has left game/room
	socket.on('playerLeave', async (data) => {
		const oppColor = socket.color === 'white' ? 'black' : 'white'
		try {
			const room = await Room.findById(data.roomId)
			if (!room) return

			// if game has ended or if it's a private game or void game is true - don't update stats
			if (!room.inProgress || room.isPrivate || data.voidRoom) {
				socket.to(data.roomId).emit('playerLeave', 'Opponent has left')
				closeRoom(data.roomId)
				return
			}

			// if game is in progress - update stats
			// calculate expected score to update elo rating
			const myExpectedScore = elo.getExpected(room[socket.color].elo, room[oppColor].elo)
			const oppExpectedScore = elo.getExpected(room[oppColor].elo, room[socket.color].elo)

			// if opposing player is active - player lose, opp win
			if (room[oppColor].isActive) {
				updateUserGames(socket.playerId, 'loss', room[socket.color].elo, myExpectedScore)
				updateUserGames(room[oppColor].playerId, 'win', room[oppColor].elo, oppExpectedScore)
			} else {
				// if opposing player is inactive - player win, opp lose
				updateUserGames(socket.playerId, 'win', room[socket.color].elo, myExpectedScore)
				updateUserGames(room[oppColor].playerId, 'loss', room[oppColor].elo, oppExpectedScore)
			}
			// close the room
			closeRoom(data.roomId)
			socket.to(data.roomId).emit('playerLeave', 'Opponent has left')
		} catch (e) {
			console.error(e)
		}
	})

	// user sent a message in game
	socket.on('message', (data) => {
		socket.to(data.roomId).emit('message', data.message)
	})

	// user hosted/closed a private game
	socket.on('hostRoom', (data) => {
		const { roomId, signal } = data
		if (signal) {
			hostedRooms.push({
				roomId,
				player: socket
			})
		} else {
			// remove room from hosted rooms
			const roomIndex = playerQueue.findIndex((r) => r.roomId === roomId)
			if (roomIndex !== -1) hostedRooms.splice(roomIndex, 1)
		}
	})

	// user attempting to join a private game
	socket.on('joinHost', (roomId) => {
		const roomIndex = hostedRooms.findIndex((r) => r.roomId === roomId)
		if (roomIndex === -1) {
			socket.emit('error', 'Room does not exist')
			return
		}

		const roomObj = hostedRooms[roomIndex]
		// prevent same user from joining same room
		if (roomObj.player.playerId === socket.playerId) {
			socket.emit('error', 'Unable to join room hosted by yourself')
		} else {
			startGame(playerQueue, roomObj.player, socket)
			// remove room from hosted rooms
			hostedRooms.splice(roomIndex, 1)
		}
	})

	// user disconnecting
	socket.on('disconnecting', () => {
		disconnectProcess(socket)
	})

	// user disconnected
	socket.on('disconnect', () => {
		// remove user from player queue
		const playerIndex = playerQueue.findIndex((s) => s.id === socket.id)
		if (playerIndex !== -1) playerQueue.splice(playerIndex, 1)

		console.log(`Socket ${socket.id} has disconnected`)
	})
})

httpServer.listen(process.env.PORT || 5000, () => {
	console.log('listening on port 5000')
})
