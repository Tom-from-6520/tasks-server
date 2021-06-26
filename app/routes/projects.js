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

    let users = [].concat(newProject.users);
    users.forEach(projectUser => {
        updateUserDB(projectUser.userId, newProject);
    });

    newProject.save((err, project) => {
        if(err)  return res.status(400).send(err);
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
    Project.findById(req.params.id, (err, project) => {
        if(!err && project) {
            let users = [].concat(project.users);
            users.forEach(projectUser => {
                updateUserDB(projectUser.userId, project, projectUser.taskIds, true);
            });
            //TODO: delete the record of the project in tasks databases
        }
    });

    Project.deleteOne({_id: req.params.id}, (err, result) => {
        if(err)  return res.status(404).send();
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
    User.findById(userId, (err, user) => {
        if(err || !userId || !user)  return res.status(400).send();

        Project.findById(req.params.id, (err, project) => {
            if(err || !project)  return res.status(404).send();
            
            updateUserDB(userId, project.id, req.body.taskIds);

            //TODO: update tasks database

            const userIndex = project.users.findIndex(user => user.userId === userId);
            console.log(userIndex);
            if(userIndex === -1) {
                console.log('ec');
                const newProjectUser = {
                    userId: userId,
                    roles: req.body.roles,
                    taskIds: req.body.taskIds
                }
                project.users.push(newProjectUser);
                project.save((err, project) => {
                    if(err)   return res.status(500).send();
                    res.status(201).json(newProjectUser);
                });
            }
            else {
                console.log('ec ec');
                projectUser = project.users[userIndex];
                projectUser.roles = projectUser.roles.concat(req.body.roles);
                projectUser.taskIds = projectUser.taskIds.concat(req.body.taskIds);
                project.save((err, project) => {
                    if(err)   return res.status(500).send();
                    res.status(200).json(projectUser);
                });
            }
        });
    });
}

module.exports = { getProjects, createNewProject, getProject, deleteProject, updateProject, getUsers, includeUser };

//helper functions
function updateUserDB(userId, project, taskIds=[], toDelete=false) {
    User.findById(userId, (err, user) => {
        if(!err && user) {
            if(toDelete) {
                user.projectIds = user.projectIds.filter(id => id !== project.id);
                user.save();
            }
            else {
                user.projectIds.push('' + project.id);
                // user.taskIds = user.taskIds.concat(taskIds);
                user.save();
            }
        }
        else {
            const index = project.users.findIndex(projectUser => projectUser.userId === userId);
            project.users.splice(index, 1);
        }
    });
}