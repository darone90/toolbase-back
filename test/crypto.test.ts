import { coding, decoding, hasher, comparer } from '../utils/crypto'

test('coding and decoding some text', async () => {
    const simpleWord = 'testing';
    const codeResult = await coding(simpleWord);
    const decodeResult = await decoding(codeResult.coded, codeResult.iv);
    expect(simpleWord).toEqual(decodeResult);
});

test('hasher and comparer test', async () => {
    const password = 'test12345';
    const hashed = await hasher(password);
    const result = await comparer(password, hashed.coded, hashed.iv);

    expect(result).toBeTruthy();
});
