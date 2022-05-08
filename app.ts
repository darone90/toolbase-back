import express, { urlencoded } from 'express';
import cors from 'cors';
import 'express-async-errors';
import { handleError } from './utils/error';
import { appSettings } from './utils/config';

import loginRouter from './routers/login';
import categoryRouter from './routers/types';
import workerRouter from './routers/worker';


const app = express();

app.use(cors({
    origin: 'http://localhost:3000'
}));

app.use(urlencoded({
    extended: true
}));

app.use(express.json());
app.use(handleError);

app.use('/login', loginRouter);
app.use('/category', categoryRouter);
app.use('/workers', workerRouter);

app.set('x-powered-by', false);

app.listen(appSettings.port, 'localhost', () => {
    console.log(`app start listening on port ${appSettings.port}`)
});

export default app;
