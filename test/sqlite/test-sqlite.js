import UserModel from "./UserModel.js";
    
// init model
const model = new UserModel();

// create data
const data = model.create({
    name: 'angger',
    email: 'anggerpputro@gmail.com',
});

const allData = model.get();
console.log('allData', allData);
