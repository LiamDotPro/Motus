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
dataStore.loadUsers();
dataStore.getArticles(pool);

//make the public resources static
app.use(express.static(__dirname + '/'));

app.get('/', function (req, res) {
    res.sendFile(path.join(__dirname + '/public/index.html'));
});

app.get('/home', function (req, res) {
    res.sendFile(path.join(__dirname + '/public/index.html'));
});

app.get('/about', function (req, res) {
    res.sendFile(path.join(__dirname + '/public/index.html'));
});

app.get('/mission', function (req, res) {
    res.sendFile(path.join(__dirname + '/public/index.html'));
});

app.get('/register', function (req, res) {
    res.sendFile(path.join(__dirname + '/public/register.html'));
});

app.get('/dashboard', function (req, res) {
    res.sendFile(path.join(__dirname + '/public/dashboard.html'));
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

    socket.on('websiteLoad', function (data) {

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
                    publishedAt: value.getPublishedAt(),
                    score: value.getArticleScore(),
                    category: value.getCategory(),
                    webSafeLink: value.getWebSafeLink()
                };

                arrOfArticles.push(articleObj);

            });

            if (data.type === 'silent') {
                socket.emit('loadArticles', {
                    articles: arrOfArticles,
                    type: data.type
                });
            } else if (data.type === 'load') {
                socket.emit('loadArticles', {
                    articles: arrOfArticles,
                    type: data.type
                });
            }
        }
    });

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

        console.log(data.createdLocation);

        //notify datastore to handle updating area settings.
        dataStore.updateClientAreaSettings(data.id, [data.ip, data.county, data.country, data.createdLocation]);

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

    });

    socket.on('clientCanvasData', function (data) {
        console.log('canvas data incoming');
        dataStore.createCanvasFingerPrintRecord(data, connectedClient);
    });

    socket.on('checkForNewArticles', function (data) {
        var latestID = data.latestId;
        console.log("Incoming request for new articles: " + latestID);

        var articleMap = dataStore.getArticleBank().getAllArticles();

        var articleArr = Array.from(articleMap);

        articleArr.sort(function (a, b) {
            return b[1].id - a[1].id;
        });

        var resultArr = [];

        for (var i = 0; i < articleArr.length; i++) {
            if (latestID < articleArr[i][1].id) {
                resultArr.push(articleArr[i][1]);
            } else {
                //break as were parsing articles the user already has.
                break;
            }
        }

        if (resultArr.length > 0) {
            socket.emit('addNewArticles', {
                arrOfNewArticles: resultArr
            });
        }


    });

    /**
     * triggered when a user attempt to create a new user from the register form.
     */
    socket.on('registerNewUser', (data) => {
        console.log("request to create a new user incoming");

        //canvas hash, boolean, email address, password.
        var result = dataStore.registerNewUser(data.hash, data.admin, data.email, data.password);

        switch (result) {
            case 'Email Already Registered':
                socket.emit('emailAlreadyRegistered', {
                    message: "Email Already registered"
                });
                break;
            case 'User Created':
                socket.emit('newUserCreated', {
                    message: "New Account created - Login available via the homepage"
                });
                break;
        }

    });

    socket.on('loginAttempt', (data) => {
        dataStore.verifyUser(data.email, data.password, socket);
    });


});

