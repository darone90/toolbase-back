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

    .get('/actual/:name', async (req, res) => {
        const { name } = req.params;
        try {
            const data = await HistoryRecord.getActual(name);
            res.json(data);
        } catch (err) {
            throw new Error(`get all tools list err: ${err}`);
            //send err to front
        }
    })

    .delete('/:name', async (req, res) => {
        const { name } = req.params
        try {
            await HistoryRecord.clear(name);
            res.json({ ok: true });
        } catch (err) {
            throw new Error(`get all tools list err: ${err}`);
            //send err to front
        }
    })