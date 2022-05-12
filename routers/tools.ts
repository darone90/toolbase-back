import { Router } from 'express';
import { ToolsRecord } from '../database/tool.record';
import { HistoryRecord } from '../database/history.record';
import { handleError } from '../utils/error';

const toolRouter = Router();

toolRouter

    .get('/', async (req, res, next) => {
        try {
            const data = await ToolsRecord.getAll();
            res.json(data);
        } catch (err) {
            handleError(err, req, res, next);
        }
    })

    .get('/:id', async (req, res, next) => {
        const { id } = req.params;
        try {
            const data = await ToolsRecord.getOne(id);
            res.json(data);
        } catch (err) {
            handleError(err, req, res, next);
        }
    })

    .post('/', async (req, res, next) => {
        const { sign, name, status, place, type, subtype, brand, serial } = req.body;
        try {
            const tool = new ToolsRecord({ sign, name, status, place, type, subtype, brand, serial });
            const id = await tool.add();
            const history = new HistoryRecord({ id, name });
            await history.add();
            res.json({ id });
        } catch (err) {
            handleError(err, req, res, next);
        }
    })

    .delete('/', async (req, res, next) => {
        const { id } = req.body;
        try {
            const tool = await ToolsRecord.getOne(id);
            const idn = await tool.delete();
            res.json({ id: idn });
        } catch (err) {
            handleError(err, req, res, next);
        }
    })

    .patch('/', async (req, res, next) => {
        const { id, name, status, place } = req.body;
        try {
            const actualizeRecord = await ToolsRecord.getOne(id);
            const oldName = actualizeRecord.showStatuses.name;
            const uuid = await actualizeRecord.actualize({ name, status, place });
            if (oldName !== name) {
                const newWorker = new HistoryRecord({ id, name });
                await newWorker.add();
                const oldWorker = await HistoryRecord.getOne(uuid.uuid);
                await oldWorker.addEnd();
            }
            res.json({ id })
        } catch (err) {
            handleError(err, req, res, next);
        }
    })

export default toolRouter;