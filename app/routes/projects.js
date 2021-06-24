const Project = require('../models/projects.js');
const User = require('../models/users.js');

/**
 * GET /projects retrieve all the projects
 */
function getProjects(req, res, next) {
    let query = Project.find({});
    query.exec((err, projects) => {
        if(err || !projects)  return res.status(404).send(err);
        res.status(200).json(projects);
    });
}

/**
 * POST /projects create a new project
 */
 function createNewProject(req, res, next) {
    const newProject = new Project(req.body);
    newProject.save((err, project) => {
        if(err)  return res.status(400).send();

        //update to users
        //TODO rethink this structure
        let faultyEntry = [];
        project.users.forEach((projectUser) => {
            User.findOne({userId: projectUser.userId}, (err, user) => {
                if(!err) {
                    user.projectIds.push('' + project.id);
                    user.save();
                }
                else  return res.status(500).send();
            });
        });
        project.users = project.users.filter(user => !faultyEntry.includes(user));

        res.status(201).json(project);
    });
}

/**
 * GET /projects/:id retrieve a project given its id
 */
function getProject(req, res, next) {
    Project.findById(req.params.id, (err, project) => {
        if(err || !project)  return res.status(404).send();
        res.status(200).json(project);
    });
}

/**
 * DELETE /projects/:id delete a project given its id
 */
function deleteProject(req, res, next) {
    Project.deleteOne({_id: req.params.id}, (err, result) => {
        if(err)  return res.status(404).send();
        
        //TODO: delete the record of the project in users and tasks databases

        res.status(204).json(result);
    });
}

/**
 * PUT /projects/:id update a project given its id
 */
function updateProject(req, res, next) {
    if(req.body.users || req.body.taskIds)  return res.status(400).send();
    
    Project.findOne({_id: req.params.id}, (err, project) => {
        if(err || !project)  return res.status(404).send();
        Object.assign(project, req.body).save((err, project) => {
            if(err)  return res.status(500).send();

            //TODO if project is completed, change the completion status of all tasks

            res.status(200).json(project);
        });
    });
}

/**
 * GET /projects/:id/users retreieve all users working on the project
 */
function getUsers(req, res, next) {
    Project.findById(req.params.id, (err, project) => {
        if(err || !project)  return res.status(404).send();
        res.status(200).json(project.users);
    });
}

/**
 * POST /projects/:id/users include an user into a project
 */
function includeUser(req, res, next) {
    const userId = req.body && req.body.userId;
    let savedUser;
    User.findOne({userId: userId}, (err, user) => {
        if(err || !userId || !user)  return res.status(400).send();
        savedUser = user;
    });

    Project.findById(req.params.id, (err, project) => {
        if(err || !project)  return res.status(404).send();
        
        const newProjectUser = {
            userId: userId,
            roles: req.body.roles,
            taskIds: req.body.taskIds
        }
        project.users.push(newProjectUser);
        project.save((err, project) => {
            if(err)   return res.status(500).send();
        });

        //TODO update projectId and taskIds to savedUser
        savedUser.projectIds.push(project.id);

        res.status(200).json(newProjectUser);
    });
}

module.exports = { getProjects, createNewProject, getProject, deleteProject, updateProject, getUsers, includeUser };