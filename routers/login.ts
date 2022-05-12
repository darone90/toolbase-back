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
                res.json({ login: false, info: 'Not existed', token: null, user: null });

            } else {
                const loginData = User.showPasswordData;
                const logStatus = await comparer(password, loginData.coded, loginData.iv);

                logStatus ?
                    res.json({ login: true, info: `Correct`, token: appSettings.token, user: login })
                    : res.json({ login: false, info: `Uncorrect`, token: null, user: null })
            }
        } catch (err) {
            throw new Error('Login Router error');
            // send error to front
        }
    })
    .patch('/password', async (req, res) => {
        const { password, newPassword, confirm, user } = req.body;
        try {
            const User = await UserRecord.getOne(user);
            if (!User) res.json({ ok: false });
            else {
                const loginData = User.showPasswordData;
                const logStatus = await comparer(password, loginData.coded, loginData.iv);
                if (!logStatus) res.json({ id: `false` });
                else {
                    const confirmation = newPassword === confirm;
                    if (!confirmation) res.json({ id: 'false' });
                    else {
                        User.newPassword = newPassword;
                        await User.patch();
                        res.json({ id: 'true' })
                    }
                }
            }
        } catch (err) {
            throw new Error('Login Router error');
            //send error to front
        }
    })

    .patch('/login', async (req, res) => {
        const { password, newLogin, user } = req.body;
        try {
            const User = await UserRecord.getOne(user);
            if (!User) res.json({ id: 'false' });
            else {
                const loginData = User.showPasswordData;
                const logStatus = await comparer(password, loginData.coded, loginData.iv);
                if (!logStatus) res.json({ id: 'false' });
                else {
                    User.newLogin = newLogin;
                    await User.patchLogin();
                    res.json({ id: 'true' })
                }
            }
        } catch (err) {
            throw new Error('Login Router error');
            //send error to front
        }
    })

export default loginRouter;
