let express = require('express');

let app = express();

app.use(express.static(__dirname + '/public'));

app.get('/*', function (req, res) {
    res.sendFile(__dirname + '/index.html');
});

app.listen(8888, function () {
    console.log('Running...');
});

module.exports = app;