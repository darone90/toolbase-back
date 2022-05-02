import { promises as fs } from 'fs';;
import { hash, compare } from 'bcrypt';
import { promisify } from 'util';
import * as crypto from 'crypto';
import { appSettings } from './config';
import { Code, Config } from '../types/user.types';

const scrypter = promisify(crypto.scrypt);
const randomByter = promisify(crypto.randomBytes);
const algorithm = appSettings.algorithm;
const iterations = appSettings.iterations

const readConfig = async (): Promise<Config> => {
    const userConfigData = await fs.readFile('./crData.txt', {
        encoding: 'utf-8'
    });
    const readed = JSON.parse(userConfigData) as Config;
    return readed;
}

const coding = async (toCode: string): Promise<Code> => {
    try {
        const readed = await readConfig();
        const key = await scrypter(readed.password, readed.salt, iterations);
        const iv = await randomByter(16);

        const cipher = crypto.createCipheriv(algorithm, key as crypto.CipherKey, iv);
        let encrypted = cipher.update(toCode, 'utf-8', 'hex');
        encrypted += cipher.final('hex');

        return {
            coded: encrypted,
            iv: iv.toString('hex')
        }
    } catch (err) {
        throw new Error('Error in function coding module crypto');
        //dopisać zapisanie w errorlogu
    }

};

const decoding = async (toDecode: string, iv: string): Promise<string> => {
    try {
        const readed = await readConfig();
        const key = await scrypter(readed.password, readed.salt, iterations);
        const ivd = Buffer.from(iv, 'hex');

        const decipher = crypto.createDecipheriv(algorithm, key as crypto.CipherKey, ivd);
        let decrypted = decipher.update(toDecode, 'hex', 'utf-8');
        decrypted += decipher.final('utf-8');

        return decrypted;
    } catch (err) {
        throw new Error('decoding error');
        //dopisać zapisanie w errorlogu
    }
}

export const hasher = async (password: string): Promise<Code> => {
    try {
        const codedPassword = await coding(password);
        const hashed = await hash(codedPassword.coded, 12) as string;
        return {
            coded: hashed,
            iv: codedPassword.iv
        };
    } catch (err) {
        throw new Error('error during hash function in crypto module');
        //dopisać wpis do error log
    }
}

export const comparer = async (password: string, checkpassword: string, key: string): Promise<Boolean> => {
    try {
        const decodedChcekPassword = await decoding(checkpassword, key);
        const isUserCorrect = await compare(password, decodedChcekPassword) as Boolean;
        return isUserCorrect;
    } catch (err) {
        throw new Error('error during comparing passwords in crypto module');
    }
}