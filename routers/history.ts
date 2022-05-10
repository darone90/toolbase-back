import { Router } from 'express';
import { HistoryRecord } from '../database/history.record';

const historyRouter = Router();

historyRouter
    .get('/:name', async (req, res) => {
        const { name } = req.params;
        try {
            const data = await HistoryRecord.getAllFor(name);
            res.json(data);
        } catch (err) {
            throw new Error(`get all tools list err: ${err}`);
            //send err to front
        }
    })

    .delete('/:uuid', async (req, res) => {
        const { uuid } = req.params
        try {
            const worker = await HistoryRecord.getOne(uuid);
            await worker.clear();
            res.json({ ok: true });
        } catch (err) {
            throw new Error(`get all tools list err: ${err}`);
            //send err to front
        }
    })