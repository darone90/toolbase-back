import { Router } from 'express';
import { ToolsRecord } from '../database/tool.record';
import { HistoryRecord } from '../database/history.record';
import { handleError } from '../utils/error';
import { checkToken } from '../utils/loginConfirm';

const toolRouter = Router();

toolRouter

    .get('/', async (req, res, next) => {
        try {
            const token = req.cookies.token;
            const confirmation = checkToken(token);
            if(confirmation) {
                const data = await ToolsRecord.getAll();
                res.json(data);
            } else {
                res.json({error: 'Brak potwierdzenia zalogowania: Brak dostępu'})
            }
            
        } catch (err) {
            handleError(err, req, res, next);
        }
    })

    .get('/:id', async (req, res, next) => {
        const { id } = req.params;
        try {
            const token = req.cookies.token;
            const confirmation = checkToken(token);
            if(confirmation) {
                const data = await ToolsRecord.getOne(id);
                res.json(data);
            } else {
                res.json({error: 'Brak potwierdzenia zalogowania: Brak dostępu'})
            }
            
        } catch (err) {
            handleError(err, req, res, next);
        }
    })

    .post('/', async (req, res, next) => {
        const { sign, name, status, place, type, subtype, brand, serial } = req.body;
        try {
            const token = req.cookies.token;
            const confirmation = checkToken(token);
            if(confirmation) {
                const tool = new ToolsRecord({ sign, name, status, place, type, subtype, brand, serial });
                const id = await tool.add();
                const history = new HistoryRecord({ id, name });
                await history.add();
                res.json({ id });
            } else {
                res.json({error: 'Brak potwierdzenia zalogowania: Brak dostępu'})
            }
            
        } catch (err) {
            handleError(err, req, res, next);
        }
    })

    .delete('/', async (req, res, next) => {
        const { id } = req.body;
        try {
            const token = req.cookies.token;
            const confirmation = checkToken(token);
            if(confirmation) {
                const tool = await ToolsRecord.getOne(id);
                const idn = await tool.delete();
                res.json({ id: idn });
            } else {
                res.json({error: 'Brak potwierdzenia zalogowania: Brak dostępu'})
            }
            
        } catch (err) {
            handleError(err, req, res, next);
        }
    })

    .patch('/', async (req, res, next) => {
        const { id, name, status, place } = req.body;
        try {
            const token = req.cookies.token;
            const confirmation = checkToken(token);
            if(confirmation) {
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
            } else {
                res.json({error: 'Brak potwierdzenia zalogowania: Brak dostępu'})
            }
            
        } catch (err) {
            handleError(err, req, res, next);
        }
    })

export default toolRouter;