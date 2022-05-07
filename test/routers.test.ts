import request from 'supertest';
import app from '../app';
import { appSettings } from '../utils/config';
import { UserRecord } from '../database/user.record';
import { pool } from '../utils/db';
import { TypesRecord } from '../database/types.record';

const testingData = {
    login: 'TestTest',
    password: '12345678'
};

const testingData1 = { name: 'Szlifierka', types: ['kątowa', 'prosta', 'taśmowa'] };
const testingData2 = { name: 'Spawarka', types: ['TIG', 'MMA', 'MIG/MAG'] };
let id1: string;
let id2: string;
let id3: string;

beforeAll(async () => {
    const newUser = new UserRecord(testingData);
    await newUser.add();

    const newUser1 = new TypesRecord(testingData1);
    const newUser2 = new TypesRecord(testingData2);

    id1 = await newUser1.add();
    id2 = await newUser2.add();
})


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

test('adding new type to database', async () => {
    await request(app)
        .post('/category')
        .send({ name: 'xxxx', subtypes: ['aaa', 'bbb', 'ccc'] })
        .expect('Content-Type', /json/)
        .expect(200)
        .then((resp) => JSON.parse(resp.text))
        .then(data => {
            expect(data.id).toMatch(/^[a-fA-F0-9]{8}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{12}$/)
            id3 = data.id
        })
        .finally(() => { return })
});

test('patch record by changing name and subtypes', async () => {
    await request(app)
        .patch('/category')
        .send({ name: 'newName', subtypes: ['111', '22222', '33333'], id: id3 })
        .expect('Content-Type', /json/)
        .expect(200)
        .then(response => JSON.parse(response.text))
        .then(data => {
            expect(data.id).toMatch(/^[a-fA-F0-9]{8}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{12}$/)
            expect(data.id).toEqual(id3)
        })
        .finally(() => { return })

    const patched = await TypesRecord.getOne(id3);
    const data = patched.showData
    expect(data.types).toEqual(['111', '22222', '33333']);
    expect(data.name).toEqual('newName');
});

test('patch record by removing one of subtypes', async () => {
    await request(app)
        .patch('/category/part')
        .send({ id: id3, subtype: '111' })
        .expect('Content-Type', /json/)
        .expect(200)
        .then(response => JSON.parse(response.text))
        .then(data => {
            expect(data.id).toMatch(/^[a-fA-F0-9]{8}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{12}$/)
            expect(data.id).toEqual(id3)
        })
        .finally(() => { return })

    const patched = await TypesRecord.getOne(id3);
    const data = patched.showData
    expect(data.types).toEqual(['22222', '33333']);
    expect(data.name).toEqual('newName');
});

test('getting all types list', async () => {
    await request(app)
        .get('/category')
        .expect('Content-Type', /json/)
        .expect(200)
        .then(response => JSON.parse(response.text))
        .then(data => {
            expect(data.length).toEqual(3);
        })
        .finally(() => { return })
});

test('deleting added types', async () => {
    const idArr = [id1, id2, id3];
    idArr.forEach(id => {
        request(app)
            .delete('/category')
            .send({ id: id })
            .expect('Content-Type', /json/)
            .expect(200)
            .then(response => JSON.parse(response.text))
            .then(data => {
                expect(data.id).toEqual(id);
            })
            .finally(() => { return })
    });

    const first = await TypesRecord.getOne(id1);
    const second = await TypesRecord.getOne(id2);
    const third = await TypesRecord.getOne(id3);

    expect(first).toBeNull
    expect(second).toBeNull
    expect(third).toBeNull

    request(app)
        .get('/category')
        .expect('Content-Type', /json/)
        .expect(200)
        .then(response => JSON.parse(response.text))
        .then(data => {
            expect(data).toBeFalsy;
        })
        .finally(() => { return })

});

afterAll(async () => {
    const testedUser = await UserRecord.getOne(testingData.login);
    await testedUser.delete();

    const first = await TypesRecord.getOne(id1);
    const second = await TypesRecord.getOne(id2);

    await first.delete();
    await second.delete();

    await pool.end();
})