var express = require('express');
var app = express();
var path = require('path');


app.use(express.static('dist'));

app.get('/', function (req, res) {
    res.sendFile(path.join(__dirname + '/dist/index.html'));
});

app.listen(8080);