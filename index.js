const app = require('express')()
const httpServer = require('http').createServer(app)
const io = require('socket.io')(httpServer)

io.on('connection', (socket) => {
    console.log(socket.id)

    socket.on('join', (data) => {
        socket.join(data)
        console.log('user joined room' + data)
    })

    socket.on('move', (data) => {
        socket.broadcast.emit('move', {from: data.from, to: data.to, promotion: 'q'})
    })

    socket.on('disconnect', () => {
        console.log('user disconnected')
    })
})

httpServer.listen(5000, () => {
    console.log('listening on port 5000')
})
