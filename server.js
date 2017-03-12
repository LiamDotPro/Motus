/**
 * Created by li on 03/03/2017.
 */
var express = require('express');
var app = require('express')();
var server = require('http').createServer(app);
var path = require('path');
var io = require('socket.io')(server);
var mysql = require('mysql');

//database connection
var connection = mysql.createConnection({
    host: 'localhost',
    user: 'liam',
    password: 'newpassword123',
    database: 'motus'
});

//checking to see if connection is working correctly.
connection.connect(function (err) {
    if (!err) {
        console.log("Database is connected");
    } else {
        console.log("Error connecting database");
    }
});

//module exports
var Client = require('./server/Client.js');
var UUID = require('./server/UUID.js');
var DataStore = require('./server/DataStore.js');

//UUID generating class
var UUID = new UUID();

var dataStore = new DataStore(connection);
dataStore.loadExp();


//make the public resources static
app.use(express.static(__dirname + '/'));

app.get('/', function (req, res) {
    res.sendFile(path.join(__dirname + '/public/index.html'));
    //console.log('express serves homepage');
});

server.listen(80, function () {
    console.log('Server Started')
});


server.listen(80);

var clients = new Map();

io.on('connection', function (socket) {

    var connectedClient = '';

    //disconnect event
    socket.on('disconnect', function () {
        console.log("a user has disconnected.");
        //session time - path they were viewing
    });

    //registers a new instance of client with the server, late this will need to be indexed in long term storage
    socket.on('registerUser', function () {
        var connectedUser = new Client(socket.id);

        //Generate new UUID
        UUID.generateUUID();

        //add new client to the clients map
        clients.set(UUID.getUUID(), connectedUser);

        console.log('new client registered');

        //inform the database of a new client and make a record.
        connection.query('INSERT INTO `exp` SET ?',{ uuid: UUID.getUUID()}, function(err, results, fields){
            if(err){
                console.log(err);
            }
        });

        //tell the client to create a cookie for this experience.
        socket.emit('addCookieForUser', {
            id: UUID.getUUID()
        })
    });

    socket.on('assignOldUser', function (data) {
        //Id is passed from the cookie that was assigned.
        console.log(data.id);
        console.log(clients);
        connectedClient = clients.get(data.id);
        console.log(connectedClient);
    });

});

