import express, { urlencoded } from 'express';
import 'express-async-errors';
import { handleError } from './utils/error';
import { appSettings } from './utils/config';

const app = express();

app.use(urlencoded({
    extended: true
}));

app.use(express.json());

app.use(handleError);

app.listen(appSettings.port, 'localhost', () => {
    console.log(`app start listening on port ${appSettings.port}`)
});