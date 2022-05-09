import { pool } from '../utils/db';
import { ToolsRecord } from '../database/tool.record';
import { WorkersRecord } from '../database/worker.record';

const testWorkerNameOne = 'Janusz Kowalski';
const testWorkerNameTwo = 'Jarosław Kaczyński';

let workerID1: string;
let workerID2: string;

let toolID1: string;
let toolID2: string;

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

const testData2 = {
    sign: "221188",
    name: testWorkerNameTwo,
    status: "Baza",
    place: 'Baza',
    type: 'Wiertarka',
    subtype: 'Stołowa',
    brand: 'Wiertnice.pl',
    serial: '124566433',
}

const actualizePackage = {
    name: testWorkerNameOne,
    status: 'changed',
    place: 'changed'
}

beforeAll(async () => {
    const testingWorkerOne = new WorkersRecord({ name: testWorkerNameOne });
    const testingWorkerTwo = new WorkersRecord({ name: testWorkerNameTwo });

    workerID1 = await testingWorkerOne.add();
    workerID2 = await testingWorkerTwo.add();
})

test('adding record to database with wrong datas', async () => {

    expect(() => {
        new ToolsRecord({ ...testData1, sign: '123456789012345678901122' })
    }).toThrowError();
    expect(() => {
        new ToolsRecord({ ...testData1, name: '123456789012345678901122123456789012345678901122123456789012345678901122' })
    }).toThrowError();
    expect(() => {
        new ToolsRecord({ ...testData1, name: '12' })
    }).toThrowError();
    expect(() => {
        new ToolsRecord({ ...testData1, status: '12' })
    }).toThrowError();
    expect(() => {
        new ToolsRecord({ ...testData1, status: '123456789' })
    }).toThrowError();
    expect(() => {
        new ToolsRecord({ ...testData1, place: '123456789123456789123456789123456789' })
    }).toThrowError();
    expect(() => {
        new ToolsRecord({ ...testData1, type: '123456789012345678901122123456789012345678901122123456789012345678901122' })
    }).toThrowError();
    expect(() => {
        new ToolsRecord({ ...testData1, brand: '123456789123456789123456789123456789' })
    }).toThrowError();
    expect(() => {
        new ToolsRecord({ ...testData1, serial: '123456789012345678901122123456789012345678901122123456789012345678901122' })
    }).toThrowError();

});

test('adding two records to database', async () => {
    const firstCorrect = new ToolsRecord(testData1);
    const secondCorrect = new ToolsRecord(testData2);

    toolID1 = await firstCorrect.add();
    toolID2 = await secondCorrect.add();

    expect(toolID1).toMatch(/^[a-fA-F0-9]{8}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{12}$/);
    expect(toolID2).toMatch(/^[a-fA-F0-9]{8}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{12}$/);
})

test('getting one and actualize data', async () => {

    const toActualize = await ToolsRecord.getOne(toolID2);
    expect(toActualize).not.toBeNull();

    await toActualize.actualize(actualizePackage);

    const actualized = await ToolsRecord.getOne(toolID2);

    expect(toActualize.showID).toEqual(actualized.showID);
    expect(actualized.showID).toEqual(toolID2);

    expect(toActualize.showStatuses).not.toEqual(actualized.showStatuses);
})

test('getting list of all tools', async () => {

    const list = await ToolsRecord.getAll();
    expect(list).not.toBeNull();
    expect(list.length).toBeGreaterThan(1);
})

test('deleting tested records', async () => {

    const firstToDelete = await ToolsRecord.getOne(toolID1);
    const secondToDelete = await ToolsRecord.getOne(toolID2);

    await firstToDelete.delete();
    await secondToDelete.delete();

    const afterDeletingOne = await ToolsRecord.getOne(toolID1);
    const afterDeletingTwo = await ToolsRecord.getOne(toolID2);

    expect(afterDeletingOne).toBeNull();
    expect(afterDeletingTwo).toBeNull();
})

afterAll(async () => {

    const deletingFirstWorker = await WorkersRecord.getOne(workerID1);
    const deletingSecondWorker = await WorkersRecord.getOne(workerID2);

    await deletingFirstWorker.delete();
    await deletingSecondWorker.delete();

    await pool.end();
})

