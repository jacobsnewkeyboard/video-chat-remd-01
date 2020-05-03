const express = require("express");
const http = require("http");
const path = require("path");
const app = express();
const server = http.createServer(app);
const socket = require("socket.io");
const io = socket(server);

const users = {};

app.use(express.static(path.join(__dirname, 'client/build')))

app.get('/ping', (req, res) => {
  return res.send('pong')
})

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'client/build', 'index.html'))
})

io.on('connection', socket => {
    console.log('client connected');
    if (!users[socket.id]) {
        users[socket.id] = socket.id;
    }
    socket.emit("yourID", socket.id);
    io.sockets.emit("allUsers", users);
    socket.on('disconnect', () => {
        console.log('client disconnected');
        delete users[socket.id];
    })

    socket.on("callUser", (data) => {
        io.to(data.userToCall).emit('hey', {signal: data.signalData, from: data.from});
    })

    socket.on("acceptCall", (data) => {
        io.to(data.to).emit('callAccepted', data.signal);
    })
});

server.listen(8000, () => console.log('server is running on port 8000'));


