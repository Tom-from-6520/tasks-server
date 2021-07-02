const Task = require('../models/tasks.js');
const Project = require('../models/projects.js');
const User = require('../models/users.js');

/**
 * GET /tasks retrieve all tasks
 */
function getTasks(req, res, next) {
    req.all = true;
    getManyTasks(req, res);
}

/**
 * GET /tasks/incomplete retrieve all incomplete tasks
 */
function getIncompleteTasks(req, res, next) {
    req.all = false;
    req.completed = false;
    getManyTasks(req, res);
}

/**
 * GET /tasks/completed retrieve all completed tasks
 */
function getCompletedTasks(req, res, next) {
    req.all = false;
    req.completed = true;
    getManyTasks(req, res);
}

/**
 * POST /projects/:id/tasks create new task in a project
 */
function createTask(req, res) {
    const newTask = new Task(req.body);

    Project.findById(newTask.projectId, (err, project) => {
        if(err || !project)  return res.status(404).send();
        project.taskIds.push(newTask.id);  //update taskId to the project
        
        newTask.userIds.forEach(userId => {
            updateOtherDB([userId], newTask, newTask.projectId);
        });
        project.save();
        newTask.save((err, task) => {
            if(err)   return res.status(500).send();
            res.status(201).json(task);
        });
    });
}

/**
 * GET /tasks/:id retrieve a task given the id
 */
function getTask(req, res, next) {
    Task.findById(req.params.id, (err, task) => {
        if(err || !task)  return res.status(404).send();
        res.status(200).json(task);
    });
}

function updateTask(req, res) {
    Task.findById(req.id, (err, task) => {
        if(err || !task)  return res.status(404).send();

        if(req.body.userIds) {
            const oldUserIds = [].concat(task.userIds);
            const newUserIds = [].concat(req.body.userIds);
            const userToRemove = oldUserIds.filter(id => !newUserIds.includes(id));
            const userToAdd = newUserIds.filter(id => !oldUserIds.includes(id));
            
            updateOtherDB(userToRemove, task, task.projectId, true);
            updateOtherDB(userToAdd, task, task.projectId);
        }
        Object.assign(task, req.body);
        task.save((err, task) => {
            if(err || !task)  return res.status(500).send();
            res.status(200).json(task);
        });
    });
}

function deleteTask(req, res) {
    Task.findById(req.id, (err, task) => {
        if(err || !task)  return res.status(404).send();

        const userIds = [].concat(task.userIds);
        updateOtherDB(userIds, task, task.projectId, true);

        Task.deleteOne({_id: task.id}, (err, result) => {
            if(err)  return res.status(500).send();
            res.status(204).send();
        });
    });
}

module.exports = { getTasks, getIncompleteTasks, getCompletedTasks, createTask, getTask, updateTask, deleteTask };

//helper functions
/**
 * Retrieve the many tasks at once
 * @param {boolean} req.all         whether the response contain all tasks
 * @param {boolean} req.completed   whether the response contain completed or incomplete tasks
 */
function getManyTasks(req, res) {
    let query;
    if(req.all)  query = Task.find({});
    else  query = Task.find({completed: req.completed});

    query.exec((err, tasks) => {
        if(err || !tasks)  return res.status(404).send(err);
        res.status(200).json(tasks);
    });
}

/**
 * Update to the User database
 * @param {string}      userId      the id of the updating user
 * @param {TaskSchema}  task        the task for update
 * @param {String}      projectId   the projectId of the task
 * @param {boolean}     toDelete    whether the update is deletion or insertion
 */
function updateOtherDB(userIds, task, projectId, toDelete=false) {
    userIds.forEach(userId => {
        User.findById(userId, (err, user) => {
            if(!err && user && toDelete) {
                user.taskIds = user.taskIds.filter(id => id !== task.id);
                user.save((err, user) => {
                    Project.findById(projectId, (err, project) => {
                        const userIndex = project.users.findIndex(user => user.userId === userId);
                        if(userIndex !== -1) {
                            projectUser = project.users[userIndex];
                            projectUser.taskIds = projectUser.taskIds.filter(id => id !== task.id);
                            project.save();
                        }
                    });
                });
            }
            else if (!err && user && !toDelete) {
                user.taskIds.push('' + task.id);
                user.projectIds.push('' + projectId);
                user.save((err, user) => {
                    Project.findById(projectId, (err, project) => {
                        const userIndex = project.users.findIndex(user => user.userId === userId);  //update user to the project
                        if(userIndex === -1) {
                            const newProjectUser = {
                                userId: userId,
                                taskIds: [task.id]
                            }
                            project.users.push(newProjectUser);
                            project.save();
                        }
                        else {
                            projectUser = project.users[userIndex];
                            projectUser.taskIds.push(task.id);
                            project.save();
                        }
                    });
                });
            }
            else if(!toDelete) {
                task.userIds = task.userIds.filter(id => id !== userId);
            }
        });
    });
}