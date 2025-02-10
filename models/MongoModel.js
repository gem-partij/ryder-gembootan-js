import { MongoClient, ObjectId } from 'mongodb';

export default class MongoModel {

    constructor(dbUser, dbPass, dbHost, dbName, collName, appName = '') {
        this._databaseUser = dbUser;
        this._databasePass = dbPass;
        this._databaseHost = dbHost;
        this._databaseName = dbName;
        this._collectionName = collName;
        this._appName = appName;

        this._primaryKey = '_id';

        this._fillable = [];
        this._timestamps = true;

        this._resetOperatorsAfterQuery = true;

        this._initDB();
        this.#resetOperators();
    }

    _initDB() {
        // Replace the uri string with your connection string.
        const uri = `mongodb+srv://${this._databaseUser}:${this._databasePass}@${this._databaseHost}/?retryWrites=true&w=majority&appName=${this._appName}`;
        this._mongoClient = new MongoClient(uri);
    }

    _getDB() {
        try {
            return this._mongoClient.db(this._databaseName);
        } catch (err) {
            throw err;
        }
    }

    _getCollection() {
        try {
            return this._getDB().collection(this._collectionName);
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

    // whereRaw(raw) {
    //     this._whereRaws.push(raw);
    //     return this;
    // }

    // whereDate(col, dateValue) {
    //     this.whereRaw(`date(${col}) = date('${dateValue}')`);
    //     return this;
    // }

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
     * @returns null if no data
     */
    async find(id) {
        try {
            const data = await this.where(this._primaryKey, '=', id)
                ._getCollection()
                .findOne(this._buildFilterQueryParam());

            this.#resetOperators();
            return data;
        } catch (err) {
            throw err;
        }
    }

    /**
     * get data limit 1
     * @returns null if no data
     */
    async first() {
        try {
            const data = await this._getCollection().findOne(this._buildFilterQueryParam());
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
    async get() {
        try {
            const findResult = this._getCollection()
                .find(this._buildFilterQueryParam(), this._buildOptionsQueryParam());
                // .sort(this._buildSortQueryParam());

            const data = [];
            for await (const doc of findResult) {
                data.push(doc);
            }

            this.#resetOperators();
            return data;
        } catch (err) {
            throw err;
        }
    }

    async create(data) {
        try {
            const responseData = await this._getCollection().insertOne(data);
            this.#resetOperators();
            return {
                status: responseData,
                data: {
                    _id: responseData.insertedId,
                    ...data,
                },
            };
        } catch (err) {
            throw err;
        }
    }

    async inserts(arrayOfData) {
        try {
            const data = await this._getCollection().insertMany(arrayOfData);
            this.#resetOperators();
            return data;
        } catch (err) {
            throw err;
        }
    }

    async update(data) {
        try {
            const responseData = await this._getCollection().updateOne(this._buildFilterQueryParam(), {
                $set: data
            });
            this.#resetOperators();
            return {
                status: responseData,
                data,
            };
        } catch (err) {
            throw err;
        }
    }

    async updateOrCreate(where, data) {
        this._resetOperatorsAfterQuery = false;
        try {
            // apply where
            for (const col in where) {
                this.where(col, '=', where[col]);
            }

            // check data first
            const check = await this.first();

            // insert if not exists
            if (check === undefined || check === null) {
                return await this.create({
                    ...where,
                    ...data,
                });
            }
            // update if exists
            else {
                return await this.update(data);
            }
        } catch (err) {
            throw err;
        } finally {
            this._resetOperatorsAfterQuery = true;
        }
    }

    async delete() {
        try {
            const result = await this._getCollection().deleteMany(this._buildFilterQueryParam());
            this.#resetOperators();
            return {
                status: result,
                data: null,
            };
        } catch (err) {
            throw err;
        }
    }

    _buildProjectionQueryParam() {
        let projectionParam = {};

        let excludeId = true;
        for (let i = 0; i < this._selects.length; i++) {
            const s = this._selects[i];
            projectionParam[s] = 1;
        }

        if (excludeId) {
            projectionParam['_id'] = 0;
        }

        return projectionParam;
    }

    _buildFilterQueryParam() {
        let whereParam = {};

        for (let i = 0; i < this._wheres.length; i++) {
            const w = this._wheres[i];

            const attribute = w[0];
            const operator = w[1];
            const value = w[2];

            if (attribute == this._primaryKey) {
                whereParam[attribute] = new ObjectId(value);
            } else {
                switch (operator) {
                    case '=':
                        whereParam[attribute] = {
                            $eq: value,
                        };
                        break;
                    case '!=':
                        whereParam[attribute] = {
                            $ne: value,
                        };
                        break;
                    case '<':
                        whereParam[attribute] = {
                            $lt: value,
                        };
                        break;
                    case '<=':
                        whereParam[attribute] = {
                            $lte: value,
                        };
                        break;
                    case '>':
                        whereParam[attribute] = {
                            $gt: value,
                        };
                        break;
                    case '>=':
                        whereParam[attribute] = {
                            $gte: value,
                        };
                        break;
                    default:
                        whereParam[attribute] = value;
                }
            }
        }

        // console.log('whereParam', whereParam);
        return whereParam;
    }

    _buildSortQueryParam() {
        let sortParam = {};

        for (let i = 0; i < this._orderBys.length; i++) {
            const o = this._orderBys[i];

            const attribute = o[0];
            const order = o[1].toString().toUpperCase();

            if (order == 'ASC') {
                sortParam[attribute] = 1;
            } else if (order == 'DESC') {
                sortParam[attribute] = -1;
            }
        }

        return sortParam;
    }

    _buildOptionsQueryParam() {
        let options = {};

        if (this._selects.length > 0) {
            options['projection'] = this._buildProjectionQueryParam();
        }

        if (this._orderBys.length > 0) {
            options['sort'] = this._buildSortQueryParam();
        }

        if (this._limit !== undefined) {
            options['limit'] = this._limit;
        }

        return options;
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

    #resetOperators() {
        if (this._resetOperatorsAfterQuery) {            
            this._selects = ['*'];
            this._wheres = [];
            // this._whereRaws = [];
            this._orderBys = [];
            this._limit = undefined;
            this._offset = undefined;
        }
    }

}