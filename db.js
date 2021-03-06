const mongoose = require('mongoose')
require('dotenv').config()

const db = `mongodb+srv://admin:${process.env
	.MONGODB_PASSWORD}@chess-web.masqo.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`

const connectDB = async () => {
	try {
		await mongoose.connect(db, {
			useNewUrlParser: true,
			useCreateIndex: true,
			useFindAndModify: false,
			useUnifiedTopology: true
		})

		console.log('MongoDB Connected')
	} catch (err) {
		console.error(err.message)
		process.exit(1)
	}
}

module.exports = connectDB
