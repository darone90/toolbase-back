import request from 'supertest';
import app from '../app';

import { pool } from '../utils/db';
import { HistoryRecord } from '../database/history.record';
import { WorkersRecord } from '../database/worker.record';
import { ToolsRecord } from '../database/tool.record';

const testWorkerNameOne = 'Janusz Kowalski';
const testWorkerNameTwo = 'Jarosław Kaczyński';
let testWorkerID1: string;
let testWorkerID2: string;

let tool1: string;

let historyID1: string;


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

beforeAll(async () => {
    const testingWorkerOne = new WorkersRecord({ name: testWorkerNameOne });
    testWorkerID1 = await testingWorkerOne.add();
    const testingWorkerTwo = new WorkersRecord({ name: testWorkerNameTwo });
    testWorkerID2 = await testingWorkerTwo.add();
    const testingTool = new ToolsRecord(testData1);
    tool1 = await testingTool.add();

    const history1 = new HistoryRecord({ id: tool1, name: testWorkerNameOne });
    const history2 = new HistoryRecord({ id: tool1, name: testWorkerNameTwo });

    await history1.add();
    historyID1 = await history2.add();

    await history1.addEnd();
})

test('getting list of archived records', async () => {
    await request(app)
        .get(`/history/${testWorkerNameOne}`)
        .expect('Content-Type', /json/)
        .expect(200)
        .then((resp) => JSON.parse(resp.text))
        .then(data => {
            expect(data).not.toBeNull();
            expect(data.length).toBeGreaterThan(0);
        })
});

test('getting list of actual record', async () => {
    await request(app)
        .post(`/history/actual`)
        .send({ name: testWorkerNameTwo })
        .expect('Content-Type', /json/)
        .expect(200)
        .then((resp) => JSON.parse(resp.text))
        .then(data => {
            expect(data).not.toBeNull();
            expect(data.length).toBeGreaterThan(0);
        })
});

test('deleting archived', async () => {
    await request(app)
        .delete(`/history/${testWorkerNameOne}`)
        .expect('Content-Type', /json/)
        .expect(200)
        .expect({ ok: true })

    await request(app)
        .get(`/history/${testWorkerNameOne}`)
        .expect('Content-Type', /json/)
        .expect(200)
        .then((resp) => JSON.parse(resp.text))
        .then(data => {
            expect(data.length).toEqual(0);
        })
});

afterAll(async () => {
    const secondHistoryInstance = await HistoryRecord.getOne(historyID1);
    await secondHistoryInstance.addEnd();
    await HistoryRecord.clear(testWorkerNameTwo);

    const testedTool = await ToolsRecord.getOne(tool1);
    await testedTool.delete();


    const worker1 = await WorkersRecord.getOne(testWorkerID1);
    const worker2 = await WorkersRecord.getOne(testWorkerID2);

    await worker1.delete();
    await worker2.delete();


    pool.end()
})