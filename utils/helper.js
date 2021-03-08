const uniqid = require('uniqid')

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
		}
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
			if (!activeRooms[roomIndex][oppColor].isActive) {
				closeRoom(room, activeRooms)
			} else {
				// if not guest, update active room: set isActive to false
				activeRooms[roomIndex][socket.color].isActive = false
			}
		}

		socket.to(room).emit('playerDisconnect', 'Opponent has disconnected')
	})
}

module.exports = { attemptReconnect, startGame, swapColor, closeRoom, disconnectProcess }
