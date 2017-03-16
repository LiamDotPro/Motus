/**
 * Created by li on 03/03/2017.
 */
var express = require('express');
var app = require('express')();
var server = require('http').createServer(app);
var path = require('path');
var io = require('socket.io')(server);
var mysql = require('promise-mysql');
var request = require('request-promise');
var Promise = require("bluebird");


//api key for news api - cfe8990468894b4a96882692c13f063b - newsapi.org

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
dataStore.getArticles(pool);


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
    console.log('Server Started');
});


server.listen(80);


io.on('connection', function (socket) {

    //Holds the Unique ID of this client session for retrieval from the datastore.
    var connectedClient = '';

    function ensureDataIsAvailable() {
        return new Promise(function (resolve, reject) {
            waitForData(resolve);
        });
    }

    function waitForData(resolve) {
        if (!dataStore.getArticleBank().getLoadedArticlesBool()) {
            console.log(dataStore.getArticleBank().getLoadedArticlesBool());
            setTimeout(waitForData.bind(this, resolve), 300);
        } else {
            resolve();
        }
    }

    if (!dataStore.getArticleBank().getLoadedArticlesBool()) {
        console.log("Database or view is not ready for rendering yet, hold tight.");
        ensureDataIsAvailable().then(function () {
            console.log("Database is ready.");
        });
    } else {
        //Database is ready for view to be extracted.
        var view = dataStore.getArticleBank().getAllArticles();
        var arrOfArticles = [];

        view.forEach(function (value, key) {

            var articleObj = {
                id: value.getId(),
                source: value.getSource(),
                author: value.getAuthor(),
                title: value.getTitle(),
                desc: value.getDesc(),
                url: value.getUrl(),
                urlToImage: value.getUrlToImage(),
                publishedAt: value.getPublishedAt()
            };

            arrOfArticles.push(articleObj);

        });

        socket.emit('loadArticles', {
            articles: arrOfArticles
        });

    }


    //disconnect event
    socket.on('disconnect', function () {


        if (connectedClient != '') {
            var dataStoreInstance = dataStore.getClient(connectedClient);

            //decrease tabs open accessing the website.
            dataStoreInstance.decreaseTabs();

            //attempt to change the status on closure of tab.
            if (dataStoreInstance.getTabs() == 0) {
                dataStoreInstance.changeStatus('offline');
                console.log('User: ' + connectedClient + ' Has closed all tabs. ');
                console.log(dataStore.getClient(connectedClient));
            } else {
                console.log('User: ' + connectedClient + ' Has closed a tab, but is still connected. ');
            }

        } else {
            console.log('no unique id for user was found');
        }

        //session time - path they were viewing.
    });

    //registers a new instance of client with the server.
    socket.on('registerUser', function (data) {

        console.log(data);

        //register a new client within the datastore.
        var result = dataStore.registerNewClient(data.reso, data.ref);

        //assign new unique id to connected client
        connectedClient = result;

        console.log('new client registered');

        //tell the client to create a cookie for this experience.
        socket.emit('addCookieForUser', {
            id: result
        });

    });

    socket.on('updateUserAreaSettings', function (data) {
        console.log('area settings received');

        //notify datastore to handle updating area settings.
        dataStore.updateClientAreaSettings(data.id, [data.ip, data.county, data.country]);

    });

    socket.on('assignOldUser', function (data) {

        //Id is passed from the cookie that was assigned.
        console.log('Previous User detected via cookie: ' + data.id);

        //provide the parent variable with the instance of the unique ID.
        connectedClient = data.id;

        //context is the actual client class we are operating on.
        var context = dataStore.getClient(connectedClient);

        //allows us to understand if the user is using multiple tabs as a means of accessing the website.
        if (context.getStatus() === 'offline' && context.getTabs() == 0) {
            context.increaseTabs();
            context.changeStatus('online');
        } else if (context.getTabs() > 0) {
            console.log('User: ' + data.id + ' Has opened another tab');
            context.increaseTabs();
        } else {
            console.log("err");
        }

        /**
         * Sends existing information about the current session to the origin and skips api call.
         */
        socket.emit('originInfo', {
            ip: context.getIp(),
            county: context.getCounty(),
            country: context.getCountry()
        });
    });

    socket.on('clientCanvasData', function (data) {
        console.log('canvas data incoming');
        dataStore.createCanvasFingerPrintRecord(data, connectedClient);
    });

});

