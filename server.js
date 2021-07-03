const express = require('express');
const app = express();
const mongoose = require('mongoose');
const morgan = require('morgan');
const user = require('./app/routes/users.js');
const project = require('./app/routes/projects.js');
const task = require('./app/routes/tasks.js');
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

app.get('/users/:id/tasks', user.getTasks);
app.get('/users/:id/tasks/incomplete', user.getIncompleteTasks);
app.get('/users/:id/tasks/completed', user.getCompletedTasks);

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

app.route('/projects/:id/tasks')
    .get(project.getTasks)
    .post(project.createTask);
app.get('/projects/:id/tasks/completed', project.getCompletedTasks);
app.get('/projects/:id/tasks/incomplete', project.getIncompleteTasks);

app.route('/projects/:id/tasks/:index')
    .get(project.getTask)
    .delete(project.deleteTask)
    .put(project.updateTask);

// /tasks routes
app.get('/tasks', task.getTasks);
app.get('/tasks/incomplete', task.getIncompleteTasks);
app.get('/tasks/completed', task.getCompletedTasks);
app.get('/tasks/:id', task.getTask);

app.listen(port);
console.log("Listening on port " + port);