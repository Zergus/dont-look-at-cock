let express = require('express');

let app = express();

app.use(express.static(__dirname + '/public'));

app.get('/api/request', function (req, res) {
    res.sendFile(__dirname + '/data.json');
});

app.get('/*', function (req, res) {
    res.sendFile(__dirname + '/index.html');
});

app.listen(3000, function () {
    console.log('Example app listening on port localhost:3000!');
});

module.exports = app;