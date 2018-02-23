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

// ** ** ** ** ** ** ** ** ** ** ** ** ** ** ** ** ** ** ** ** ** **
// Call object
function call(cID, rep, cust, tStart) {
   this.callID = cID;
   this.repID = rep;
   this.custID = cust;
   this.tStart = tStart;
   this.duration = 0;
}
// ** ** ** ** ** ** ** ** ** ** ** ** ** ** ** ** ** ** ** ** ** **

var passes = JSON.parse(fs.readFileSync('pss.json', 'utf8'));
var calls = JSON.parse(fs.readFileSync('calls.json', 'utf8'));

console.log(calls);

io.on('connection', function(socket){
  console.log('a user connected', socket.id);
  socket.on('disconnect', () => {
     console.log('user disconnected:', socket.id);
     if (socket.id == admin.id) {
        admin.id = null;
        admin.isOnline = false;
        admin.isAvailable = false;
     }
     else {
        admin.isAvailable = true;
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

// ** ** ** ** ** ** ** ** ** ** ** ** ** ** ** ** ** ** ** ** ** **
// Call functions

function checkPass(input, socket){
   var arr = passes.users;
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

            // adding new call object to DB
            fs.readFile('calls.json', 'utf-8', function(err, data){
               if (err) {
                  throw err
               }
               var callsObj = JSON.parse(data);
               // var call = new call(callsObj.calls.length + 1, admin.id, socket.id, new Date());
               var call = 'call-' + callsObj.calls.length;
               callsObj.calls.push(call);
               console.log('login calls:', callsObj);

               fs.writeFile('calls.json', JSON.stringify(callsObj), 'utf-8', function(err){
                  if (err) throw error
                  console.log('Added call to DB!');
               })
            });

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
