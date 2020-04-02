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
  socket.on('login', name => {
    let user = userList.find(user => user.name === name)
    !user && userList.push({ id: socket.id, name, socket })
    console.log(userList.map(user => user.name))
  })
  socket.on('ice-sign', data => {
    let target = data.target && userList.find(user => user.name === data.target)
    // console.log(
    //   userList.map(user => user.name),
    //   target.name,
    //   data
    // )
    console.log(data.type)
    if (target) {
      target.socket.emit('ice-sign', data)
    }
  })
  socket.on('ice-candidate', data => {
    let target = data.target && userList.find(user => user.name === data.target)
    if (target) {
      target.socket.emit('ice-candidate', data)
    }
  })
  socket.join('room 237', () => {
    let rooms = Object.keys(socket.rooms)
    // console.log(rooms)
  })
  socket.on('disconnect', e => {
    userList = userList.filter(user => user.id !== socket.id)
  })
})

http.listen(4000, function() {
  console.log('listening on *:4000')
})
