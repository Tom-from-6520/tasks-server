const express = require('express');
const app = express();
const mongoose = require('mongoose');
const morgan = require('morgan');
const user = require('./app/routes/users.js');
const project = require('./app/routes/projects.js');
const port = 8080;
const config = require('./config.json');

//db connection
mongoose.connect(config.DBHost);
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));

//logging the work of the server
app.use(morgan('combined'));

//parse application/json and look for raw text
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(express.text());
app.use(express.json({ type: 'application/json'}));

// /users routes
app.route('/users')
    .get(user.getUsers)
    .post(user.createNewUser);

app.route('/users/:id')
    .get(user.getUser)
    .delete(user.deleteUser)
    .put(user.updateUser);

app.route('/users/:id/projects')
    .get(user.getProjects);
app.get('/users/:id/projects/incomplete', user.getIncompleteProjects);
app.get('/users/:id/projects/completed', user.getCompletedProjects);

// /projects routes
app.route('/projects')
    .get(project.getProjects)
    .post(project.createNewProject);
app.get('/projects/completed', project.getCompletedProjects);
app.get('/projects/incomplete', project.getIncompleteProjects);

app.route('/projects/:id')
    .get(project.getProject)
    .delete(project.deleteProject)
    .put(project.updateProject);

app.route('/projects/:id/users')
    .get(project.getUsers)
    .post(project.includeUser);

app.route('/projects/:id/users/:index')
    .get(project.getUser)
    .delete(project.deleteUser)
    .put(project.updateUser);

app.listen(port);
console.log("Listening on port " + port);