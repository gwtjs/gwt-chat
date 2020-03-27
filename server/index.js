var path = require('path')
var express = require('express')
var app = express()
var http = require('http').createServer(app)
var io = require('socket.io')(http)

let userList = []

app.use('/build', express.static(path.join(__dirname, 'build')))

app.get('/', function(req, res) {
  res.sendFile(__dirname + '/build/index.html')
})

io.on('connection', function(socket) {
  socket.join('room 237', () => {
    let rooms = Object.keys(socket.rooms)
    console.log(rooms)
  })
  socket.on('disconnect', e => {
    console.log(e)
  })
  socket.on('message', message => {
    console.log(message)
  })
})

http.listen(4000, function() {
  console.log('listening on *:4000')
})
