import { TypesRecord } from "../database/types.record";
import { Router } from 'express';

const categoryRouter = Router();

categoryRouter
    .get('/', async (req, res) => {
        try {
            const data = await TypesRecord.getAll();
            res.json(data);
        } catch (err) {
            throw new Error(`get all type list err: ${err}`);
            //send err to front
        }
    })

    .post('/', async (req, res) => {
        const { name, subtypes } = req.body;
        try {
            const TypeToAdd = new TypesRecord({ name, types: subtypes });
            const id = await TypeToAdd.add();
            res.json({ id });
        } catch (err) {
            throw new Error(`add new type err: ${err}`);
            //send err to front
        }
    })

    .patch('/', async (req, res) => {
        const { name, subtypes, id } = req.body;
        try {
            const TypeToPatch = await TypesRecord.getOne(id);
            TypeToPatch.setName = name;
            TypeToPatch.setTypes = subtypes;
            await TypeToPatch.patch();
            res.json({ id });
        } catch (err) {
            throw new Error(`patching type err: ${err}`);
            //send err to front
        }
    })

    .delete('/', async (req, res) => {
        const { id } = req.body;
        try {
            const ToDelete = await TypesRecord.getOne(id);
            await ToDelete.delete();
            res.json({ id });
        } catch (err) {
            throw new Error(`deleting type err: ${err}`);
            //send err to front
        }


    })

    .patch('/part', async (req, res) => {
        const { id, subtype } = req.body;
        try {
            const TypeToPatch = await TypesRecord.getOne(id);
            const newSubtypesArr: string[] = [];
            [...TypeToPatch.showData.types].forEach(type => {
                if (type !== subtype) newSubtypesArr.push(type);
            });
            TypeToPatch.setTypes = newSubtypesArr;
            await TypeToPatch.patch()
            res.json({ id });

        } catch (err) {
            throw new Error(`deleting one subtype err: ${err}`);
            //send err to front
        }
    })

export default categoryRouter;
