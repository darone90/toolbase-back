import { TypesData } from '../types/types.types';
import { ValidationError } from '../utils/error';
import { pool } from "../utils/db";
import { v4 as uuid } from 'uuid';
import { FieldPacket } from 'mysql2';

type TypesRecordType = [TypesData[], FieldPacket[]];

export class TypesRecord {
    private _id?: string;
    private _name: string;
    private _types: string[];

    constructor(typesData: TypesData) {
        if (typesData.name.length > 50 || typesData.name.length < 4) {
            throw new ValidationError('Type name need to have more than 4 and less than 50 characters')
        }
        if (typesData.types.length < 1) {
            throw new ValidationError('Every type need to have minimum one subtype')
        }

        this._id = typesData.id;
        this._name = typesData.name;
        this._types = typesData.types;
    }

    async add(): Promise<string> {
        if (!this._id) {
            this._id = uuid();
        }
        try {
            await pool.execute("INSERT INTO `toolstypes`(`id`, `name`, `types`) VALUES (:id, :name, :types)", {
                id: this._id,
                name: this._name,
                types: JSON.stringify(this._types),
            })
            return this._id
        } catch (err: unknown) {
            if (err instanceof Error)
                throw new Error(`Error during adding new types to database in types record module: ${err.message}`);
            //obsługa + zapis do errorloga
        }
    }

    async patch(): Promise<string> {
        try {
            await pool.execute("UPDATE `toolstypes` SET `name` = :name, `types` = :types WHERE `id` = :id", {
                id: this._id,
                name: this._name,
                types: JSON.stringify(this._types),
            })
            return this._id;
        } catch (err: unknown) {
            if (err instanceof Error)
                throw new Error(`Error during patching type in database in types record module: ${err.message}`);
            //obsługa + zapis do errorloga
        }

    }

    async delete(): Promise<string> {
        try {
            await pool.execute("DELETE FROM `toolstypes` WHERE `id` = :id", {
                id: this._id,
            })
            return this._id;
        } catch (err: unknown) {
            if (err instanceof Error)
                throw new Error(`Error during deleting types in database in types record module: ${err.message}`);
            //obsługa + zapis do errorloga
        }
    }

    static async getOne(id: string): Promise<TypesRecord | null> {
        try {
            const [results] = (await pool.execute("SELECT * FROM `toolstypes` WHERE `id` = :id", {
                id,
            })) as TypesRecordType;

            return results.length === 0 ? null : new TypesRecord({ ...results[0], types: JSON.parse(results[0].types as unknown as string) });

        } catch (err: unknown) {
            if (err instanceof Error)
                throw new Error(`Error during getting one types from database in types record module: ${err.message}`);
            //obsługa + zapis do errorloga
        }
    }

    static async getAll(): Promise<TypesRecord[] | null> {
        try {
            const [results] = (await pool.execute("SELECT * FROM `toolstypes`")) as TypesRecordType;
            return results.map(type => new TypesRecord({ ...type, types: JSON.parse(type.types as unknown as string) }));
        } catch (err: unknown) {
            if (err instanceof Error)
                throw new Error(`Error during getting all types from database in types record module: ${err.message}`);
            //obsługa + zapis do errorloga
        }
    }

    set setName(name: string) {
        this._name = name
    }

    set setTypes(types: string[]) {
        this._types = types
    }

    get showID(): string {
        return this._id
    }

    get showData(): { name: string, types: string | string[] } {
        return {
            name: this._name,
            types: this._types
        }
    }
}