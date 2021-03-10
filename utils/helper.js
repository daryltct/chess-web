const uniqid = require('uniqid')

const User = require('../models/User')
const Room = require('../models/Room')

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

const startGame = async (playerQueue, activeRooms) => {
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

	try {
		// retrieve both players' elo rating
		// if one user is guest, match the guest's elo to the user
		let whitePlayerElo = (blackPlayerElo = 1000)
		if (whitePlayer.isGuest && !blackPlayer.isGuest) {
			const blackPlayerDetails = await User.findById(blackPlayer.playerId)
			whitePlayerElo = blackPlayerElo = blackPlayerDetails.games.elo
		} else if (!whitePlayer.isGuest && blackPlayer.isGuest) {
			const whitePlayerDetails = await User.findById(whitePlayer.playerId)
			whitePlayerElo = blackPlayerElo = whitePlayerDetails.games.elo
		} else if (!whitePlayer.isGuest && !blackPlayer.isGuest) {
			const whitePlayerDetails = await User.findById(whitePlayer.playerId)
			const blackPlayerDetails = await User.findById(blackPlayer.playerId)
			whitePlayerElo = whitePlayerDetails.games.elo
			blackPlayerElo = blackPlayerDetails.games.elo
		}

		// create room and add to database
		let room = new Room({
			players: [ whitePlayer.playerId, blackPlayer.playerId ],
			white: {
				playerId: whitePlayer.playerId,
				playerName: whitePlayer.playerName,
				isActive: true,
				elo: whitePlayerElo
			},
			black: {
				playerId: blackPlayer.playerId,
				playerName: blackPlayer.playerName,
				isActive: true,
				elo: blackPlayerElo
			}
		})
		await room.save()

		// add both players to same socket room
		whitePlayer.join(room.id)
		blackPlayer.join(room.id)

		whitePlayer.emit('gameStart', {
			color: 'white',
			roomId: room.id,
			opponent: { id: blackPlayer.playerId, name: blackPlayer.playerName, rematch: false }
		})
		blackPlayer.emit('gameStart', {
			color: 'black',
			roomId: room.id,
			opponent: { id: whitePlayer.playerId, name: whitePlayer.playerName, rematch: false }
		})
	} catch (e) {
		console.error(e)
	}
}

const swapColor = async (roomId, activeRooms) => {
	try {
		const room = await Room.findById(roomId)

		// swap user's color and reset game state
		await Room.findByIdAndUpdate(roomId, { $set: { white: room.black, black: room.white, pgn: '' } })
	} catch (e) {
		console.error(e)
	}
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
const updateStatsOnGameEnd = async (data, activeRooms) => {
	const { roomId, winner, reason } = data

	try {
		// update room in database
		const room = await Room.findByIdAndUpdate(data.roomId, { $set: { inProgress: false } }, { new: true })

		// update user stats based on winning condition
		if (reason === 'draw') {
			updateUserGames(room.white.playerId, 'draw')
			updateUserGames(room.black.playerId, 'draw')
		} else if (reason === 'checkmate' || reason === 'stalemate') {
			const loser = winner === 'white' ? 'black' : 'white'
			updateUserGames(room[winner].playerId, 'win')
			updateUserGames(room[loser].playerId, 'loss')
		}
	} catch (e) {
		console.error(e)
	}
}

module.exports = {
	attemptReconnect,
	startGame,
	swapColor,
	closeRoom,
	disconnectProcess,
	updateUserGames,
	updateStatsOnGameEnd
}
