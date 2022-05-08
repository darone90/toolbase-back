import { WorkersRecord } from '../database/worker.record';
import { pool } from '../utils/db';

let id1: string;
let id2: string;

test('creating worker instance with to short name validation test', () => {
    expect(() => {
        new WorkersRecord({ name: 'ab' });
    }).toThrow();
});

test('creating worker instance with to long name validation test', () => {
    expect(() => {
        new WorkersRecord({ name: 'hgtgfsredeeerrrrrrrtttttttsssmnijuyhgtfrdearsftwgtssss' });
    }).toThrow();
});

test('creating new instance of worker and saving in database', async () => {
    const workerTest = new WorkersRecord({ name: 'Janusz' });
    id1 = await workerTest.add()
    expect(id1).toMatch(/^[a-fA-F0-9]{8}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{12}$/);
});

test('creating new instance of worker and finding it in database', async () => {
    const workerTest = new WorkersRecord({ name: 'Łukasz' });
    id2 = await workerTest.add()
    expect(id2).toMatch(/^[a-fA-F0-9]{8}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{12}$/);

    const newWorkerTest = await WorkersRecord.getOne(id2);

    expect(newWorkerTest).toBeDefined;
    expect(newWorkerTest).not.toBeNull;

});

test('getting list of all worker', async () => {
    const workersList = await WorkersRecord.getAll();
    expect(workersList.length).toBeGreaterThan(1);

});

test('deleteing tested workres from database', async () => {
    const worker1 = await WorkersRecord.getOne(id1);
    const worker2 = await WorkersRecord.getOne(id2);

    const deletedId1 = await worker1.delete();
    const deletedId2 = await worker2.delete();

    expect(deletedId1).toMatch(/^[a-fA-F0-9]{8}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{12}$/);
    expect(deletedId2).toMatch(/^[a-fA-F0-9]{8}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{12}$/);

    expect(await WorkersRecord.getOne(deletedId1)).toBeNull();
    expect(await WorkersRecord.getOne(deletedId2)).toBeNull();

});

afterAll(async () => {
    await pool.end();
})