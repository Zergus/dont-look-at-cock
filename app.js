let express = require('express');

let app = express();

app.use(express.static(__dirname + '/public'));

app.get('/*', function (req, res) {
    res.sendFile(__dirname + '/index.html');
});

app.listen(process.env.PORT || 3000, function () {
    console.log('Running...');
});

module.exports = app;