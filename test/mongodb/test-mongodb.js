import 'dotenv/config';
import UserModel from './UserModel.js';

const main = async () => {
    const model = new UserModel();

    const result = await model.get();

    // const result = await model.create({
    //     name: 'angger',
    //     email: 'anggerpputro@gmail.com',
    // });

    // const result = await model.where('email', '=', 'anggerpputro@gmail.com').update({
    //     name: 'angger priyardhan',
    // });

    // const result = await model.where('email', '=', 'anggerpputro@gmail.com').delete();

    console.log('result', result);
};

main();