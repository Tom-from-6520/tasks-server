const Project = require('../models/projects.js');
const User = require('../models/users.js');
const Task = require('../models/tasks.js');

/**
 * GET /projects retrieve all the projects
 */
function getProjects(req, res, next) {
    req.all = true;
    getManyProjects(req, res);
}

/**
 * GET /projects/incomplete retrieve all completed projects
 */
 function getIncompleteProjects(req, res, next) {
    req.all = false;
    req.completed = false;
    getManyProjects(req, res);
}

/**
 * GET /projects/completed retrieve all completed projects
 */
function getCompletedProjects(req, res, next) {
    req.all = false;
    req.completed = true;
    getManyProjects(req, res);
}

/**
 * POST /projects create a new project
 */
 function createNewProject(req, res, next) {
    const newProject = new Project(req.body);

    // let users = [].concat(newProject.users);
    newProject.users.forEach(projectUser => {
        updateProject2UserDB(projectUser.userId, newProject);
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
        if(err || !project)  return res.status(404).send();

        let users = [].concat(project.users);
        let taskIds = [].concat(project.taskIds);
        users.forEach(projectUser => {
            updateProject2UserDB(projectUser.userId, project, taskIds, true);
        });
        
        Task.deleteMany({_id: project.taskIds}, (err, result) => {
            if(err)  return res.status(500).send();
            Project.deleteOne({_id: req.params.id}, (err, result) => {
                if(err)  return res.status(500).send();
                res.status(204).send();
            });
        });
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
            
            updateProject2UserDB(userId, project, req.body.taskIds);

            //TODO: update tasks database

            const userIndex = project.users.findIndex(user => user.userId === userId);
            if(userIndex === -1) {
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

/**
 * GET /projects/:id/users/:index retrieve the user users[index] of the project
 */
function getUser(req, res, next) {
    const index = parseInt(req.params.index);
    Project.findById(req.params.id, (err, project) => {
        if(err || !project)  return res.status(404).send();
        if(index < 0 || index >= project.users.length)  return res.status(404).send();
        res.status(200).json(project.users[index]);
    });
}

/**
 * DELETE /projects/:id/users/:index exclude the user users[index] from the project
 */
function deleteUser(req, res, next) {
    const index = parseInt(req.params.index);
    Project.findById(req.params.id, (err, project) => {
        if(err || !project)  return res.status(404).send();
        if(index < 0 || index >= project.users.length)  return res.status(404).send();
        
        updateProject2UserDB(project.users[index].userId, project, project.users[index].taskIds, true);
        //TODO update changes to tasks DB

        project.users.splice(index, 1);
        project.save((err, project) => {
            if(err)  return res.status(500).send();
            res.status(204).send();
        });
    });
}

/**
 * PUT /projects/:id/users/:index update for the project user users[index]
 */
function updateUser(req, res, next) {
    if(req.body.userId)  return res.status(400).send();
    const index = parseInt(req.params.index);
    Project.findById(req.params.id, (err, project) => {
        if(err || !project)  return res.status(404).send();
        if(index < 0 || index >= project.users.length)  return res.status(404).send();

        Object.assign(project.users[index], req.body);
        //TODO update any change of the taskIds

        project.save((err, project) => {
            if(err)  return res.status(500).send();
            res.status(200).json(project.users[index]);
        });
    });
}

/**
 * GET /projects/:id/tasks retrieve all tasks of a project
 */
function getTasks(req, res, next) {
    req.all = true;
    getManyTasks(req, res);
}

/**
 * GET /projects/:id/tasks/incomplete retrieve all incomplete tasks of a project
 */
 function getIncompleteTasks(req, res, next) {
    req.all = false;
    req.completed = false;
    getManyTasks(req, res);
}

/**
 * GET /projects/:id/tasks/completed retrieve all completed tasks of a project
 */
 function getCompletedTasks(req, res, next) {
    req.all = false;
    req.completed = true;
    getManyTasks(req, res);
}

module.exports = { getProjects, getCompletedProjects, getIncompleteProjects, createNewProject, getProject, deleteProject, updateProject, 
                    getUsers, includeUser, getUser, deleteUser, updateUser,
                    getTasks, getIncompleteTasks, getCompletedTasks };

//helper functions
/**
 * Retrieve many projects at once
 * @param {boolean} req.all         whether the response contain all projects
 * @param {boolean} req.completed   whether the response contain completed or incomplete projects
 */
function getManyProjects(req, res) {
    let query;
    if(req.all)  query = Project.find({});
    else  query = Project.find({completed: req.completed});

    query.exec((err, projects) => {
        if(err || !projects)  return res.status(404).send(err);
        res.status(200).json(projects);
    });
}

/**
 * Update to the User database
 * @param {string}          userId      the id of the updating user
 * @param {ProjectSchema}   project     the project for update
 * @param {[string]}        taskIds     the array of taskId for update
 * @param {boolean}         toDelete    whether the update is deletion or insertion
 */
function updateProject2UserDB(userId, project, taskIds=[], toDelete=false) {
    User.findById(userId, (err, user) => {
        if(!err && user && toDelete) {
            user.projectIds = user.projectIds.filter(id => id !== project.id);
            user.taskIds = user.taskIds.filter(id => !taskIds.includes(id));
            user.save();
        }
        else if (!err && user && !toDelete) {
            user.projectIds.push('' + project.id);
            user.taskIds = user.taskIds.concat(taskIds);
            user.save();
        }
        else if(!toDelete) {
            project.users = project.users.filter(projectUser => projectUser.userId !== userId);
        }
    });
}

/**
 * Retrieve the many tasks at once
 * @param {boolean} req.all         whether the response contain all tasks
 * @param {boolean} req.completed   whether the response contain completed or incomplete tasks
 */
 function getManyTasks(req, res) {
    Project.findById(req.params.id, (err, project) => {
        if(err || !project)  return res.status(404).send();
        if(req.all) {
            res.status(200).json(project.taskIds);
        }
        else {
            Task.find({_id: project.taskIds, completed: req.completed}, (err, tasks) => {
                if(!err && tasks)  res.status(200).json(tasks.map(task => task.id));
            });
        }
    });
}