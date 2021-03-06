const express = require('express')
const router = express.Router()

// POST api/users
// register a user
// public access
router.post('/', (req, res) => {
	res.send('register')
})

// PUT api/users/:id
// update user
// private access
router.put('/:id', (req, res) => {
	res.send('update user')
})

module.exports = router
