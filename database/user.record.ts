import { LoginData, Code } from "../types/user.types";
import { hasher } from "../utils/crypto";
import { pool } from "../utils/db";
import { ValidationError } from '../utils/error';
import { v4 as uuid } from 'uuid';
import { FieldPacket } from 'mysql2';

type UserRecordType = [LoginData[], FieldPacket[]];

export class UserRecord {
    private login: string;
    private password: string;
    private id?: string;
    private key?: string;

    constructor(userData: LoginData) {
        if (userData.login.length < 5 || userData.password.length < 6) {
            throw new ValidationError('Login musi mieć conajmniej 5 znaków a hasło conajmniej 6 znaków')
        }

        this.login = userData.login;
        this.password = userData.password;
        this.id = userData.id;
        this.key = userData.key
    };

    async add(): Promise<string> {
        if (!this.id) {
            this.id = uuid();
        }
        try {
            const data = await hasher(this.password);
            pool.execute("INSERT INTO `users`(`id`, `login`, `password`, `key`) VALUES (:id, :login, :password, :key)", {
                id: this.id,
                login: this.login,
                password: data.coded,
                key: data.iv
            })
        } catch (err) {
            throw new Error('Error during adding new user to database i user record module');
            //obsługa + zapis do errorloga
        }
        return this.id;
    }

    async patch(): Promise<void> {
        try {
            const data = await hasher(this.password);
            pool.execute("UPDATE `users` SET `login` = :login, `password` = :password, `key` = :key WHERE `id` = :id", {
                id: this.id,
                login: this.login,
                password: data.coded,
                key: data.iv
            })
        } catch (err) {
            throw new Error('Error during adding new user to database i user record module');
        }
    }

    static async getOne(login: string): Promise<UserRecord | null> {
        try {
            const [results] = (await pool.execute("SELECT * FROM `users` WHERE `login` = :login", {
                login,
            })) as UserRecordType;

            return results.length === 0 ? null : new UserRecord(results[0]);

        } catch (err) {
            throw new Error('Error during finding user in user record module');
            //dopisać obsługę błedu
        }
    }

    get showPasswordData(): Code {
        return ({
            coded: this.password,
            iv: this.key
        })
    }

    set newLogin(login: string) {
        this.login = login;
    }

    set newPassword(password: string) {
        this.password = password
    }
}