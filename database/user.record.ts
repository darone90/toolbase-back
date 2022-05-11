import { LoginData, Code } from "../types/user.types";
import { hasher } from "../utils/crypto";
import { pool } from "../utils/db";
import { ValidationError } from '../utils/error';
import { v4 as uuid } from 'uuid';
import { FieldPacket } from 'mysql2';

type UserRecordType = [LoginData[], FieldPacket[]];

export class UserRecord {
    private _login: string;
    private _password: string;
    private _id?: string;
    private _ivkey?: string;

    constructor(userData: LoginData) {
        if (userData.login.length < 5 || userData.password.length < 6) {
            throw new ValidationError('Login need to have more or equal than 5 signs and password more than 5')
        }

        if (userData.login.length > 25 || userData.password.length > 140) {
            throw new ValidationError('Login and password can`t have more than 25 characters')
        }

        this._login = userData.login;
        this._password = userData.password;
        this._id = userData.id;
        this._ivkey = userData.ivkey
    };

    async add(): Promise<string> {
        if (!this._id) {
            this._id = uuid();
        }
        try {
            const data = await hasher(this._password);
            await pool.execute("INSERT INTO `users`(`id`, `login`, `password`, `ivkey`) VALUES (:id, :login, :password, :key)", {
                id: this._id,
                login: this._login,
                password: data.coded,
                key: data.iv
            })
        } catch (err) {
            throw new Error('Error during adding new user to database i user record module');
            //obsługa + zapis do errorloga
        }
        return this._id;
    }

    async patch(): Promise<void> {
        try {
            const data = await hasher(this._password);
            await pool.execute("UPDATE `users` SET `password` = :password, `ivkey` = :key WHERE `id` = :id", {
                id: this._id,
                password: data.coded,
                key: data.iv
            })
        } catch (err) {
            throw new Error('Error during adding new user to database in user record module');
        }
    }

    async patchLogin(): Promise<void> {
        try {
            await pool.execute("UPDATE `users` SET `login` = :login WHERE `id` = :id", {
                id: this._id,
                login: this._login
            })
        } catch (err) {
            throw new Error('Error during adding new user to database in user record module');
        }
    }

    async delete(): Promise<string> {
        try {
            await pool.execute("DELETE FROM `users` WHERE `id` = :id", {
                id: this._id
            });
            return this._id
        } catch (err) {
            throw new Error('Error during removing new user from database in user record module');
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
            coded: this._password,
            iv: this._ivkey
        })
    }

    get showID(): string {
        return this._id;
    }

    get showLogin(): string {
        return this._login;
    }

    set newLogin(login: string) {
        this._login = login;
    }

    set newPassword(password: string) {
        this._password = password;
    }
}

// const put = async () => {
//     const newGregor = new UserRecord({ login: 'Mario', password: 'Bross123' })
//     await newGregor.add();
// }

// put();


