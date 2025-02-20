// const { SqliteModel } = require("ryder-gembootan");
import RyderGembootan from "../../index.js";

export default class UserModel extends RyderGembootan.MongoModel {

    constructor() {
        super(
            process.env.MONGODB_USER,
            process.env.MONGODB_PASS,
            process.env.MONGODB_HOST,
            process.env.MONGODB_DBNAME,
            process.env.MONGODB_COLLNAME,
            process.env.MONGODB_APPNAME
        );
    }

}