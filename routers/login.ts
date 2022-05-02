import { Router } from 'express';
import { LoginData } from '../types/user.types';
import { UserRecord } from '../database/user.record';
import { comparer } from '../utils/crypto';

export const loginRouter = Router();

loginRouter
    .get('/', async (req, res) => {
        const { login, password } = req.body as LoginData;
        try {
            const User = await UserRecord.getOne(login);
            if (!User) {
                res.json({ login: false, info: 'Użytkownik o podanej nazwie nie istnieje' });
            } else {
                const loginData = User.showPasswordData;
                const logStatus = await comparer(password, loginData.coded, loginData.iv);
                res.json({ login: logStatus, info: `Logowanie użytkownika ${login}` })
            }
        } catch (err) {
            throw new Error('Login Router error');
        }
    })