# Projects and Tasks Managing Server

## Introduction
This project is an assignment for internship in Yitec.
I hope that it can be useful for the company's operations.

## Tech specs
* Server framework: Express.js of Node.js
* Database framework: Mongoose on MongoDB

## Setup
Node and MongoDB server should be ready for setup
To install all dependecies of the project, enter the following bash lines:
```
$ cd ../[install_folder]
$ npm install
```
The files `dev.json` and `test.json` inside folder `config` have to be modified into host's MongoDB URI.

After installation and modification, to test this project, simply enter: `npm test`
To run this project, enter: `npm start`

## Future work
There are some important TODOs to this project
[ ] Finishing the `/projects` routes
[ ] Finishing the unit tests
[ ] Figuring out how to create encrypted passwords and authetications for users