import { ValidationError } from '../utils/error';
import { pool } from "../utils/db";
import { FieldPacket } from 'mysql2';
import { History, HistoryWithTool } from '../types/history.types';
import { v4 as uuid } from 'uuid';

type HistoryWithToolRecordType = [HistoryWithTool[], FieldPacket[]];
type HistoryRecordType = [HistoryRecord[], FieldPacket[]];

export class HistoryRecord {
    name: string;
    uuid?: string;
    id: string;
    start: string;
    end?: string;

    constructor(data: History) {
        if (data.name.length < 3 || data.name.length > 50) {
            throw new ValidationError('Name need to have more than 3 and less than 50 characters')
        };
        this.name = data.name;
        this.id = data.id;
        this.start = data.start ? data.start : new Date().toISOString().slice(0, 10);
        this.end = data.end ? data.end : null;
        this.uuid = data.uuid
    }

    async add(): Promise<string> {
        if (!this.uuid) {
            this.uuid = uuid();
        }
        try {
            await pool.execute("INSERT INTO `history`(`uuid`, `id`, `name`, `start`) VALUES (:uuid, :id, :name, :start)", {
                uuid: this.uuid,
                id: this.id,
                name: this.name,
                start: this.start
            })
            return this.uuid;
        } catch (err: unknown) {
            if (err instanceof Error)
                throw new Error(`Error during adding new history record to database in history record module: ${err.message}`);
            //obsługa + zapis do errorloga
        }
    }

    static async getAllFor(name: string): Promise<HistoryWithTool[] | null> {
        try {
            const [results] = (await pool.execute("SELECT `tools`.sign, `tools`.type, `tools`.subtype, `tools`.brand, `tools`.serial, `history`.uuid, `history`.name, `history`.start ,`history`.end FROM `history` JOIN `tools` ON `history`.id=`tools`.id WHERE `history`.name = :name AND `history`.end NOT IN ('NULL')", {
                name
            })) as HistoryWithToolRecordType;

            return results;

        } catch (err: unknown) {
            if (err instanceof Error)
                throw new Error(`Error during getting all history records for worker : ${err.message}`);
            //obsługa + zapis do errorloga
        }
    }

    static async getOne(uuid: string): Promise<HistoryRecord | null> {
        try {
            const [results] = (await pool.execute("SELECT * FROM `history` WHERE `uuid` = :uuid", {
                uuid
            })) as HistoryRecordType;
            return results.length === 0 ? null : new HistoryRecord(results[0]);
        } catch (err: unknown) {
            if (err instanceof Error)
                throw new Error(`Error during adding end to history record: ${err.message}`);
            //obsługa + zapis do errorloga
        }
    }

    async addEnd(): Promise<void> {
        try {

            await pool.execute("UPDATE `history` SET `end` = :end  WHERE `uuid` = :uuid", {
                uuid: this.uuid,
                end: new Date().toISOString().slice(0, 10)
            })

        } catch (err: unknown) {
            if (err instanceof Error)
                throw new Error(`Error during adding end to history record: ${err.message}`);
            //obsługa + zapis do errorloga
        }
    }

    static async clear(name: string): Promise<void> {
        try {
            await pool.execute("DELETE FROM `history` WHERE `name` = :name AND `end` NOT IN ('NULL')", {
                name
            })

        } catch (err: unknown) {
            if (err instanceof Error)
                throw new Error(`Error clearing all record for worker: ${err.message}`);
            //obsługa + zapis do errorloga
        }
    }

    static async getActual(name: string): Promise<HistoryWithTool[] | null> {
        try {
            const [results] = (await pool.execute("SELECT `tools`.sign, `tools`.type, `tools`.subtype, `tools`.brand, `tools`.serial, `history`.uuid, `history`.name, `history`.start ,`history`.end FROM `history` JOIN `tools` ON `history`.id=`tools`.id WHERE `history`.name = :name AND `history`.end IN ('NULL')", {
                name
            })) as HistoryWithToolRecordType;

            return results;

        } catch (err: unknown) {
            if (err instanceof Error)
                throw new Error(`Error during getting all actual records for worker : ${err.message}`);
            //obsługa + zapis do errorloga
        }
    }

    get showID(): string {
        return this.uuid
    }

    get showData() {
        return {
            name: this.name,
            start: this.start,
            end: this.end
        }
    }
}

// const test = async () => {
//     const add = await HistoryRecord.getAllFor("Janusz Testowy");
//     console.log(add);
// }

// test();