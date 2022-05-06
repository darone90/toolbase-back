import { Router } from 'express';
import { LoginData } from '../types/user.types';
import { UserRecord } from '../database/user.record';
import { comparer } from '../utils/crypto';
import { appSettings } from '../utils/config';

export const loginRouter = Router();

loginRouter
    .post('/', async (req, res) => {
        const { login, password } = req.body as LoginData;
        try {
            const User = await UserRecord.getOne(login);
            if (!User) {
                res.json({ login: false, info: 'Użytkownik o podanej nazwie nie istnieje', token: '' });
            } else {
                const loginData = User.showPasswordData;
                const logStatus = await comparer(password, loginData.coded, loginData.iv);
                logStatus ?
                    res.json({ login: true, info: `Użytkownik ${login} zalogowany`, token: appSettings.token })
                    : res.json({ login: false, info: `Hasło dla ${login} nieprawidłowe`, token: '' })                 
            }
        } catch (err) {
            throw new Error('Login Router error');
        }
    });

export default loginRouter;