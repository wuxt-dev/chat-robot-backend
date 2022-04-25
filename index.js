// @ts-nocheck
const express = require('express')
const http = require('http')
const { Server } = require('socket.io')
const { instrument } = require('@socket.io/admin-ui')
const expressJwt = require('express-jwt')
const cors = require('cors')
const { jwtSecretKey, host, port } = require('./config/index')
const joi = require('joi')
const { genUrl, getAnswer } = require('./api/request')
const {
  joinRoom,
  getCurrentUserByName,
  getCurrentUserById,
  leaveRoom
} = require('./utils/socket')

const userRouter = require('./router/user')
const friendRouter = require('./router/friend')

const app = express()
const server = http.createServer(app)

app.use(cors())
app.use(express.static('./public'))
app.use((req, res, next) => {
  res.cc = function (status, message, data = {}) {
    res.send({
      status,
      message,
      data
    })
  }
  next()
})
app.use(
  expressJwt({ secret: jwtSecretKey, algorithms: ['HS256'] }).unless({
    path: [/^\/user\//, /^\/friend\//, '/socket.io']
  })
)
app.use(express.json()) // for parsing application/json
app.use(express.urlencoded({ extended: true })) // for parsing application/x-www-form-urlencoded

app.use('/user', userRouter)
app.use('/friend', friendRouter)

// 使用socket.io
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['get', 'post'],
    credentials: true
  }
})
instrument(io, {
  auth: false
})
io.on('connection', socket => {
  console.log('user connected')

  socket.on('join room', ({ username, room }) => {
    joinRoom(socket.id, username, room)
    socket.join(room)

    socket.emit('chat message', { username: 'system', msg: 'welcome!' })

    socket.to(room).emit('chat message', {
      username: 'system',
      msg: `${username} has joined the room`
    })
  })

  socket.on('chat message', async ({ username, msg }) => {
    const user = getCurrentUserByName(username)
    if (user.room.includes('-0')) {
      console.log('object')
      const url = genUrl(msg)
      const answer = await getAnswer(url)
      answer.content = answer.content.replace(/\{br\}/g, '\n')
      io.to(user.room).emit('chat message', {
        username: 'Chat Bot',
        msg: answer.content
      })
    } else {
      // to本身具备broadcast的功能
      socket.to(user.room).emit('chat message', { username, msg })
    }
  })

  socket.on('leave room', ({ username, room }) => {
    leaveRoom(socket.id)
    socket.leave(room)
    socket.to(room).emit('chat message', {
      username: 'system',
      msg: `${username} has left the room`
    })
  })

  socket.on('disconnect', () => {
    const user = getCurrentUserById(socket.id)
    if (user) {
      leaveRoom(socket.id)
      socket.leave(user.room)
    }
    console.log('user disconnected')
  })
})

app.use((err, req, res, next) => {
  if (err instanceof joi.ValidationError) return res.cc(1, err.message)
  if (err.name === 'UnauthorizedError') return res.cc(1, '身份认证失败！')
  console.log(err)
})
server.listen(
  {
    host,
    port
  },
  () => {
    console.log(`server running at http://${host}:${port}`)
    console.log('check socket dashboard at https://admin.socket.io/')
  }
)
