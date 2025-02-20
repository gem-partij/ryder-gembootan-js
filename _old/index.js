// const { MongoModel } = require("./models/MongoModel");
// const { SqliteModel } = require("./models/SqliteModel");

// module.exports = {
//     SqliteModel,
//     MongoModel,
// };

import MongoModel from "./models/MongoModel.js";
import SqliteModel from "./models/SqliteModel.js";

export default {
    MongoModel,
    SqliteModel,
}

// export const MongoModel = MongoModel;
// export const SqliteModel = SqliteModel;