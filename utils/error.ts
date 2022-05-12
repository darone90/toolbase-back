import { NextFunction, Request, Response } from "express";
import path from 'path';
import * as fs from "fs";

export class ValidationError extends Error { };

export const handleError = async (err: Error, req: Request, res: Response, next: NextFunction) => {
    console.error(err);
    res 
        .json({ error: 'Huston we have a problem...' })
        .status(err instanceof ValidationError ? 400 : 500);


    const errorLog = await fs.promises.readFile(path.join(__dirname, 'errorLog.json'), 'utf-8');
    const errArr = JSON.parse(errorLog);
    const newError = {
        time: new Date().toISOString(),
        info: err.message
    }
    errArr.push(newError);
    const errToSave = JSON.stringify(errArr);
    await fs.promises.writeFile(path.join(__dirname, 'errorLog.json'), errToSave, 'utf-8');
}

export const readError = async () => {
    const errorLog = await fs.promises.readFile(path.join(__dirname, 'errorLog.json'), 'utf-8');
    const errArr = JSON.parse(errorLog);
    return errArr
} 
