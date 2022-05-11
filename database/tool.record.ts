import { ToolsData, ActualizePackage } from '../types/tools.types';
import { ValidationError } from '../utils/error';
import { pool } from "../utils/db";
import { v4 as uuid } from 'uuid';
import { FieldPacket } from 'mysql2';

export type ToolsRecordType = [ToolsData[], FieldPacket[]];
type WorkerUUID = [{ uuid: string }[], FieldPacket[]];

export class ToolsRecord {

    private id?: string;
    private sign: string;
    private name: string;
    private status: string;
    private place: string;
    private type: string;
    private subtype: string;
    private brand: string;
    private serial: string;

    constructor(toolsData: ToolsData) {
        if (toolsData.sign.length > 20) {
            throw new ValidationError('Sign can`t have more than 20 characters')
        }
        if (toolsData.name.length > 50 || toolsData.name.length < 3) {
            throw new ValidationError('Name can`t have more than 50 and less than 3 characters')
        }
        if (toolsData.status.length > 50 || toolsData.status.length < 4) {
            throw new ValidationError('status can`t have more than 50 and less than 3 characters')
        }
        if (toolsData.place.length > 30) {
            throw new ValidationError('Place can`t have more than 30 characters')
        }
        if (toolsData.type.length > 50) {
            throw new ValidationError('Type can`t have more than 50 characters')
        }
        if (toolsData.subtype.length > 50) {
            throw new ValidationError('Subtype can`t have more than 50 characters')
        }
        if (toolsData.brand.length > 30) {
            throw new ValidationError('Brand can`t have more than 30 characters')
        }
        if (toolsData.serial.length > 50) {
            throw new ValidationError('Sign can`t have more than 50 characters')
        }

        this.id = toolsData.id;
        this.sign = toolsData.sign
        this.name = toolsData.name;
        this.status = toolsData.status;
        this.place = toolsData.place;
        this.type = toolsData.type;
        this.subtype = toolsData.subtype;
        this.brand = toolsData.brand;
        this.serial = toolsData.serial;

    }

    async add(): Promise<string> {
        if (!this.id) {
            this.id = uuid();
        }
        try {
            await pool.execute("INSERT INTO `tools`(`id`,`sign`,`name`,`status`,`place`,`type`, `subtype`, `brand`, `serial`) VALUES (:id, :sign, :name, :status, :place, :type, :subtype, :brand, :serial)", {
                id: this.id,
                sign: this.sign,
                name: this.name,
                status: this.status,
                place: this.place,
                type: this.type,
                subtype: this.subtype,
                brand: this.brand,
                serial: this.serial,
            })
            return this.id
        } catch (err: unknown) {
            if (err instanceof Error)
                throw new Error(`Error during adding new tools to database in tools record module: ${err.message}`);
            //obsługa + zapis do errorloga
        }
    }

    async delete(): Promise<string> {
        try {
            await pool.execute("DELETE FROM `tools` WHERE `id` = :id", {
                id: this.id,
            })
            return this.id;
        } catch (err: unknown) {
            if (err instanceof Error)
                throw new Error(`Error during deleting tools in database in tools record module: ${err.message}`);
            //obsługa + zapis do errorloga
        }
    }

    async actualize(data: ActualizePackage): Promise<{ uuid: string }> {
        try {
            await pool.execute("UPDATE `tools` SET `name` = :name, `status` = :status, `place` = :place WHERE `id` = :id", {
                id: this.id,
                name: data.name,
                status: data.status,
                place: data.place
            })

            const [results] = (await pool.execute("SELECT `history`.uuid FROM `tools` JOIN `history` ON `tools`.id=`history`.id WHERE `history`.name = :name", {
                name: this.name
            })) as WorkerUUID;

            return results[0];
        } catch (err: unknown) {
            if (err instanceof Error)
                throw new Error(`Error during actualiztaion: ${err.message}`);
            //obsługa + zapis do errorloga
        }
    }

    static async getOne(id: string): Promise<ToolsRecord | null> {
        try {
            const [results] = (await pool.execute("SELECT * FROM `tools` WHERE `id` = :id", {
                id,
            })) as ToolsRecordType;

            return results.length === 0 ? null : new ToolsRecord(results[0]);
        } catch (err: unknown) {
            if (err instanceof Error)
                throw new Error(`Error during getting one tool from database in tools record module: ${err.message}`);
            //obsługa + zapis do errorloga
        }
    }

    static async getAll(): Promise<ToolsRecord[] | null> {
        try {
            const [results] = (await pool.execute("SELECT * FROM `tools`")) as ToolsRecordType;
            return results.map(type => new ToolsRecord(type));
        } catch (err: unknown) {
            if (err instanceof Error)
                throw new Error(`Error during getting all tools from database in tools record module: ${err.message}`);
            //obsługa + zapis do errorloga
        }
    }

    get showStatuses() {
        return {
            name: this.name,
            status: this.status,
            place: this.place
        }
    }

    get showID() {
        return this.id;
    }
}

