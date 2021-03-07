const jwt = require('jsonwebtoken')
require('dotenv').config

const checkToken = (req, res, next) => {
	// retrieve token from request header
	const token = req.header('x-auth-token')

	// if header does not contain token
	if (!token) {
		return res.status(401).json({ msg: 'You have to be logged in to perform that request' })
	}

	// verify token
	try {
		// decode the token
		const decoded = jwt.verify(token, process.env.JWT_SECRET)

		// attach the user (id and name) in the payload to the request
		req.user = decoded.user
		next()
	} catch (e) {
		// invalid token
		res.status(401).json({ msg: 'Invalid token' })
	}
}

module.exports = { checkToken }
