import { Router } from 'express';
import { HistoryRecord } from '../database/history.record';
import { handleError } from '../utils/error';
import { checkToken } from '../utils/loginConfirm';

const historyRouter = Router();

historyRouter
    .get('/archived/:name', async (req, res, next) => {   
        try {
            const { name } = req.params;
            const token = req.cookies.token;
            const confirmation = checkToken(token);
            if(confirmation) {
                const data = await HistoryRecord.getAllFor(name);
                res.json(data);
            } else {
                res.json({error: 'Brak potwierdzenia zalogowania: Brak dostępu'})
            }
        } catch (err) {
            handleError(err, req, res, next);
            throw new Error(`get all tools list err: ${err}`);
        }
    })

    .get('/actual/:name', async (req, res, next) => {
        try {
            const { name } = req.params;
            const token = req.cookies.token;
            const confirmation = checkToken(token);
            if(confirmation) {
                const data = await HistoryRecord.getActual(name);
                res.json(data);
            } else {
                res.json({error: 'Brak potwierdzenia zalogowania: Brak dostępu'})
            }
            
        } catch (err) {
            handleError(err, req, res, next);
            throw new Error(`get all tools list err: ${err}`);
        }
    })

    .delete('/', async (req, res, next) => {
        try {
            const { name } = req.body;
            const token = req.cookies.token;
            const confirmation = checkToken(token);
            if(confirmation) {
                await HistoryRecord.clear(name);
                res.json({ ok: true });
            } else {
                res.json({error: 'Brak potwierdzenia zalogowania: Brak dostępu'})
            }
            
        } catch (err) {
            handleError(err, req, res, next);
            throw new Error(`get all tools list err: ${err}`);
        }
    })

export default historyRouter;