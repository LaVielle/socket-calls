var socket = io();

$(function () {
   $('form').submit(function(){
      socket.emit('chatMsg', $('#m').val());
      $('#m').val('');
      return false;
   });
});

var callBtn = document.getElementById('call')

callBtn.addEventListener('click', function(){
   console.log('call');
   socket.emit('callClicked');
});

socket.on('conToCust', function(msg){
   console.log(msg);
});
