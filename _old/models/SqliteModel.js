// import sqlite3 from "sqlite3";
// const Database = require('better-sqlite3');
import Database from "better-sqlite3";

export default class SqliteModel {

    constructor(fileName, tableName, options = {}) {
        this._fileName = fileName;
        this._tableName = tableName;
        this._connOptions = options;
        this._primaryKey = 'id';

        this._fillable = [];
        this._timestamps = true;

        this._resetOperatorsAfterQuery = true;

        this._initDB();
        this.#resetOperators();
    }

    _initDB() {
    }

    _getDB() {
        try {
            // return new sqlite3.Database('../scraper-nodejs.db');
            // return new Database('./database-sqlite.db', {
            //     // verbose: console.log
            // });
            return new Database(this._fileName, this._connOptions);
        } catch (err) {
            throw err;
        }
    }

    select(...select) {
        this._selects = select;
        return this;
    }

    where(col, operator, value) {
        this._wheres.push([
            col,
            operator,
            value,
        ]);
        return this;
    }

    whereRaw(raw) {
        this._whereRaws.push(raw);
        return this;
    }

    whereDate(col, dateValue) {
        this.whereRaw(`date(${col}) = date('${dateValue}')`);
        return this;
    }

    limit(limit) {
        this._limit = limit;
        return this;
    }

    orderBy(col, atoz = 'asc') {
        this._orderBys.push([col, atoz]);
        return this;
    }

    /**
     * find data by id
     * @param {BigInteger} id 
     * @returns undefined if no data
     */
    find(id) {
        try {
            const db = this._getDB();

            this.where(this._primaryKey, '=', id);
            this.limit(1);
            const stmt = db.prepare(this._prepareDefaultSelectStatement());

            const data = stmt.get();

            this.#resetOperators();
            return data;
        } catch (err) {
            throw err;
        }
    }

    /**
     * get data limit 1
     * @returns undefined if no data
     */
    first() {
        try {
            const db = this._getDB();

            this.limit(1);
            const stmt = db.prepare(this._prepareDefaultSelectStatement());

            const data = stmt.get();

            this.#resetOperators();
            return data;
        } catch (err) {
            throw err;
        }
    }

    /**
     * get array of data
     * @returns [] if no data
     */
    get() {
        try {
            const db = this._getDB();
            const stmt = db.prepare(this._prepareDefaultSelectStatement());
            const data = stmt.all();
            this.#resetOperators();
            return data;
        } catch (err) {
            throw err;
        }
    }

    create(data) {
        try {
            const db = this._getDB();
            const stmt = db.prepare(this._prepareDefaultInsertStatement());
            const responseData = stmt.run(data);
            this.#resetOperators();
            return responseData;
        } catch (err) {
            throw err;
        }
    }

    inserts(arrayOfData) {
        try {
            const db = this._getDB();

            const stmt = db.prepare(this._prepareDefaultInsertStatement());

            const insertMany = db.transaction((datas) => {
                for (const data of datas) {
                    stmt.run(data);
                }
            });

            const data = insertMany(arrayOfData);
            this.#resetOperators();
            return data;
        } catch (err) {
            throw err;
        }
    }

    update(data) {
        try {
            const db = this._getDB();

            const stmt = db.prepare(this._prepareDefaultUpdateStatement(data));

            const responseData = stmt.run(data);
            this.#resetOperators();
            return responseData;
        } catch (err) {
            throw err;
        }
    }

    updateOrCreate(where, data) {
        this._resetOperatorsAfterQuery = false;
        try {
            // apply where
            for (const col in where) {
                this.where(col, '=', where[col]);
            }

            // check data first
            const check = this.first();

            // insert if not exists
            if (check === undefined) {
                return this.create({
                    ...where,
                    ...data,
                });
            }
            // update if exists
            else {
                return this.update(data);
            }
        } catch (err) {
            throw err;
        } finally {
            this._resetOperatorsAfterQuery = true;
        }
    }

