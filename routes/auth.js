const express = require('express')
const router = express.Router()
const { check, validationResult } = require('express-validator') // for validating request body
const bcrypt = require('bcrypt') // for password hashing
const jwt = require('jsonwebtoken') // for authorization
require('dotenv').config()

const User = require('../models/User')

// GET api/auth
// retrieve logged in user
// private access
router.get('/', (req, res) => {
	res.send('retrieve logged in user')
})

// POST api/auth
// authenticate a user
// public access
router.post(
	'/',
	[
		check('email', 'Please enter a valid email address').isEmail(),
		check('password', 'Please enter a password').not().isEmpty()
	],
	async (req, res) => {
		const err = validationResult(req)
		if (!err.isEmpty()) {
			return res.status(400).json({ errors: err.array() })
		}

		const { email, password } = req.body

		try {
			let user = await User.findOne({ email })

			// check if user exists
			if (!user) {
				return res.status(400).json({ msg: 'No account associated with provided email address' })
			}

			// check if password is valid
			const isEqual = await bcrypt.compare(password, user.password)
			if (!isEqual) {
				return res.status(400).json({ msg: 'Invalid password' })
			}

			// if valid: create a json web token with payload, sign it, and return it to user
			const jwtPayload = {
				user: {
					id: user.id,
					name: user.name
				}
			}

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
			console.log(e)
			res.status(500).send('Something went wrong')
		}
	}
)

module.exports = router
