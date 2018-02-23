var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var fs = require('fs');

app.use(express.static('public'));

var admin = {
   "id": null,
   "isOnline": false,
   "isAvailable": false
}

var obj = JSON.parse(fs.readFileSync('pss.json', 'utf8'));

console.log(admin);

io.on('connection', function(socket){
  console.log('a user connected', socket.id);
  socket.on('disconnect', () => {
     console.log('user disconnected:', socket.id);
     if (socket.id == admin.id) {
        admin.id = null;
        admin.isOnline = false;
        admin.isAvailable = false;
     }
     console.log(admin);
  });
  socket.on('chatMsg', function(msg){
     io.emit('chatMsg', msg);
     checkPass(msg, socket);
     console.log('message:', msg);
  });
  socket.on('callClicked', function(){
     console.log('Call clicked!');
     connectCalls(socket, admin);
  });
});

http.listen(3000, function(){
  console.log('listening on *:3000');
});

function checkPass(input, socket){
   var arr = obj.users;
   var isValid = false;
   for (var i = 0; i < arr.length; i++) {
      if (input == arr[i].password) {
         var isValid = true;
      }
   }
   if (isValid) {
      admin.id = socket.id;
      admin.isOnline = true;
      admin.isAvailable = true;
   }
   console.log("matched password:", isValid);
   console.log(admin);
   return isValid;
}

function connectCalls(socket, admin){
   if(socket.id == admin.id){
      console.log("cannot connect to yourself");
   }
   else {
      if (admin.isOnline) {
         if (admin.isAvailable) {
            console.log("connect", socket.id, "to", admin.id);
            var msg = 'you are connected to ' + socket.id;
            io.to(admin.id).emit('conToCust', msg);
            admin.isAvailable = false;
         }
         else {
            console.log("chat busy, please wait a bit...");
         }
      }
      else if (!admin.isOnline) {
         console.log("no reps online at the moment");
      }
   }
}
