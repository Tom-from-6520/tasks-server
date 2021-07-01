const User = require('../models/users.js');
const Project = require('../models/projects.js');
const Task = require('../models/tasks.js');

/**
 * GET /users retrieve all the users
 */
function getUsers(req, res, next) {
    let query = User.find({});
    query.exec((err, users) => {
        if(err || !users)  return res.status(404).send(err);
        res.status(200).json(users);
    });
}

/**
 * POST /users create a new user
 */
function createNewUser(req, res, next) {
    const newUser = new User(req.body);
    newUser.save((err, user) => {
        if(err)  return res.status(400).send();
        res.status(201).json(user);
    });
}

/**
 * GET /users/:id retrieve an user given its id
 */
function getUser(req, res, next) {
    User.findById(req.params.id, (err, user) => {
        if(err || !user)  return res.status(404).send();
        res.status(200).json(user);
    });
}

/**
 * DELETE /users/:id delete an user given its id
 */
function deleteUser(req, res, next) {
    User.deleteOne({_id: req.params.id}, (err, result) => {
        if(err)  return res.status(404).send();
        
        //TODO: delete the record of the user in projects and tasks databases

        res.status(204).json(result);
    });
}

/**
 * PUT /users/:id update an user given its id
 */
function updateUser(req, res, next) {
    if(req.body.projectIds || req.body.taskIds)  return res.status(400).send();
    User.findById(req.params.id, (err, user) => {
        if(err || !user)  return res.status(404).send();
        Object.assign(user, req.body).save((err, user) => {
            if(err)  return res.status(500).send();
            res.status(200).json(user);
        });
    });
}

/**
 * GET /users/:id/projects retreieve all projects an user is working/has worked on
 */
function getProjects(req, res, next) {
    req.all = true;
    getManyProjects(req, res);
}

/**
 * GET /users/:id/projects/incomplete retrieve all incomplete projects an user is working on
 */
function getIncompleteProjects(req, res, next) {
    req.all = false;
    req.completed = false;
    getManyProjects(req, res);
}

/**
 * GET /users/:id/projects/completed retrieve all completed projects an user has worked on
 */
function getCompletedProjects(req, res, next) {
    req.all = false;
    req.completed = true;
    getManyProjects(req, res);
}

/**
 * GET /users/:id/projects retreieve all projects an user is working/has worked on
 */
 function getTasks(req, res, next) {
    req.all = true;
    getManyTasks(req, res);
}

/**
 * GET /users/:id/projects/incomplete retrieve all incomplete projects an user is working on
 */
function getIncompleteTasks(req, res, next) {
    req.all = false;
    req.completed = false;
    getManyTasks(req, res);
}

/**
 * GET /users/:id/projects/completed retrieve all completed projects an user has worked on
 */
function getCompletedTasks(req, res, next) {
    req.all = false;
    req.completed = true;
    getManyTasks(req, res);
}

module.exports = { getUsers, createNewUser, getUser, deleteUser, updateUser, getProjects, getIncompleteProjects, getCompletedProjects,
                    getTasks, getIncompleteTasks, getCompletedTasks };

//helper functions
/**
 * retrieve all projects of user according to the request
 */
function getManyProjects(req, res) {
    User.findById(req.params.id, (err, user) => {
        if(err || !user)  return res.status(404).send();
        if(req.all) {
            res.status(200).json(user.projectIds);
        }
        else {
            Project.find({_id: user.projectIds, completed: req.completed}, (err, projects) => {
                if(!err && projects)  res.status(200).json(projects.map(project => project.id));
            });
        }
    });
}

/**
 * retrieve all tasks of user according to the request
 */
 function getManyTasks(req, res) {
    User.findById(req.params.id, (err, user) => {
        if(err || !user)  return res.status(404).send();
        if(req.all) {
            res.status(200).json(user.taskIds);
        }
        else {
            Task.find({_id: user.taskIds, completed: req.completed}, (err, tasks) => {
                if(!err && tasks)  res.status(200).json(tasks.map(task => task.id));
            });
        }
    });
}