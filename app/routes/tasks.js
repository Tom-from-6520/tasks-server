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
function createTask(req, res, next) {
    if(req.body.projectId)  return res.status(400).send();

    req.body.projectId = req.params.id;
    const newTask = new Task(req.body);

    Project.findById(req.params.id, (err, project) => {
        if(err || !project)  return res.status(404).send();
        project.taskIds.push(newTask.id);  //update taskId to the project
        
        newTask.userIds.forEach(userId => {
            updateTask2UserDB(userId, newTask, newTask.projectId);  //update the taskId to the user
            const userIndex = project.users.findIndex(user => user.userId === userId);  //update user to the project
            if(userIndex === -1) {
                const newProjectUser = {
                    userId: userId,
                    taskIds: [newTask.id]
                }
                project.users.push(newProjectUser);
                project.save();
                newTask.save((err, task) => {
                    if(err)   return res.status(500).send();
                    res.status(201).json(task);
                });
            }
            else {
                projectUser = project.users[userIndex];
                projectUser.taskIds.push(newTask.id);
                project.save();
                newTask.save((err, task) => {
                    if(err)   return res.status(500).send();
                    res.status(201).json(task);
                });
            }
        });
        if(newTask.userIds.length == 0) {
            project.save();
            newTask.save((err, task) => {
                if(err)   return res.status(500).send();
                res.status(201).json(task);
            });
        }
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

module.exports = { getTasks, getIncompleteTasks, getCompletedTasks, createTask, getTask };

//helper functions
/**
 * Update to the User database
 * @param {string}      userId      the id of the updating user
 * @param {TaskSchema}  task        the task for update
 * @param {String}      projectId   the projectId of the task
 * @param {boolean}     toDelete    whether the update is deletion or insertion
 */
 function updateTask2UserDB(userId, task, projectId, toDelete=false) {
    User.findById(userId, (err, user) => {
        if(!err && user && toDelete) {
            user.taskIds = user.taskIds.filter(id => id !== task.id);
            user.save();
        }
        else if (!err && user && !toDelete) {
            user.taskIds.push('' + task.id);
            user.projectIds.push('' + projectId);
            user.save();
        }
        else if(!toDelete) {
            task.userIds = task.userIds.filter(id => id !== userId);
        }
    });
}

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