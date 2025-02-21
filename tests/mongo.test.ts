import 'dotenv/config';
import UserModelMongo from './UserModelMongo';
import { MongoDocument } from '../src';

test('get user', async () => {
    const model = new UserModelMongo();
    const results: Array<MongoDocument> = await model.limit(10).get();
    expect(results).toBeDefined();
});

test('create if not exists user', async () => {
    const model = new UserModelMongo();
    const result = await model.updateOrCreate({
        email: 'anggerpputro@gmail.com',
    },{
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
    // process.exit();
});

test('update user', async () => {
    const model = new UserModelMongo();
    const result = await model.where('email', '=', 'anggerpputro@gmail.com').update({
        name: 'angger priyardhan',
    });

    expect(result).toHaveProperty('data.name', 'angger priyardhan');
    // process.exit();
});

test('delete user', async () => {
    const model = new UserModelMongo();
    const result = await model.where('email', '=', 'anggerpputro@gmail.com').delete();

    expect(result).toHaveProperty('data', null);
    // process.exit();
});
