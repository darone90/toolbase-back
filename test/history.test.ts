import { HistoryRecord } from '../database/history.record';
import { WorkersRecord } from '../database/worker.record';
import { ToolsRecord } from '../database/tool.record';
import { pool } from '../utils/db';

const testedWorkerName = 'Janusz Testowy'
let testedWorkerID: string;

const dataForTestedTool = {
    sign: "221188",
    name: testedWorkerName,
    status: "Baza",
    place: 'Baza',
    type: 'Wiertarka',
    subtype: 'Stołowa',
    brand: 'Wiertnice.pl',
    serial: '124566433',
}
let testedToolID: string;

let historyID1: string;
let historyID2: string;

beforeAll(async () => {
    const newWorker = new WorkersRecord({ name: testedWorkerName });
    testedWorkerID = await newWorker.add();

    const newTool = new ToolsRecord(dataForTestedTool);
    testedToolID = await newTool.add();
});

test('adding new record to history and gettin list for worker', async () => {
    const newHistoryRecord = new HistoryRecord({ id: testedToolID, name: testedWorkerName });
    historyID1 = await newHistoryRecord.add();
    const secondNewHistoryRecord = new HistoryRecord({ id: testedToolID, name: testedWorkerName });
    historyID2 = await secondNewHistoryRecord.add();

    expect(historyID1).toMatch(/^[a-fA-F0-9]{8}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{12}$/);
    expect(historyID2).toMatch(/^[a-fA-F0-9]{8}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{12}$/);

    const list = await HistoryRecord.getAllFor(testedWorkerName);
    expect(list).not.toBeNull();
    expect(list.length).toBeGreaterThan(1);
});

test('finding and adding end date to records', async () => {
    const findRecord = await HistoryRecord.getOne(historyID1);
    expect(findRecord).not.toBeNull();
    expect(findRecord.showID).toEqual(historyID1);

    expect(findRecord.showData.end).toBeNull();
    await findRecord.addEnd();
    const reload = await HistoryRecord.getOne(historyID1);
    expect(reload.showData.end).not.toBeNull();

})

test('clearing history records', async () => {
    const recordOne = await HistoryRecord.getOne(historyID1);

    await recordOne.clear();

    const list = await HistoryRecord.getAllFor(testedWorkerName);
    expect(list.length).toBeLessThan(1);
})




afterAll(async () => {
    const worker = await WorkersRecord.getOne(testedWorkerID);
    const tool = await ToolsRecord.getOne(testedToolID);

    await tool.delete();
    await worker.delete();

    await pool.end();
});