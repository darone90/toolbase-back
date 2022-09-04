import { Router } from 'express';
import { WorkersRecord } from '../database/worker.record';
import { handleError } from '../utils/error';
import { checkToken } from '../utils/loginConfirm';

const workerRouter = Router();

workerRouter
    .get('/', async (req, res, next) => {
        try {
            const data = await WorkersRecord.getAll();
            const token = req.cookies.token;
            const confirmation = checkToken(token);
            if(confirmation) {
                res.json(data);
            } else {
                res.json({error: 'Brak potwierdzenia zalogowania: Brak dostępu'})
            }
            
        } catch (err) {
            handleError(err, req, res, next);
            throw new Error(`get all worker list err: ${err}`);
        }
    })

    .post('/', async (req, res, next) => {
        const { name } = req.body;
        try {
            const token = req.cookies.token;
            const confirmation = checkToken(token);
            if(confirmation) {
                const worker = new WorkersRecord({ name });
                const id = await worker.add();
                res.json({ id });
            } else {
                res.json({error: 'Brak potwierdzenia zalogowania: Brak dostępu'})
            }

        } catch (err) {
            handleError(err, req, res, next);
            throw new Error(`get all worker list err: ${err}`);
        }
    })

    .delete('/', async (req, res, next) => {
        const { id } = req.body;
        try {
            const worker = await WorkersRecord.getOne(id);
            const token = req.cookies.token;
            const confirmation = checkToken(token);
            if(confirmation) {
                const idn = await worker.delete();
                res.json({ id: idn });
            } else {
                res.json({error: 'Brak potwierdzenia zalogowania: Brak dostępu'})
            }
            
        } catch (err: unknown) {
            if (err instanceof Error) {
                handleError(err, req, res, next);
                throw new Error(`get all worker list err: ${err.message}`);
            }
        }
    })

export default workerRouter;