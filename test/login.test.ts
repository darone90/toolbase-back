import request from 'supertest';
import app from '../app';
import { appSettings } from '../utils/config';


test('post login without data', async () => {
    await request(app)
        .post('/login')
        .send({ login: '', password: '' })
        .expect('Content-Type', /json/)
        .expect(200)
        .expect({ login: false, info: 'Użytkownik o podanej nazwie nie istnieje', token: '' })

});

test('post login with wrong password', async () => {
    await request(app)
        .post('/login')
        .send({ login: 'Andrzej', password: 'jsjsjsjsj' })
        .expect('Content-Type', /json/)
        .expect(200)
        .expect({ login: false, info: `Hasło dla Andrzej nieprawidłowe`, token: '' })

});

test('post to login with correct data', async () => {
    await request(app)
        .post('/login')
        .send({ login: 'Andrzej', password: '12345678' })
        .expect('Content-Type', /json/)
        .expect(200)
        .expect({ login: true, info: `Użytkownik Andrzej zalogowany`, token: appSettings.token })

});
