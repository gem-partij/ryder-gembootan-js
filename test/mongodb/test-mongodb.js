import 'dotenv/config';
import UserModel from './UserModel.js';

const main = async () => {
    const model = new UserModel();

    // const result = await model.limit(10).get();
    const result = await model.orderBy('meta_published_date', 'desc').first();

    // const result = await model.create({
    //     name: 'angger',
    //     email: 'anggerpputro@gmail.com',
    // });

    // const result = await model.where('email', '=', 'anggerpputro@gmail.com').update({
    //     name: 'angger priyardhan',
    // });

    // const result = await model.where('email', '=', 'anggerpputro@gmail.com').delete();

    // const result = await model.where('email', '=', 'anggerpputro@gmail.com').replace({
    //     name: 'angger priyardhan putro',
    //     address: 'semarang'
    // });

    // const result = await model.updateOrCreate({
    //     email: 'anggerpputro@gmail.com',
    // }, {
    //     name: 'angger edit',
    //     address: 'bumi'
    // });

    console.log('result', result);
    process.exit();
};

main();