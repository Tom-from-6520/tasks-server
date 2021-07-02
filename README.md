# Projects and Tasks Managing Server

## Introduction
This project is an assignment for internship in YITEC. 
I hope that it can be useful for the company's operations.

## Tech specs
* Server framework: Express.js of Node.js
* Database framework: Mongoose on MongoDB

## Setup
Node and MongoDB server should be ready for setup.

To install all dependecies of the project, enter the following bash lines:
```
$ cd ../[install_folder]
$ npm install
```
The file `config.json` have to be modified into host's MongoDB URI. Make sure to delete the old `projects` and `users` collections in the database to give the server a fresh start.

After installation and modification, to test this project, enter `npm start` to run the server, then enter `npm test` to run the postman API tests.

## Update log
Version 1.1 include new tests created from Postman and run by newman package. This version also eliminate the `userId` in `users` database.

Version 1.2 include full features of projects, users and tasks. All of the features are tested through API tests.

## Future work
There are some important TODOs to this project:
- [x] Finishing the API tests
- [ ] Figuring out how to create encrypted passwords and authetications for users
- [ ] Adding automatic Swagger