    delete() {
        try {
            const db = this._getDB();
            const stmt = db.prepare(this._prepareDefaultDeleteStatement());
            const result = stmt.run();
            this.#resetOperators();
            return result;
        } catch (err) {
            throw err;
        }
    }

    _prepareDefaultSelectStatement() {
        let select = this._selects.join(',');
        
        let where = '';
        const whereArr = [];
        for (let i = 0; i < this._wheres.length; i++) {
            const w = this._wheres[i];
            whereArr.push(`${w[0]} ${w[1]} '${w[2]}'`);
        }
        for (let i = 0; i < this._whereRaws.length; i++) {
            whereArr.push(`${this._whereRaws[i]}`);
        }
        if (whereArr.length > 0) {
            where = `WHERE ${whereArr.join(' AND ')}`;
        }

        let orderBy = '';
        const orderByArr = [];
        for (let i = 0; i < this._orderBys.length; i++) {
            const o = this._orderBys[i];
            orderByArr.push(`${o[0]} ${o[1]}`);
        }
        if (orderByArr.length > 0) {
            orderBy = `ORDER BY ${orderByArr.join(', ')}`;
        }

        let limit = '';
        if (this._limit !== undefined) {
            limit = `LIMIT ${this._limit}`;
        }

        const sql = `SELECT ${select} FROM ${this._tableName} ${where} ${orderBy} ${limit}`;
        // console.log(`[model] ${sql}`);
        return sql;
    }

    _prepareDefaultInsertStatement() {
        const cols = [];
        const valuesKey = [];
        this._fillable.forEach(col => {
            cols.push(col);
            valuesKey.push(`@${col}`);
        });

        if (this._timestamps) {
            cols.push('created_at');
            cols.push('updated_at');
            
            valuesKey.push(`datetime('now', 'localtime')`);
            valuesKey.push(`datetime('now', 'localtime')`);
        }
            
        const sql = `INSERT INTO ${this._tableName} (${cols.join(',')}) VALUES (${valuesKey.join(',')})`;
        // console.log(`[model] ${sql}`);
        return sql;
    }

    _prepareDefaultUpdateStatement(data) {
        const sets = [];
        for (const col in data) {
            sets.push(`${col} = @${col}`);
        }

        let where = '';
        const whereArr = [];
        for (let i = 0; i < this._wheres.length; i++) {
            const w = this._wheres[i];
            whereArr.push(`${w[0]} ${w[1]} '${w[2]}'`);
        }
        for (let i = 0; i < this._whereRaws.length; i++) {
            whereArr.push(`${this._whereRaws[i]}`);
        }
        if (whereArr.length > 0) {
            where = `WHERE ${whereArr.join(' AND ')}`;
        }

        if (this._timestamps) {
            sets.push(`updated_at = datetime('now', 'localtime')`);
        }
            
        const sql = `UPDATE ${this._tableName} SET ${sets.join(', ')} ${where}`;
        // console.log(`[model] ${sql}`);
        return sql;
    }

    _prepareDefaultDeleteStatement() {
        let where = '';
        const whereArr = [];
        for (let i = 0; i < this._wheres.length; i++) {
            const w = this._wheres[i];
            whereArr.push(`${w[0]} ${w[1]} '${w[2]}'`);
        }
        for (let i = 0; i < this._whereRaws.length; i++) {
            whereArr.push(`${this._whereRaws[i]}`);
        }
        if (whereArr.length > 0) {
            where = `WHERE ${whereArr.join(' AND ')}`;
        }

        const sql = `DELETE FROM ${this._tableName} ${where}`;
        // console.log(`[model] ${sql}`);
        return sql;
    }

    #resetOperators() {
        if (this._resetOperatorsAfterQuery) {            
            this._selects = ['*'];
            this._wheres = [];
            this._whereRaws = [];
            this._orderBys = [];
            this._limit = undefined;
            this._offset = undefined;
        }
    }

}