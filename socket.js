/**
 * Socket.io Processor about chatting room
 *
 * Created by Fu Yu on 2015/3/3.
 */

module.exports = function(server) {
  var io = require('socket.io')(server);
  io.on('connection', function(socket) {

    // When new user joined
    socket.on('login', function(msg) {
      socket.name = msg.name;
      console.log(socket.name + ' login');
      io.emit('welcome', {
        name: socket.name
      });
    });

    // When user leaved
    socket.on('disconnect', function() {
      if (socket.name) {
        console.log(socket.name + ' logout');
        io.emit('bye', {
          name: socket.name
        });
      }
    });

    // When new message comes
    socket.on('send', function(msg) {
      io.emit('receive', {
        name: socket.name,
        content: msg.content
      }); // Broadcast
    });
  });
};
