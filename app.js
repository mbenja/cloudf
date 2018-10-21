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
 * backend connection to login page
 * @type {Object}
 */
const route_login = require('./routes/login');

/**
 * backend connection to index page
 * @type {Object}
 */
const route_index = require('./routes/index');

/**
 * backend connection to file interaction URLs
 * @type {Object}
 */
const route_file_interaction = require('./routes/FileInteraction');

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
app.use('/', route_index);
app.use('/FileInteraction', route_file_interaction);

// expose public port
app.listen(port);

console.log("cloudf has started on port " + port);
