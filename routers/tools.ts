import { Router } from 'express';
import { ToolsRecord } from '../database/tool.record';
import { HistoryRecord } from '../database/history.record';

const toolRouter = Router();

toolRouter

    .get('/', async (req, res) => {
        try {
            const data = await ToolsRecord.getAll();
            res.json(data);
        } catch (err) {
            throw new Error(`get all tools list err: ${err}`);
            //send err to front
        }
    })

    .get('/:id', async (req, res) => {
        const { id } = req.params;
        try {
            const data = await ToolsRecord.getOne(id);
            res.json(data);
        } catch (err) {
            throw new Error(`get one tools from list err: ${err}`);
            //send err to front
        }
    })

    .post('/', async (req, res) => {
        const { sign, name, status, place, type, subtype, brand, serial } = req.body;
        try {
            const tool = new ToolsRecord({ sign, name, status, place, type, subtype, brand, serial });
            const id = await tool.add();
            const history = new HistoryRecord({ id, name });
            await history.add();
            res.json({ id });
        } catch (err) {
            throw new Error(`put new tool to list err: ${err}`);
            //send err to front
        }
    })

    .delete('/', async (req, res) => {
        const { id } = req.body;
        try {
            const tool = await ToolsRecord.getOne(id);
            const idn = await tool.delete();
            res.json({ id: idn });
        } catch (err: unknown) {
            if (err instanceof Error) {
                throw new Error(`delete tool from list err: ${err.message}`);
            }
        }
    })

    .patch('/', async (req, res) => {
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
        } catch (err: unknown) {
            if (err instanceof Error) {
                throw new Error(`actualize tool statuses list err: ${err.message}`);
            }
        }
    })

export default toolRouter;