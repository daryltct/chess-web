const uniqid = require('uniqid')

const User = require('../models/User')

const attemptReconnect = (socket, activeRooms) => {
	// check if player is in any active room
	const roomIndex = activeRooms.findIndex((room) => {
		const playerColor = room.white.playerId === socket.playerId ? 'white' : 'black'
		return room.players.includes(socket.playerId) && !room[playerColor].isActive
	})
	if (roomIndex === -1) return // no active room

	const recRoom = activeRooms[roomIndex]
	const myColor = recRoom.white.playerId === socket.playerId ? 'white' : 'black' // check color of player
	socket.color = myColor // attach color to socket
	socket.join(recRoom.roomId) // re-join room

	socket.emit('reconnect', {
		roomId: recRoom.roomId,
		pgn: recRoom.pgn, // to restore game state
		color: myColor,
		opponent: { id: myColor === 'white' ? recRoom.black.playerId : recRoom.white.playerId, rematch: false }
	})
	socket.to(recRoom.roomId).emit('playerReconnect')
	activeRooms[roomIndex][myColor].isActive = true // reset isActive to true
}

const startGame = (playerQueue, activeRooms) => {
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
		},
		pgn: ''
	})

	whitePlayer.emit('gameStart', { color: 'white', roomId: roomId, opponent: { id: blackPlayer.id, rematch: false } })
	blackPlayer.emit('gameStart', { color: 'black', roomId: roomId, opponent: { id: whitePlayer.id, rematch: false } })
}

const swapColor = (roomId, activeRooms) => {
	const roomIndex = activeRooms.findIndex((room) => room.roomId == roomId)

	const temp = activeRooms[roomIndex].white.playerId
	activeRooms[roomIndex].white.playerId = activeRooms[roomIndex].black.playerId
	activeRooms[roomIndex].black.playerId = temp

	// set pgn to empty state
	activeRooms[roomIndex].pgn = ''
}

const closeRoom = (roomId, roomsArr) => {
	const idx = roomsArr.findIndex((room) => room.roomId == roomId)
	roomsArr.splice(idx, 1)
}

const disconnectProcess = (socket, activeRooms) => {
	// iterate through every room that socket is in
	socket.rooms.forEach((room) => {
		// check if room is active
		const roomIndex = activeRooms.findIndex((r) => r.roomId == room)
		if (roomIndex !== -1) {
			// if user is guest or other player is inactive, leave/close room
			const oppColor = socket.color === 'white' ? 'black' : 'white'
			if (socket.playerId.substring(0, 5) === 'guest' || !activeRooms[roomIndex][oppColor].isActive) {
				closeRoom(room, activeRooms)
				socket.to(room).emit('playerLeave', 'Opponent has left the room')
			} else {
				// if not guest, update active room: set isActive to false
				activeRooms[roomIndex][socket.color].isActive = false
				socket.to(room).emit('playerDisconnect', 'Opponent has disconnected')
			}
		}
	})
}

// update/increment number of games/wins/loss of user on database depending on scenario
// scenario can be any of the 3: 'win', 'loss', 'draw'
const updateUserGames = async (userId, scenario) => {
	if (userId.substring(0, 5) === 'guest') return

	try {
		switch (scenario) {
			case 'win':
				return await User.findByIdAndUpdate(userId, { $inc: { 'games.total': 1, 'games.wins': 1 } })
			case 'loss':
				return await User.findByIdAndUpdate(userId, { $inc: { 'games.total': 1, 'games.loss': 1 } })
			case 'draw':
				return await User.findByIdAndUpdate(userId, { $inc: { 'games.total': 1 } })
			default:
				return
		}
	} catch (e) {
		console.error(e)
	}
}

// upon game end, determine winner/loser and update stats accordingly
const updateStatsOnGameEnd = (data, activeRooms) => {
	const { roomId, winner, reason } = data

	const roomIndex = activeRooms.findIndex((room) => room.roomId == roomId)
	if (roomIndex === -1) return

	const roomObj = activeRooms[roomIndex]
	if (reason === 'draw') {
		updateUserGames(roomObj.white.playerId, 'draw')
		updateUserGames(roomObj.black.playerId, 'draw')
	} else if (reason === 'checkmate' || reason === 'stalemate') {
		const loser = winner === 'white' ? 'black' : 'white'
		updateUserGames(roomObj[winner].playerId, 'win')
		updateUserGames(roomObj[loser].playerId, 'loss')
	}
}

module.exports = { attemptReconnect, startGame, swapColor, closeRoom, disconnectProcess, updateStatsOnGameEnd }
