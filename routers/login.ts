import { Router } from 'express';
import { LoginData } from '../types/user.types';
import { UserRecord } from '../database/user.record';
import { comparer } from '../utils/crypto';
import { appSettings } from '../utils/config';
import { appConfig } from '../config.data';
import { handleError } from '../utils/error';
import { checkToken } from '../utils/loginConfirm';

export const loginRouter = Router();

loginRouter
    .post('/', async (req, res, next) => {
        const { login, password } = req.body as LoginData;
        try {
            const User = await UserRecord.getOne(login);
            if (!User) {
                res.json({ login: false, info: 'Not existed', token: null, user: null });

            } else {
                const loginData = User.showPasswordData;
                const logStatus = await comparer(password, loginData.coded, loginData.iv);

                logStatus ?
                    res
                       .cookie('token',appConfig.token, { maxAge: 1000*60*60*24, httpOnly: true, secure: false, domain: 'localhost' })
                       .json({ login: true, info: `Correct`, token: appSettings.token, user: login })

                    : res.json({ login: false, info: `Uncorrect`, token: null, user: null })
            }
        } catch (err) {
            handleError(err, req, res, next);
            throw new Error('Login Router error');
        }
    })
    .patch('/password', async (req, res, next) => {
        try {
            const { password, newPassword, confirm, user } = req.body;
            const token = req.cookies.token;
            const confirmation = checkToken(token);
            if(confirmation) {
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
            } else {
                res.json({error: 'Brak potwierdzenia zalogowania: Brak dostępu'})
            }       
        } catch (err) {  
            handleError(err, req, res, next);
            throw new Error('Login Router error');
        }
    })

    .patch('/login', async (req, res, next) => {
        try {
            const { password, newLogin, user } = req.body;
            const token = req.cookies.token;
            const confirmation = checkToken(token);
            if(confirmation) {
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
            } else {
                res.json({error: 'Brak potwierdzenia zalogowania: Brak dostępu'})
            }          
        } catch (err) {
            handleError(err, req, res, next);
            throw new Error('Login Router error');
        }
    })

export default loginRouter;
