const User = require('../models/users.js');
const Project = require('../models/projects.js');

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
 * GET /users/:id/projects retreieve all projects an user is working on
 */
function getProjects(req, res, next) {
    User.findById(req.params.id, (err, user) => {
        if(err || !user)  return res.status(404).send();
        res.status(200).json(user.projectIds);
    });
}


module.exports = { getUsers, createNewUser, getUser, deleteUser, updateUser, getProjects };