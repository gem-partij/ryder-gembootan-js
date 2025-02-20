import 'dotenv/config';
import UserModelMongo from './UserModelMongo';

test('create user', async () => {
    const model = new UserModelMongo();
    const result = await model.create({
        name: 'angger',
        email: 'anggerpputro@gmail.com',
    });

    // expect(result).toContainEqual({
    //     data: {
    //         name: 'angger',
    //         email: 'anggerpputro@gmail.com',
    //     },
    // });
    expect(result).toHaveProperty('data.name', 'angger');
    expect(result).toHaveProperty('data.email', 'anggerpputro@gmail.com');
});

test('update user', async () => {
    const model = new UserModelMongo();
    const result = await model.where('email', '=', 'anggerpputro@gmail.com').update({
        name: 'angger priyardhan',
    });

    expect(result).toHaveProperty('data.name', 'angger priyardhan');
});

test('delete user', async () => {
    const model = new UserModelMongo();
    const result = await model.where('email', '=', 'anggerpputro@gmail.com').delete();

    expect(result).toHaveProperty('data', null);
});