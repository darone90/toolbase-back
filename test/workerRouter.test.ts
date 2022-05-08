import request from 'supertest';
import app from '../app';

import { WorkersRecord } from '../database/worker.record';
import { pool } from '../utils/db';

let worker1: string;
let worker2: string;


test('post to add new worker to database', async () => {
    await request(app)
        .post('/workers')
        .send({ name: 'Januszko' })
        .expect('Content-Type', /json/)
        .expect(200)
        .then((resp) => JSON.parse(resp.text))
        .then(data => {
            expect(data.id).toMatch(/^[a-fA-F0-9]{8}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{12}$/)
            worker1 = data.id;
        })


});

test('post to add new worker with to short name expecting error', async () => {
    await request(app)
        .post('/workers')
        .send({ name: 'Ja' })
        .expect(500)
});

test('adding one more worker', async () => {
    await request(app)
        .post('/workers')
        .send({ name: 'Grzegorz Brzenczyszczykiewicz' })
        .expect('Content-Type', /json/)
        .expect(200)
        .then((resp) => JSON.parse(resp.text))
        .then(data => {
            expect(data.id).toMatch(/^[a-fA-F0-9]{8}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{12}$/)
            worker2 = data.id;
        })

})

test('reading list of workers', async () => {
    await request(app)
        .get('/workers')
        .expect('Content-Type', /json/)
        .expect(200)
        .then((resp) => JSON.parse(resp.text))
        .then(data => {
            expect(data.length).toBeGreaterThan(1);
        })
});

test('deleting creating workers from database', async () => {


    await request(app)
        .delete('/workers')
        .send({ id: worker2 })
        .expect('Content-Type', /json/)
        .expect(200)
        .then((resp) => JSON.parse(resp.text))
        .then(data => {
            expect(data.id).toMatch(/^[a-fA-F0-9]{8}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{12}$/)
            expect(data.id).toEqual(worker2);
        })

    await request(app)
        .delete('/workers')
        .send({ id: worker1 })
        .expect('Content-Type', /json/)
        .expect(200)
        .then((resp) => JSON.parse(resp.text))
        .then(data => {
            expect(data.id).toMatch(/^[a-fA-F0-9]{8}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{12}$/)
            expect(data.id).toEqual(worker1);
        })


});

test('checking delete', async () => {

    const deletingTest1 = await WorkersRecord.getOne(worker1);
    const deletingTest2 = await WorkersRecord.getOne(worker2);

    expect(deletingTest1).toBeNull();
    expect(deletingTest2).toBeNull();
});

afterAll(async () => {
    pool.end()
})
