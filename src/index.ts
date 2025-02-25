import MongoModel, { MongoDocument, MongoCreateResult } from "./models/MongoModel";
import SqliteModel from "./models/SqliteModel";

const _default = {
    MongoModel,
    SqliteModel,
};

export {
    _default as default,
    MongoModel,
    MongoDocument,
    MongoCreateResult,
};