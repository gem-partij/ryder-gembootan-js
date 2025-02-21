import { MongoClient, ObjectId, Db, Collection, Document, UpdateOptions, InsertOneResult } from 'mongodb';

export interface MongoDocument extends Document {
}

export interface MongoCreateResult {
    status: InsertOneResult;
    data: any;
}

export default class MongoModel {
    _connectionProtocol: string;
    _databaseUser: string;
    _databasePass: string;
    _databaseHost: string;
    _databaseName: string;
    _collectionName: string;
    _appName: string|undefined;

    _primaryKey: string;
    _tableName: string = '';

    _fillable: Array<string>;
    _timestamps: boolean;

    _resetOperatorsAfterQuery: boolean;

    _mongoClient: MongoClient;

    _selects: Array<string> = [];
    _wheres: Array<Array<any>> = [];
    _whereRaws = [];
    _limit: number|undefined;
    _skip: number|undefined;
    _offset: number|undefined;
    _orderBys: Array<Array<string>> = [];

    constructor(
        dbUser: string,
        dbPass: string,
        dbHost: string,
        dbName: string,
        collName: string,
        appName: string | undefined = undefined,
        connectionProtocol: string = "mongodb+srv"
    ) {
        this._connectionProtocol = connectionProtocol;
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

        this._mongoClient = this._initDB();
        this.#resetOperators();
    }

    _setConnectionProtocol(connectionProtocol: string) {
        if (this._connectionProtocol != connectionProtocol) {            
            this._connectionProtocol = connectionProtocol;
            this._initDB();
        }
    }

    _initDB() {
        // Replace the uri string with your connection string.
        const uri = `${this._connectionProtocol}://${this._databaseUser}:${this._databasePass}@${this._databaseHost}/?retryWrites=true&w=majority&appName=${this._appName}`;
        this._mongoClient = new MongoClient(uri);
        return this._mongoClient;
    }

    _getDB(): Db {
        try {
            return this._mongoClient.db(this._databaseName);
        } catch (err) {
            throw err;
        }
    }

    _getCollection(): Collection<Document> {
        try {
            return this._getDB().collection(this._collectionName);
        } catch (err) {
            throw err;
        }
    }

    select(...select: Array<string>): MongoModel {
        this._selects = select;
        return this;
    }

    where(col: string, operator: string, value: any): MongoModel {
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

    limit(limit: number): MongoModel {
        this._limit = limit;
        return this;
    }

    skip(skip: number): MongoModel {
        this._skip = skip;
        return this;
    }

    orderBy(col: string, atoz: string = 'asc'): MongoModel {
        this._orderBys.push([col, atoz]);
        return this;
    }

    /**
     * find data by id
     * @param {BigInteger} id 
     * @returns null if no data
     */
    async find(id: number) {
        try {
            const data = await this.where(this._primaryKey, '=', id)
                ._getCollection()
                .findOne(this._buildFilterQueryParam(), this._buildOptionsQueryParam());

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
            const data = await this._getCollection().findOne(this._buildFilterQueryParam(), this._buildOptionsQueryParam());
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
    async get(): Promise<Array<MongoDocument>> {
        try {
            const findResult = this._getCollection()
                .find(this._buildFilterQueryParam(), this._buildOptionsQueryParam());
            // .sort(this._buildSortQueryParam());
            
            // console.log('filter', this._buildFilterQueryParam());
            // console.log('options', this._buildOptionsQueryParam());
            // console.log('findResult', await findResult.toArray());

            const data: Array<Document> = [];
            for await (const doc of findResult) {
                // console.log('doc', doc);
                data.push(doc);
            }

            this.#resetOperators();
            return data;
        } catch (err) {
            throw err;
        }
    }

    async create(data: any): Promise<MongoCreateResult> {
        try {
            if (this._timestamps) {
                data.created_at = (new Date).toISOString();
                data.updated_at = (new Date).toISOString();
            }
            
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

    async inserts(arrayOfData: Array<any>) {
        try {
            if (this._timestamps) {
                for (let i = 0; i < arrayOfData.length; i++) {
                    arrayOfData[i].created_at = (new Date).toISOString();
                    arrayOfData[i].updated_at = (new Date).toISOString();
                }
            }

            const data = await this._getCollection().insertMany(arrayOfData);
            this.#resetOperators();
            return data;
        } catch (err) {
            throw err;
        }
    }

    async update(data: any, options: UpdateOptions = {}) {
        try {
            if (this._timestamps) {
                data.updated_at = (new Date).toISOString();
            }

            const responseData = await this._getCollection().updateOne(this._buildFilterQueryParam(), {
                $set: data
            }, options);
            this.#resetOperators();
            return {
                status: responseData,
                data,
            };
        } catch (err) {
            throw err;
        }
    }

    async updateMany(data: any, options: UpdateOptions = {}) {
        try {
            if (this._timestamps) {
                data.updated_at = (new Date).toISOString();
            }

            const responseData = await this._getCollection().updateMany(this._buildFilterQueryParam(), {
                $set: data
            }, options);
            this.#resetOperators();
            return {
                status: responseData,
                data,
            };
        } catch (err) {
            throw err;
        }
    }

    async replace(data: any) {
        try {
            if (this._timestamps) {
                data.created_at = (new Date).toISOString();
                data.updated_at = (new Date).toISOString();
            }

            const responseData = await this._getCollection().replaceOne(this._buildFilterQueryParam(), data);
            this.#resetOperators();
            return {
                status: responseData,
                data,
            };
        } catch (err) {
            throw err;
        }
    }

    async updateOrCreate(where: any, data: any) {
        this._resetOperatorsAfterQuery = false;
        try {
            // apply where
            for (const col in where) {
                this.where(col, '=', where[col]);
            }

            // // check data first
            // const check = await this.first();

            // // insert if not exists
            // if (check === undefined || check === null) {
            //     return await this.create({
            //         ...where,
            //         ...data,
            //     });
            // }
            // // update if exists
            // else {
            //     return await this.update(data);
            // }
            return await this.updateMany(data, {
                upsert: true,
            });
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
        let projectionParam: any = {};

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
        let whereParam: any = {};

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
        let sortParam: any = {};

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
        let options: any = {};

        if (this._selects.length > 0) {
            options['projection'] = this._buildProjectionQueryParam();
        }

        if (this._orderBys.length > 0) {
            options['sort'] = this._buildSortQueryParam();
        }

        if (this._skip !== undefined) {
            options['skip'] = this._skip;
        }

        if (this._limit !== undefined) {
            options['limit'] = this._limit;
        }

        return options;
    }

    _prepareDefaultInsertStatement(): string {
        const cols: Array<string> = [];
        const valuesKey: Array<string> = [];
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

    _prepareDefaultUpdateStatement(data: any): string {
        const sets: Array<string> = [];
        for (const col in data) {
            sets.push(`${col} = @${col}`);
        }

        let where = '';
        const whereArr: Array<string> = [];
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
            this._selects = [];
            this._wheres = [];
            // this._whereRaws = [];
            this._orderBys = [];
            this._limit = undefined;
            this._skip = undefined;
            this._offset = undefined;
        }
    }

}