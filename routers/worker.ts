import { Router } from 'express';
import { WorkersRecord } from '../database/worker.record';

const workerRouter = Router();

workerRouter
    .get('/', async (req, res) => {
        try {
            const data = await WorkersRecord.getAll();
            res.json(data);
        } catch (err) {
            throw new Error(`get all worker list err: ${err}`);
            //send err to front
        }
    })

    .post('/', async (req, res) => {
        const { name } = req.body;
        try {
            const worker = new WorkersRecord({ name });
            const id = await worker.add();
            res.json({ id });
        } catch (err) {
            throw new Error(`get all worker list err: ${err}`);
            //send err to front
        }
    })

    .delete('/', async (req, res) => {
        const { id } = req.body;
        try {
            const worker = await WorkersRecord.getOne(id);
            const idn = await worker.delete();
            res.json({ id: idn });
        } catch (err: unknown) {
            if (err instanceof Error) {
                throw new Error(`get all worker list err: ${err.message}`);
            }
        }
    })

export default workerRouter;