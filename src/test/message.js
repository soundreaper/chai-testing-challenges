require('dotenv').config()
const app = require('../server.js')
const mongoose = require('mongoose')
const chai = require('chai')
const chaiHttp = require('chai-http')
const assert = chai.assert

const User = require('../models/user.js')
const Message = require('../models/message.js')

chai.config.includeStack = true

const expect = chai.expect
const should = chai.should()
chai.use(chaiHttp)

/**
 * root level hooks
 */
after((done) => {
  // required because https://github.com/Automattic/mongoose/issues/1251#issuecomment-65793092
  mongoose.models = {}
  mongoose.modelSchemas = {}
  mongoose.connection.close()
  done();
})


describe('Message API endpoints', () => {
    beforeEach((done) => {
        const test = new Message({
            title: "test", 
            body: "testing",
            author: "tester",
            _id: testID
        })
        test.save()
        done();
    })

    afterEach((done) => {
        Message.deleteOne({ _id: testID })
        done()
    })

    it('should load all messages', (done) => {
        chai.request(app)
            .get('/')
            .end((err, res) => {
                if (err) done(err);
                expect(res).to.have.status(200);
                expect(res.body.msgs).to.be.an('array');
                done();
            })
    })

    it('should get one specific message', (done) => {
        chai.request(app)
            .get(`/${testID}}`)
            .end((err, res) => {
                if (err) done(err);
                expect(res).to.have.status(200);
                expect(res.body.title).to.equal('test');
                expect(res.body.body).to.equal('testing');
                expect(res.body.author).to.equal('tester');
                done();
            });
    })

    it('should post a new message', (done) => {
        chai.request(app)
            .post('/')
            .send({title: 'why bears are cool', body: 'because they are', author: 'kuma-kun'})
            .end((err, res) => {
                if (err) done(err);
                expect(res).to.have.status(200);
                expect(res.body.title).to.equal('why bears are cool');
                expect(res.body.body).to.equal('because they are');
                expect(res.body.author).to.equal('kuma-kun');
                done();
            })
    })

    it('should update a message', (done) => {
        chai.request(app)
            .put(`/${testID}}`)
            .send({title: 'no test'})
            .end((err, res) => {
                if (err) done(err);
                expect(res).to.have.status(200);
                expect(res.body.title).to.equal('no test');
                expect(res.body.body).to.equal('testing');
                expect(res.body.author).to.equal('tester');
                done();
            })
    })

    it('should delete a message', (done) => {
        chai.request(app)
            .delete(`/messages/${testID}}`)
            .send({title: 'no test'})
            .end((err, res) => {
                if (err) done(err);
                expect(res.body.message).to.equal('Message deleted');
                
                Message.findOne({ title: 'test' }).then((msg) => {
                    expect(msg).to.equal(null);
                    done();
                })
            })
    })
})