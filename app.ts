import express, { urlencoded } from 'express';
import 'express-async-errors';
import { handleError } from './utils/error';
import { appSettings } from './utils/config';

import loginRouter from './routers/login';


const app = express();

app.use(urlencoded({
    extended: true
}));
app.use(express.json());
app.use(handleError);
app.use('/login', loginRouter);

app.set('x-powered-by', false);

app.listen(appSettings.port, 'localhost', () => {
    console.log(`app start listening on port ${appSettings.port}`)
});

export default app;
