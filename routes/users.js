const express = require('express')
const router = express.Router()
const { check, validationResult } = require('express-validator') // for validating request body
const bcrypt = require('bcrypt') // for password hashing
const jwt = require('jsonwebtoken') // for authorization
require('dotenv').config()

const User = require('../models/User')
const { checkToken } = require('../utils/middleware')

// POST api/users
// register a user
// public access
router.post(
	'/',
	[
		check('name', 'Please enter a name').not().isEmpty(),
		check('name', 'Name can only contain alphabets and numbers').isAlphanumeric(),
		check('email', 'Please enter a valid email address').isEmail(),
		check('password', 'Please enter a password').not().isEmpty()
	],
	async (req, res) => {
		const err = validationResult(req)
		if (!err.isEmpty()) {
			const errArr = err.array()
			return res.status(400).json({ msg: errArr[0].msg })
		}

		const { name, email, password } = req.body

		try {
			// check if user already exists
			let user = await User.findOne({ email })
			if (user) {
				return res.status(400).json({ msg: 'An account with the associated email already exists' })
			}
			user = await User.findOne({ name })
			if (user) {
				return res.status(400).json({ msg: 'Username is already taken' })
			}

			// hash password
			const salt = await bcrypt.genSalt()
			hashedPassword = await bcrypt.hash(password, salt)

			// create a new user with hashed password
			user = new User({
				name,
				email,
				password: hashedPassword
			})
			await user.save()

			const jwtPayload = {
				user: {
					id: user.id,
					name: user.name
				}
			}
			// create a json web token with payload, sign it, and return it to user
			jwt.sign(
				jwtPayload,
				process.env.JWT_SECRET,
				{
					expiresIn: 7200 // 2 hours
				},
				(error, token) => {
					if (error) throw error
					res.json({ token })
				}
			)
		} catch (e) {
			console.error(e)
			res.status(500).json({ msg: 'Server Error' })
		}
		console.log(`POST /api/users`)
	}
)

// PUT api/users/
// update user
// private access
router.put('/', checkToken, async (req, res) => {
	const { name, email, password } = req.body

	const updatedUser = {}

	try {
		let user
		if (name) {
			// check if user with provided name already exist
			user = await User.findOne({ name })
			if (user) {
				return res.status(400).json({ msg: 'Username is already taken' })
			}
			updatedUser.name = name
		}
		if (email) {
			// check if user with provided email already exist
			user = await User.findOne({ email })
			if (user) {
				return res.status(400).json({ msg: 'An account with the associated email already exists' })
			}
			updatedUser.email = email
		}
		if (password) {
			// hash password
			const salt = await bcrypt.genSalt()
			hashedPassword = await bcrypt.hash(password, salt)

			updatedUser.password = hashedPassword
		}

		// update user
		user = await User.findByIdAndUpdate(req.user.id, { $set: updatedUser }, { new: true }).select('-password')
		res.json(user)
	} catch (e) {
		console.error(e)
		res.status(500).json({ msg: 'Server Error' })
	}
	console.log(`PUT /api/users`)
})

// GET api/users/
// get user's rank and top 5 or more users' profile
// private access
router.get('/', checkToken, async (req, res) => {
	try {
		let limit = parseInt(req.query.limit) ? parseInt(req.query.limit) : 5

		const users = await User.find({}, 'name games').sort({ 'games.elo': -1, 'games.total': -1 })
		const rank = users.findIndex((obj) => obj.id === req.user.id)

		res.json({
			rank: rank + 1,
			users: users.slice(0, limit)
		})
	} catch (e) {
		console.error(e)
		res.status(500).json({ msg: 'Server Error' })
	}
	console.log(`GET /api/users`)
})

// GET api/users/availability
// checks if a name or email already exists
// public access
router.get('/availability', async (req, res) => {
	const { name, email } = req.query

	const availResponse = {}
	try {
		let user
		if (name) {
			user = await User.findOne({ name })
			availResponse.name = { query: name, isAvailable: user ? false : true }
		}
		if (email) {
			user = await User.findOne({ email })
			availResponse.email = { query: email, isAvailable: user ? false : true }
		}
		res.json(availResponse)
	} catch (e) {
		console.error(e)
		res.status(500).json({ msg: 'Server Error' })
	}
})

module.exports = router
