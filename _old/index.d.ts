import MongoModel from "./models/MongoModel.ts";
import SqliteModel from "./models/SqliteModel.js";

declare let _default: {
    Mongo: MongoModel,
    Sqlite: SqliteModel,
};

export default _default;

export * as MongoModel from "./models/MongoModel.ts";
export * as SqliteModel from "./models/SqliteModel.js";
