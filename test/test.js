process.env.NODE_ENV = 'test';

const User = require('../app/models/users.js');
const Project = require('../app/models/projects.js');

//Require the dev-dependencies
const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../server');
const should = chai.should();

chai.use(chaiHttp);

describe('Testing all APIs', () => {
    let testUser = new User({ userId: 'dung.doan', name: 'Doan Dung', pass: '123456' });
    let testProject = new Project({ name: 'Task server', content: 'Build a complete task managing server', users: [] });
    beforeEach((done) => {
        setupTestDatabase(done, testUser, testProject);
    });

    describe('Testing /users APIs', () => {
        it('should GET all the users', (done) => {
            chai.request(server)
                .get('/users')
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('array');
                    res.body.length.should.be.eql(1);
                    done();
                });
        });

        it('should POST a new user', (done) => {
            const newUser = {
                userId: 'vu.tran',
                name: 'Tran Vu',
                pass: '13579',
            };
            chai.request(server)
                .post('/users')
                .send(newUser)
                .end((err, res) => {
                    res.should.have.status(201);
                    res.body.should.be.a('object');
                    res.body.should.have.property('userId').eql('vu.tran');
                    res.body.should.have.property('name').eql('Tran Vu');
                    res.body.should.have.property('projectIds').eql([]);
                    done();
                });
        });

        it('should NOT POST a new user without id', (done) => {
            const newUser = { name: 'Tran Vu', pass: '13579' };
            chai.request(server)
                .post('/users')
                .send(newUser)
                .end((err, res) => {
                    res.should.have.status(400);
                    done();
                });
        });

        it('should NOT POST a new user with similar id', (done) => {
            const newUser = { userId: 'dung.doan', name: 'Tran Vu', pass: '13579' };
            chai.request(server)
                .post('/users')
                .send(newUser)
                .end((err, res) => {
                    res.should.have.status(400);
                    done();
                });
        });

        it('should GET an user given correct id', (done) => {
            chai.request(server)
                .get('/users/' + testUser.userId)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('userId').eql('dung.doan');
                    res.body.should.have.property('name').eql('Doan Dung');
                    res.body.should.have.property('projectIds').eql([]);
                    done();
                });
        });

        it('should NOT GET an user given incorrect id', (done) => {
            chai.request(server)
                .get('/users/' + 'vu.tran')
                .end((err, res) => {
                    res.should.have.status(404);
                    done();
                });
        });

        it('should DELETE an user given correct id', (done) => {
            chai.request(server)
                .delete('/users/' + testUser.userId)
                .end((err, res) => {
                    res.should.have.status(204);
                    done();
                });
        });


        //TODO: question is: if we delete someone who never exist, is it a success?

        // it('should NOT DELETE an user given incorrect id', (done) => {
        //     chai.request(server)
        //         .delete('/users/' + 'vu.tran')
        //         .end((err, res) => {
        //             res.should.have.status(404);
        //             done();
        //         });
        // });

        it('should PUT a new user given correct id', (done) => {
            const newUser = { name: 'Tran Vu', pass: '13579' };
            chai.request(server)
                .put('/users/' + testUser.userId)
                .send(newUser)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('userId').eql('dung.doan');
                    res.body.should.have.property('name').eql('Tran Vu');
                    res.body.should.have.property('projectIds').eql([]);
                    done();
                });
        });

        it('should NOT PUT a new user given a change of userId', (done) => {
            const newUser = { userId: 'vu.tran', name: 'Tran Vu', pass: '13579' };
            chai.request(server)
                .put('/users/' + testUser.userId)
                .send(newUser)
                .end((err, res) => {
                    res.should.have.status(400);
                    done();
                });
        });

        it('should NOT PUT a new user given a change of projectIds', (done) => {
            const newUser = { name: 'Tran Vu', pass: '13579', projectIds: [1,2,3] };
            chai.request(server)
                .put('/users/' + testUser.userId)
                .send(newUser)
                .end((err, res) => {
                    res.should.have.status(400);
                    done();
                });
        });

        it('should GET all the projects of an user', (done) => {
            chai.request(server)
                .get('/users/' + testUser.userId + '/projects')
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('array');
                    res.body.length.should.be.eql(0);
                    done();
                });
        });







    });

    describe('Testing /projects APIs', () => {
        it('should GET all the projects', (done) => {
            chai.request(server)
                .get('/projects')
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('array');
                    res.body.length.should.be.eql(1);
                    done();
                });
        });

        it('should POST a new project', (done) => {
            const newProject = {
                name: 'Creating Gant charts',
                content: 'Creating Gant charts to provide visualizations of work progress',
                users: [ {userId: 'dung.doan', roles: ['developer']} ],
            };
            chai.request(server)
                .post('/projects')
                .send(newProject)
                .end((err, res) => {
                    res.should.have.status(201);
                    res.body.should.be.a('object');
                    res.body.should.have.property('_id');
                    res.body.should.have.property('name').eql('Creating Gant charts');
                    res.body.should.have.property('users');
                    res.body.should.have.property('budget');
                    done();
                });
        });

        it('should NOT POST a new project without a name', (done) => {
            const newProject = {
                content: 'Creating Gant charts to provide visualizations of work progress',
            };
            chai.request(server)
                .post('/projects')
                .send(newProject)
                .end((err, res) => {
                    res.should.have.status(400);
                    done();
                });
        });

        it('should GET a project given correct id', (done) => {
            chai.request(server)
                .get('/projects/' + testProject._id)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('_id').eql(testProject.id);
                    res.body.should.have.property('name').eql('Task server');
                    res.body.should.have.property('taskIds').eql([]);
                    done();
                });
        });


    });


});

function setupTestDatabase(done, testUser, testProject) {
    User.deleteMany({}, (err) => {
        if(err)  done();
    });
    let user = new User(testUser)
    user.save();

    Project.deleteMany({}, (err) => {
        if(err)  done();
    });
    let project = new Project(testProject)
    project.save();
    done();
}