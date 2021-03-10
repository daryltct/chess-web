const mongoose = require('mongoose')

const RoomSchema = mongoose.Schema({
	players: [ String ],
	white: {
		playerId: {
			type: String,
			required: true
		},
		isActive: {
			type: Boolean,
			required: true
		},
		elo: {
			type: Number,
			default: 1000
		}
	},
	black: {
		playerId: {
			type: String,
			required: true
		},
		isActive: {
			type: Boolean,
			required: true
		},
		elo: {
			type: Number,
			default: 1000
		}
	},
	pgn: {
		type: String,
		default: ''
	},
	inProgress: {
		type: Boolean,
		default: true
	},
	createdAt: {
		type: Date,
		expires: 3600, // delete room after 1h (testing)
		default: Date.now
	}
})

module.exports = mongoose.model('room', RoomSchema)
