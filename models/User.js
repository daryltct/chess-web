const mongoose = require('mongoose')

const UserSchema = mongoose.Schema({
	name: {
		type: String,
		required: true
	},
	email: {
		type: String,
		required: true,
		unique: true
	},
	password: {
		type: String,
		required: true
	},
	games: {
		total: {
			type: Number,
			default: 0
		},
		wins: {
			type: Number,
			default: 0
		},
		loss: {
			type: Number,
			default: 0
		}
	}
})

module.exports = mongoose.model('user', UserSchema)
