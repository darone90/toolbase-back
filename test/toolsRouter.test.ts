import request from 'supertest';
import app from '../app';

import { pool } from '../utils/db';
import { ToolsRecord } from '../database/tool.record';
import { WorkersRecord } from '../database/worker.record';

const testWorkerNameOne = 'Janusz Kowalski';
const testWorkerNameTwo = 'Jarosław Kaczyński';
let testWorkerID1: string;
let testWorkerID2: string;

let tool1: string;


const testData1 = {
    sign: "220099",
    name: testWorkerNameOne,
    status: "Budowa",
    place: 'Kunice',
    type: 'Szlifierka',
    subtype: 'Kątowa',
    brand: 'Bosh',
    serial: 'se292999243211',
}

const actualizePackage = {
    name: testWorkerNameTwo,
    status: 'changed',
    place: 'changed'
}

beforeAll(async () => {
    const testingWorkerOne = new WorkersRecord({ name: testWorkerNameOne });
    testWorkerID1 = await testingWorkerOne.add();
    const testingWorkerTwo = new WorkersRecord({ name: testWorkerNameTwo });
    testWorkerID2 = await testingWorkerTwo.add();

})

test('adding new tool to database', async () => {
    await request(app)
        .post('/tools')
        .send(testData1)
        .expect('Content-Type', /json/)
        .expect(200)
        .then((resp) => JSON.parse(resp.text))
        .then(data => {
            expect(data.id).toMatch(/^[a-fA-F0-9]{8}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{12}$/)
            tool1 = data.id;
        })
});

test('actualize statuses data in record', async () => {
    await request(app)
        .patch('/tools')
        .send({ ...actualizePackage, id: tool1 })
        .expect('Content-Type', /json/)
        .expect(200)
        .then((resp) => JSON.parse(resp.text))
        .then(data => {
            expect(data.id).toMatch(/^[a-fA-F0-9]{8}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{12}$/)
            expect(data.id).toEqual(tool1);
        })
});

test('getting list of tools', async () => {
    await request(app)
        .get('/tools')
        .expect('Content-Type', /json/)
        .expect(200)
        .then((resp) => JSON.parse(resp.text))
        .then(data => {
            expect(data.length).toBeGreaterThan(0);

        })
})

test('deleting tool', async () => {
    await request(app)
        .delete('/tools')
        .send({ id: tool1 })
        .expect('Content-Type', /json/)
        .expect(200)
        .then((resp) => JSON.parse(resp.text))
        .then(data => {
            expect(data.id).toEqual(tool1);
        })

    const finding = await ToolsRecord.getOne(tool1);
    expect(finding).toBeNull();

})

afterAll(async () => {

    const deletingFirstWorker = await WorkersRecord.getOne(testWorkerID1);
    const deletingSecondWorker = await WorkersRecord.getOne(testWorkerID2);

    await deletingFirstWorker.delete();
    await deletingSecondWorker.delete();

    pool.end()
})