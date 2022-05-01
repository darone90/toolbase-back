import { NextFunction, Request, Response } from "express";

export class ValidationError extends Error { }

export const handleError = (err: Error, req: Request, res: Response, next: NextFunction) => {
    console.error(err);

    res
        .status(err instanceof ValidationError ? 400 : 500);
    // dodać zapis do logu błędów
    //jakoś dać zanać na front że jest błąd
}
