// const { SqliteModel } = require("ryder-gembootan");
import RyderGembootan from "ryder-gembootan";

export default class UserModel extends RyderGembootan.SqliteModel {
    #id
    #name
    #email
    #created_at
    #updated_at

    constructor() {
        super('./database-sqlite.db', 'users');
        this._fillable = [
            'name',
            'email',
        ];
    }

    _initDB() {
        try {
            const db = this._getDB();
            const sql = `CREATE TABLE IF NOT EXISTS ${this._tableName} (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                email TEXT NOT NULL UNIQUE,
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL
            )`;
            return db.prepare(sql).run();
        } catch (err) {
            throw err;
        }
    }

}