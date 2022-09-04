import { TypesRecord } from "../database/types.record";
import { Router } from 'express';
import { handleError } from '../utils/error';
import { checkToken } from '../utils/loginConfirm';

const categoryRouter = Router();

categoryRouter
    .get('/', async (req, res, next) => {
        try {
            const token = req.cookies.token;
            const confirmation = checkToken(token);
            if(confirmation) {
                const data = await TypesRecord.getAll();
                res.json(data);
            } else {
                res.json({error: 'Brak potwierdzenia zalogowania: Brak dostępu'})
            }
            
        } catch (err) {
            handleError(err, req, res, next);
            throw new Error(`get all type list err: ${err}`);
        }
    })

    .post('/', async (req, res, next) => {
        const { name, subtypes } = req.body;
        try {
            const token = req.cookies.token;
            const confirmation = checkToken(token);
            if(confirmation) {
                const TypeToAdd = new TypesRecord({ name, types: subtypes });
                const id = await TypeToAdd.add();
                res.json({ id });
            } else {
                res.json({error: 'Brak potwierdzenia zalogowania: Brak dostępu'})
            }

        } catch (err) {
            handleError(err, req, res, next);
            throw new Error(`add new type err: ${err}`);
        }
    })

    .patch('/', async (req, res, next) => {
        const { name, subtypes, id } = req.body;
        try {
            const token = req.cookies.token;
            const confirmation = checkToken(token);
            if(confirmation) {
                const TypeToPatch = await TypesRecord.getOne(id);
                TypeToPatch.setName = name;
                TypeToPatch.setTypes = subtypes;
                await TypeToPatch.patch();
                res.json({ id });
            } else {
                res.json({error: 'Brak potwierdzenia zalogowania: Brak dostępu'})
            }

        } catch (err) {
            handleError(err, req, res, next);
            throw new Error(`patching type err: ${err}`);
        }
    })

    .delete('/', async (req, res, next) => {
        const { id } = req.body;
        try {
            const token = req.cookies.token;
            const confirmation = checkToken(token);
            if(confirmation) {
                const ToDelete = await TypesRecord.getOne(id);
                await ToDelete.delete();
                res.json({ id });
            } else {
                res.json({error: 'Brak potwierdzenia zalogowania: Brak dostępu'})
            }

        } catch (err) {
            handleError(err, req, res, next);
            throw new Error(`deleting type err: ${err}`);
        }


    })

    .patch('/part', async (req, res, next) => {
        const { id, subtype } = req.body;
        try {
            const token = req.cookies.token;
            const confirmation = checkToken(token);
            if(confirmation) {
                const TypeToPatch = await TypesRecord.getOne(id);
                const newSubtypesArr: string[] = [];
                [...TypeToPatch.showData.types].forEach(type => {
                    if ([...TypeToPatch.showData.types].length > 1) {
                        if (type !== subtype) newSubtypesArr.push(type);
                    } else {
                        return;
                    }
                });
                TypeToPatch.setTypes = newSubtypesArr;
                await TypeToPatch.patch()
                res.json({ id });
            } else {
                res.json({error: 'Brak potwierdzenia zalogowania: Brak dostępu'})
            }

        } catch (err) {
            handleError(err, req, res, next);
            throw new Error(`deleting one subtype err: ${err}`);
        }
    })

export default categoryRouter;
