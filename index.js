const express = require('express')
const app = express()
const httpServer = require('http').createServer(app)
const io = require('socket.io')(httpServer)
const uniqid = require('uniqid')

const connectDB = require('./db')
const { closeRoom } = require('./utils/helper')

// connect database
connectDB()

// routes & middleware
app.use(express.json({ extended: false }))
app.use('/api/users', require('./routes/users'))
app.use('/api/auth', require('./routes/auth'))

// player queue
let playerQueue = []
let activeRooms = []

const startGame = () => {
	const player1 = playerQueue.shift()
	const player2 = playerQueue.shift()

	// prevent same account from playing with each other
	if (player1.playerId === player2.playerId) {
		playerQueue.push(player1)
		playerQueue.push(player2)
		return
	}

	const coinFlip = Math.random() > 0.5
	const whitePlayer = coinFlip ? player1 : player2
	const blackPlayer = coinFlip ? player2 : player1

	whitePlayer.color = 'white'
	blackPlayer.color = 'black'

	const roomId = uniqid() // generate random room id
	whitePlayer.join(roomId)
	blackPlayer.join(roomId)

	// add room to active rooms
	activeRooms.push({
		roomId,
		players: [ whitePlayer.playerId, blackPlayer.playerId ],
		white: {
			playerId: whitePlayer.playerId,
			isActive: true
		},
		black: {
			playerId: blackPlayer.playerId,
			isActive: true
		}
	})

	whitePlayer.emit('gameStart', { color: 'white', roomId: roomId, opponent: { id: blackPlayer.id, rematch: false } })
	blackPlayer.emit('gameStart', { color: 'black', roomId: roomId, opponent: { id: whitePlayer.id, rematch: false } })
}

io.on('connection', (socket) => {
	console.log(`Socket ${socket.id} has connected`)
	socket.playerId = socket.handshake.query.playerId // attach playerId to socket

	// check if player is attempting to reconnect to an active room
	const idx = activeRooms.findIndex((room) => room.players.includes(socket.playerId))
	// if room exists:
	if (idx !== -1) {
		const recRoom = activeRooms[idx]
		const myColor = recRoom.white.playerId === socket.playerId ? 'white' : 'black' // check color of player
		socket.color = myColor // attach color to socket
		socket.join(recRoom.roomId) // re-join room
		// return to client
		socket.emit('reconnect', {
			roomId: recRoom.roomId,
			pgn: recRoom.pgn, // to restore game state
			color: myColor,
			opponent: { id: myColor === 'white' ? recRoom.black.playerId : recRoom.white.playerId, rematch: false }
		})
		activeRooms[idx][myColor].isActive = true // reset isActive to true
	}

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
		// update active room: new game state
		const roomIndex = activeRooms.findIndex((room) => room.roomId == data.roomId)
		activeRooms[roomIndex].pgn = data.pgn // keeps track of state of the game

		socket.to(data.roomId).emit('move', { from: data.move.from, to: data.move.to, promotion: 'q' })
	})

	socket.on('gameEnd', (data) => {
		// update active room: swap players' color
		const roomIndex = activeRooms.findIndex((room) => room.roomId == data.roomId)
		const temp = activeRooms[roomIndex].white.playerId
		activeRooms[roomIndex].white.playerId = activeRooms[roomIndex].black.playerId
		activeRooms[roomIndex].black.playerId = temp
		// set pgn to empty state
		activeRooms[roomIndex].pgn = ''

		// update color on socket object
		socket.color = socket.color === 'white' ? 'black' : 'white'

		socket
			.to(data.roomId)
			.emit('gameEnd', { ...data, move: { from: data.move.from, to: data.move.to, promotion: 'q' } })
	})

	socket.on('rematch', (data) => {
		socket.to(data.roomId).emit('rematch', { ...data.opponent })
	})

	socket.on('leaveRoom', (data) => {
		socket.to(data.roomId).emit('playerDisconnect', 'Opponent has disconnected')
	})

	socket.on('disconnecting', () => {
		socket.rooms.forEach((room) => {
			// check if user is in an active room
			const roomIndex = activeRooms.findIndex((r) => r.roomId == room)
			if (roomIndex !== -1) {
				// if user is guest or other player is inactive, leave/close room
				const oppColor = socket.color === 'white' ? 'black' : 'white'
				if (!activeRooms[roomIndex][oppColor].isActive) {
					closeRoom(room, activeRooms)
				} else {
					// if not guest, update active room: set isActive to false
					activeRooms[roomIndex][socket.color].isActive = false
				}
			}
			console.log(activeRooms)
			socket.to(room).emit('playerDisconnect', 'Opponent has disconnected')
		})
	})

	socket.on('disconnect', () => {
		playerQueue = playerQueue.filter((s) => socket.id !== s.id)
		console.log(`Socket ${socket.id} has disconnected`)
	})
})

httpServer.listen(5000, () => {
	console.log('listening on port 5000')
})
