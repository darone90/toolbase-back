import request from 'supertest';
import app from '../app';

import { pool } from '../utils/db';

import { appSettings } from '../utils/config';
import { UserRecord } from '../database/user.record';

const testingData = {
    login: 'TestTest',
    password: '12345678'
};

beforeAll(async () => {


    const newUser = new UserRecord(testingData);
    await newUser.add();
});

test('post login without data', async () => {
    await request(app)
        .post('/login')
        .send({ login: '', password: '' })
        .expect('Content-Type', /json/)
        .expect(200)
        .expect({ login: false, info: 'Not existed', token: null })

});

test('post login with wrong password', async () => {
    await request(app)
        .post('/login')
        .send({ login: testingData.login, password: 'wrongPassword' })
        .expect('Content-Type', /json/)
        .expect(200)
        .expect({ login: false, info: `Uncorrect`, token: null })

});

test('post to login with correct data', async () => {
    await request(app)
        .post('/login')
        .send({ login: testingData.login, password: testingData.password })
        .expect('Content-Type', /json/)
        .expect(200)
        .expect({ login: true, info: `Correct`, token: appSettings.token })

});

afterAll(async () => {
    const testedUser = await UserRecord.getOne(testingData.login);
    await testedUser.delete();

    await pool.end();
})