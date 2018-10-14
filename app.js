// take care of dependencies

/**
 * exports of express module
 * @type {Object}
 */
var express = require('express');

/**
 * exports of path module
 * @type {Object}
 */
var path = require('path');

/**
 * instance of express
 * @type {Function}
 */
var app = express();



// setting up route variables

/**
 * backend index functionality
 * @type {Object}
 */
const route_login = require('./routes/login');

/**
 * port to allow connections on
 * @type {Number}
 */
const port = 3000;



// setting up view engine
app.set('views', path.join(__dirname, 'views'));
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');

// setting up static folder
app.use(express.static(path.join(__dirname, 'public')));

// assigning routes to app
app.use('/login', route_login);

// expose public port
app.listen(port);

console.log("cloudf has started on port " + port);
