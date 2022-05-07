import { UserRecord } from '../database/user.record';
import { pool } from '../utils/db';



test('creating user instance with to short login validation test', () => {
    expect(() => {
        const userTest = new UserRecord({ login: 'Ala', password: '1234567' });
    }).toThrow();
});

test('creating user instance with to short password validation test', () => {
    expect(() => {
        const userTest = new UserRecord({ login: 'Alasddddd', password: '123' });
    }).toThrow();
});

test('creating user instance with to long login validation test', () => {
    expect(() => {
        new UserRecord({ login: 'Alaythgtrfredserthsjiuytrd', password: '1234567' });
    }).toThrow();
});

test('creating new user instance and saving it on database', async () => {
    const userTest = new UserRecord({ login: "Testing", password: 'Tested12' });
    expect(await userTest.add()).toMatch(/^[a-fA-F0-9]{8}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{12}$/);
});


test('finding patching and deleting instance of user', async () => {
    let finded = await UserRecord.getOne('Testing');
    expect(finded).toBeDefined();
    expect(finded).not.toBeNull();
    expect(finded).toBeTruthy();

    finded.newPassword = "0987655421";
    finded.newLogin = 'newTestetingMan';

    await finded.patch();

    const patched = await UserRecord.getOne('newTestetingMan');

    expect(patched).toBeDefined();
    expect(patched).not.toBeNull();
    expect(patched).toBeTruthy();

    expect(patched.showID).toEqual(finded.showID);

    const removedID = await patched.delete();

    expect(removedID).toEqual(finded.showID);

    const tryFind = await UserRecord.getOne('newTestetingMan');
    expect(tryFind).toBeNull();
})

afterAll(async () => {
    await pool.end();
})