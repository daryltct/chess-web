const EloRank = require('elo-rank')
const elo = new EloRank(32) // k-factor = 32

const User = require('../models/User')
const Room = require('../models/Room')

const attemptReconnect = async (socket) => {
	try {
		// check if user is in any active rooms
		const room = await Room.findOne({
			$or: [
				{ $and: [ { 'white.playerId': socket.playerId }, { 'white.isActive': false } ] },
				{ $and: [ { 'black.playerId': socket.playerId }, { 'black.isActive': false } ] }
			]
		})

		if (!room) return

		// check player color and attach to socket
		const myColor = room.white.playerId === socket.playerId ? 'white' : 'black'
		socket.color = myColor
		console.log(room.id)
		socket.join(room.id)

		// update room state that user is active
		await Room.findByIdAndUpdate(room.id, { $set: { [myColor + '.isActive']: true } })

		const oppColor = myColor === 'white' ? 'black' : 'white'
		socket.emit('reconnect', {
			roomId: room.id,
			pgn: room.pgn, // to restore game state
			color: myColor,
			opponent: { id: room[oppColor].playerId, name: room[oppColor].playerName, rematch: false }
		})
		socket.to(room.id).emit('playerReconnect')
	} catch (e) {
		console.error(e)
	}
}

const startGame = async (playerQueue) => {
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

const swapColor = async (roomId) => {
	try {
		const room = await Room.findById(roomId)

		// swap user's color and reset game state
		await Room.findByIdAndUpdate(roomId, { $set: { white: room.black, black: room.white, pgn: '' } })
	} catch (e) {
		console.error(e)
	}
}

const closeRoom = async (roomId) => {
	try {
		await Room.findByIdAndDelete(roomId)
	} catch (e) {
		console.error(e)
	}
}

const disconnectProcess = (socket) => {
	// iterate through every room that socket is in
	socket.rooms.forEach(async (room) => {
		if (room == socket.id) return

		try {
			const fetchedRoom = await Room.findById(room)
			if (!fetchedRoom) return

			const oppColor = socket.color === 'white' ? 'black' : 'white'
			// if user is guest or other player is inactive, close room
			if (socket.isGuest || !fetchedRoom[oppColor].isActive) {
				closeRoom(room)
				socket.to(room).emit('playerLeave', 'Opponent has left the room')
			} else {
				// update room state that user is inactive
				await Room.findByIdAndUpdate(room, { $set: { [socket.color + '.isActive']: false } })
				socket.to(room).emit('playerDisconnect', 'Opponent has disconnected')
			}
		} catch (e) {
			console.error(e)
		}
	})
}

// update/increment number of games/wins/loss of user on database depending on scenario
// scenario can be any of the 3: 'win', 'loss', 'draw'
const updateUserGames = async (userId, scenario, currentElo, expectedScore) => {
	if (userId.substring(0, 5) === 'guest') return

	let updatedElo
	try {
		switch (scenario) {
			case 'win':
				updatedElo = elo.updateRating(expectedScore, 1, currentElo)
				return await User.findByIdAndUpdate(userId, {
					$inc: { 'games.total': 1, 'games.wins': 1 },
					$set: { 'games.elo': updatedElo }
				})
			case 'loss':
				updatedElo = elo.updateRating(expectedScore, 0, currentElo)
				return await User.findByIdAndUpdate(userId, {
					$inc: { 'games.total': 1, 'games.loss': 1 },
					$set: { 'games.elo': updatedElo }
				})
			case 'draw':
				updatedElo = elo.updateRating(expectedScore, 0.5, currentElo)
				return await User.findByIdAndUpdate(userId, {
					$inc: { 'games.total': 1 },
					$set: { 'games.elo': updatedElo }
				})
			default:
				return
		}
	} catch (e) {
		console.error(e)
	}
}

// upon game end, determine winner/loser and update stats accordingly
const updateStatsOnGameEnd = async (data) => {
	const { roomId, winner, reason } = data

	try {
		// update room in database
		const room = await Room.findByIdAndUpdate(roomId, { $set: { inProgress: false } }, { new: true })

		// calculate expected score to update elo rating
		room.white.expectedScore = elo.getExpected(room.white.elo, room.black.elo)
		room.black.expectedScore = elo.getExpected(room.black.elo, room.white.elo)

		// update user stats based on winning condition
		if (reason === 'draw') {
			updateUserGames(room.white.playerId, 'draw', room.white.elo, room.white.expectedScore)
			updateUserGames(room.black.playerId, 'draw', room.black.elo, room.black.expectedScore)
		} else if (reason === 'checkmate' || reason === 'stalemate') {
			const loser = winner === 'white' ? 'black' : 'white'
			updateUserGames(room[winner].playerId, 'win', room[winner].elo, room[winner].expectedScore)
			updateUserGames(room[loser].playerId, 'loss', room[loser].elo, room[loser].expectedScore)
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
