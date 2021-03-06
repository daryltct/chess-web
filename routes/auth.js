const express = require('express')
const router = express.Router()

// GET api/auth
// retrieve logged in user
// private access
router.get('/', (req, res) => {
	res.send('retrieve logged in user')
})

// POST api/auth
// authenticate a user
// public access
router.post('/', (req, res) => {
	res.send('log in user')
})

module.exports = router
