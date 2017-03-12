/**
 * Created by li on 03/03/2017.
 */
var express = require('express');
var app = require('express')();
var server = require('http').createServer(app);
var path = require('path');
var io = require('socket.io')(server);
var mysql = require('promise-mysql');

//module exports
var DataStore = require('./server/DataStore.js');

var dataStore = new DataStore();

//database connection pool - 100 max connections
var pool = mysql.createPool({
    host: 'localhost',
    user: 'liam',
    password: 'newpassword123',
    database: 'motus',
    connectionLimit: 100
});

dataStore.setPool(pool);
dataStore.loadExp();


//make the public resources static
app.use(express.static(__dirname + '/'));

app.get('/', function (req, res) {
    res.sendFile(path.join(__dirname + '/public/index.html'));
    //console.log('express serves homepage');
});

app.get('/home', function (req, res) {
    res.sendFile(path.join(__dirname + '/public/index.html'));
});

server.listen(80, function () {
    console.log('Server Started')
});


server.listen(80);

io.on('connection', function (socket) {

    //Holds the Unique ID of this client session for retrieval from the datastore.
    var connectedClient = '';

    //disconnect event
    socket.on('disconnect', function () {

        console.log('User: ' + connectedClient + ' Leaving. ');

        if (connectedClient != '') {
            var dataStoreInstance = dataStore.getClient(connectedClient);

            //decrease tabs open accessing the website.
            dataStoreInstance.decreaseTabs();

            //attempt to change the status on closure of tab.
            dataStoreInstance.changeStatus('offline');

        } else {
            console.log('no unique id for user was found');
        }

        console.log(dataStore.getClient(connectedClient));

        //session time - path they were viewing.
    });

    //registers a new instance of client with the server, late this will need to be indexed in long term storage
    socket.on('registerUser', function () {

        //register a new client within the datastore.
        var result = dataStore.registerNewClient();

        //assign new unique id to connected client
        connectedClient = result;

        console.log('new client registered');

        //tell the client to create a cookie for this experience.
        socket.emit('addCookieForUser', {
            id: result
        });
    });

    socket.on('assignOldUser', function (data) {
        //Id is passed from the cookie that was assigned.
        console.log('Previous User detected via cookie: ' + data.id);

        //provide the parent variable with the instance of the unique ID.
        connectedClient = data.id;

        console.log(dataStore.getClient(connectedClient).getStatus() + ' --------- ' +  dataStore.getClient(connectedClient).getTabs());

        if (dataStore.getClient(connectedClient).getStatus() === 'offline' && dataStore.getClient(connectedClient).getTabs() == 0) {
            dataStore.getClient(connectedClient).increaseTabs();
            dataStore.getClient(connectedClient).changeStatus('online');
        } else if (dataStore.getClient(connectedClient).getTabs() > 0) {
            console.log('User: ' + data.id + ' Has opened another tab');
            dataStore.getClient(connectedClient).increaseTabs();
        } else {
            console.log("err");
        }

        console.log(dataStore.getClient(connectedClient));
    });

});

