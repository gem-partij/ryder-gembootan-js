# Ryder Gembootan [![NPM version](https://img.shields.io/npm/v/ryder-gembootan.svg?style=flat-square)](https://www.npmjs.com/package/ryder-gembootan)

Ryder Gembootan is a Simple Query Builder For Javascript.

-   [Install](#-install)
-   [Usage](#-usage)

## Install

```bash
npm install ryder-gembootan
```

Or installing with yarn? `yarn add ryder-gembootan`

## Usage

### MongoDB

First you need to create model first and extends RyderGembootan model

```javascript
// UserModel.js
import RyderGembootan from "ryder-gembootan";

export default class UserModel extends RyderGembootan.MongoModel {
	constructor() {
		super(
			"MONGODB_USER",
			"MONGODB_PASS",
			"MONGODB_HOST",
			"MONGODB_DBNAME",
			"MONGODB_COLLNAME",
			"MONGODB_APPNAME"
		);
	}
}
```

After then you can use this model to do a query into your database easily

```javascript
// index.js

import UserModel from "./UserModel.js";

const main = async () => {
	// initialize model object
	const model = new UserModel();

	// get all data
	const result = await model.get();

	console.log("result", result);
};

main();
```

#### Get Data

to get data you can use `first()`, `find()`, or `get()`

###### get all data

```javascript
// get all data
await model.get();
```

###### get first record from database

```javascript
// get first record
await model.first();
```

###### get data by id from database

```javascript
// get data by id
await model.find("15198465465138");
```

#### Where

get all data from database where email = anggerpputro@gmail.com

```javascript
await model.where("email", "=", "anggerpputro@gmail.com").get();
```

get first data from database where email = anggerpputro@gmail.com

```javascript
await model.where("email", "=", "anggerpputro@gmail.com").first();
```

#### Insert Data

insert into database with data name: angger, and email: anggerpputro@gmail.com

```javascript
await model.create({
	name: "angger",
	email: "anggerpputro@gmail.com",
});
```

#### Update Data

update data, set name = angger priyardhan, where email = anggerpputro@gmail.com

```javascript
await model.where("email", "=", "anggerpputro@gmail.com").update({
	name: "angger priyardhan",
});
```

#### Delete Data

delete from database where email = anggerpputro@gmail.com

```javascript
await model.where("email", "=", "anggerpputro@gmail.com").delete();
```
