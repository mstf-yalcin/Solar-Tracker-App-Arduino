const server=require('http').createServer();

// const io= require('socket.io')(server);
var io = require('socket.io')(server, {'transports': ['websocket', 'polling']});
io.on('connection',function(socket){
    console.log("connected");

    socket.on('sendData',function(data){
            console.log(data);
        io.emit('data',data);
    })

    socket.on('disconnect',function(){
        console.log("disconnect");
    })

})

server.listen(80 || 5000,() => { 
    console.log('Port listening'); 
});