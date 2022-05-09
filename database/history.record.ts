import { ValidationError } from '../utils/error';
import { pool } from "../utils/db";
import { FieldPacket } from 'mysql2';
import { History, HistoryWithTool } from '../types/history.types';
import { ToolsRecordType } from './tool.record'

type HistoryRecordType = [History[], FieldPacket[]];
type HistoryWithToolRecordType = [HistoryWithTool[], FieldPacket[]];

export class HistoryRecord {
    private name: string;
    private id: string;
    private start: string;
    private end?: string;

    constructor(data: History) {
        if (data.name.length < 3 || data.name.length > 50) {
            throw new ValidationError('Name need to have more than 3 and less than 50 characters')
        };
        this.name = data.name;
        this.id = data.id;
        this.start = new Date().toISOString().slice(0, 10);
    }

    async add(): Promise<void> {

        try {
            await pool.execute("INSERT INTO `history`(`id`, `name`, `start`) VALUES (:id, :name, :start)", {
                id: this.id,
                name: this.name,
                start: this.start
            })
        } catch (err: unknown) {
            if (err instanceof Error)
                throw new Error(`Error during adding new history record to database in history record module: ${err.message}`);
            //obsługa + zapis do errorloga
        }
    }

    static async getAllFor(name: string): Promise<HistoryWithTool[] | null> {
        try {
            const [results] = (await pool.execute("SELECT `tools`.sign, `tools`.type, `tools`.subtype, `tools`.brand, `tools`.serial, `history`.name, `history`.start ,`history`.end FROM `history` JOIN `tools` ON `history`.id=`tools`.id WHERE `history`.name = :name", {
                name
            })) as HistoryWithToolRecordType;

            return results;

        } catch (err: unknown) {
            if (err instanceof Error)
                throw new Error(`Error during getting all history records for worker : ${err.message}`);
            //obsługa + zapis do errorloga
        }
    }

    async addEnd(): Promise<void> {
        try {

            await pool.execute("UPDATE `history` SET `end` = :end  WHERE `id` = :id", {
                id: this.id,
                end: new Date().toISOString().slice(0, 10)
            })

        } catch (err: unknown) {
            if (err instanceof Error)
                throw new Error(`Error during adding end to history record: ${err.message}`);
            //obsługa + zapis do errorloga
        }
    }

    async clear(): Promise<void> {
        try {
            await pool.execute("DELETE * FROM `history` WHERE `name` = :name", {
                name: this.name
            })

        } catch (err: unknown) {
            if (err instanceof Error)
                throw new Error(`Error clearing all record for worker: ${err.message}`);
            //obsługa + zapis do errorloga
        }
    }

    get showID() {
        return this.id
    }
}

