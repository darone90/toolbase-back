import { ValidationError } from '../utils/error';
import { pool } from "../utils/db";
import { v4 as uuid } from 'uuid';
import { FieldPacket } from 'mysql2';
import { Worker } from '../types/workers.types';

type WorkersRecordType = [Worker[], FieldPacket[]];

export class WorkersRecord {
    private name: string;
    private id?: string;


    constructor(workerData: Worker) {
        if (workerData.name.length < 3 || workerData.name.length > 50) {
            throw new ValidationError('Nazwa pracownika powinna mieć więcej niż 3 i mniej niż 50 znaków')
        };
        this.name = workerData.name;
        this.id = workerData.id
    }

    async add(): Promise<string> {
        if (!this.id) {
            this.id = uuid();
        }
        try {
            await pool.execute("INSERT INTO `workers`(`id`, `name`) VALUES (:id, :name)", {
                id: this.id,
                name: this.name,

            })
            return this.id
        } catch (err: unknown) {
            if (err instanceof Error)
                throw new Error(`Error during adding new types to database in types record module: ${err.message}`);
            //obsługa + zapis do errorloga
        }
    }

    static async getAll(): Promise<WorkersRecord[] | null> {
        try {
            const [results] = (await pool.execute("SELECT * FROM `workers`")) as WorkersRecordType;
            return results.map(type => new WorkersRecord(type));
        } catch (err: unknown) {
            if (err instanceof Error)
                throw new Error(`Error during getting all workers from database in worker record module: ${err.message}`);
            //obsługa + zapis do errorloga
        }
    }

    async delete(): Promise<string> {
        try {
            await pool.execute("DELETE FROM `workers` WHERE `id` = :id", {
                id: this.id,
            })
            return this.id;
        } catch (err: unknown) {
            if (err instanceof Error)
                throw new Error(`Error during deleting worker from database in workers record module: ${err.message}`);
            //obsługa + zapis do errorloga
        }
    }

    static async getOne(id: string): Promise<WorkersRecord | null> {
        try {
            const [results] = (await pool.execute("SELECT * FROM `workers` WHERE `id` = :id", {
                id,
            })) as WorkersRecordType;

            return results.length === 0 ? null : new WorkersRecord(results[0]);

        } catch (err: unknown) {
            if (err instanceof Error)
                throw new Error(`Error during getting one types from database in types record module: ${err.message}`);
            //obsługa + zapis do errorloga
        }
    }
}

