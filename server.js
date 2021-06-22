const express = require('express');
const app = express();
const mongoose = require('mongoose');
const morgan = require('morgan');
const user = require('./app/routes/users.js');
const port = 8080;
let config;

//load the db location from the JSON files
if(process.env.NODE_ENV !== 'test') {
    app.use(morgan('combined'));
    config = require('./config/dev.json');
}
else {
    config = require('./config/test.json');
}

//db connection
mongoose.connect(config.DBHost);
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));

//parse application/json and look for raw text
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(express.text());
app.use(express.json({ type: 'application/json'}));

app.route('/users')
    .get(user.getUsers)
    .post(user.createNewUser);

app.route('/users/:id')
    .get(user.getUser)
    .delete(user.deleteUser)
    .put(user.updateUser);

app.route('/users/:id/projects')
    .get(user.getProjects);

//TODO: pick up from here
app.route('/projects')
    .get(project.getProjects)
    .post(project.createNewProject);

app.route('/projects/:id')
    .get(project.getProject)
    .delete(project.deleteProject)
    .put(project.updateProject);

app.route('/projects/:id/users')
    .get(project.getUsers)
    .post(project.includeUser);


app.listen(port);
console.log("Listening on port " + port);

module.exports = app; //for testing