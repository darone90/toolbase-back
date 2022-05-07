import { pool } from '../utils/db';
import { TypesRecord } from '../database/types.record';

const testingData = {
    name: 'xxxxxx',
    types: ['xxx', 'xxx', 'xxx']
}

let id: string;
let id2: string;

test('creating new types validation check', () => {
    expect(() => {
        const test = new TypesRecord({ name: 'xxx', types: testingData.types })
    }).toThrow()

});

test('creating new types second validation check', () => {
    expect(() => {
        const test = new TypesRecord({ name: testingData.name, types: [] })
    }).toThrow()

});

test('adding record to database', async () => {

    const test = new TypesRecord(testingData);
    id = await test.add();
    expect(id).toMatch(/^[a-fA-F0-9]{8}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{12}$/);

});

test('finding one and patching', async () => {
    const test = await TypesRecord.getOne(id);

    expect(test).toBeDefined();
    expect(test).not.toBeNull();

    test.setName = 'zzzzz';
    test.setTypes = ['zzzz', 'zzzz', 'zzzz', 'zzzz'];

    await test.patch();

    const secondTest = await TypesRecord.getOne(id);

    expect(secondTest).toBeDefined();
    expect(secondTest).not.toBeNull();

    const data = secondTest.showData
    if (typeof data.types === 'string') {
        const arrayData = JSON.parse(data.types);
        expect(arrayData.length).toEqual(4)
    }
});

test('adding another record and listing all', async () => {
    const test = new TypesRecord(testingData);
    id2 = await test.add();

    const list = await TypesRecord.getAll();

    expect(list.length).toBeGreaterThan(1);
});

test('deleting records', async () => {
    const test = await TypesRecord.getOne(id);
    const test2 = await TypesRecord.getOne(id2);

    expect(test).not.toBeNull();
    expect(test2).not.toBeNull();

    await test.delete();
    await test2.delete();

    const newTest = await TypesRecord.getOne(id);
    const newTest2 = await TypesRecord.getOne(id2);

    expect(newTest).toBeNull();
    expect(newTest2).toBeNull();
});

afterAll(async () => {
    await pool.end();
})

