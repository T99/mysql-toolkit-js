# MySQL Toolkit

My personal toolkit of functions and functionality for working with MySQL servers in TypeScript.

### [Find @t99/mysql-toolkit on NPM.](https://www.npmjs.com/package/@t99/mysql-toolkit)

## Table of Contents

 - [Installation](#installation)
 - [Basic Usage](#basic-usage)
 - [Documentation](#documentation)
 - [License](#license)

## Installation

Install from NPM with

```
$ npm install --save @t99/mysql-toolkit
```

## Basic Usage

The most common usage of this library is in using connection pools. Connection
pools are utilities for automatically distributing (and re-using) connections to
a given database server.

```typescript
import { DatabaseConnectionPool } from "@t99/mysql-toolkit";

const pool: DatabaseConnectionPool = new DatabaseConnectionPool({
	host: "my.database.com",
	user: "username",
	password: "hunter1",
	database: "plaintext_passwords",
});
```

This is a thin wrapper over the popular NPM library [`mysql`](https://www.npmjs.com/package/mysql).
You might even notice that the config object being passed to the constructor
above matches that which is expected to the constructor of the `mysql` library's
`Connection` object.

Now that we have this connection established, we can use it to query the
database that we've connected to:

```typescript
import { MySQLQueryResults } from "@t99/mysql-toolkit";

const queryResult: MySQLQueryResults = await pool.query(
	"SELECT * FROM passwords"
);
```

## Documentation

See the [wiki](https://github.com/T99/mysql-toolkit-js/wiki) for full documentation.

## License

@t99/mysql-toolkit is made available under the GNU General Public License v3.

Copyright (C) 2022 Trevor Sears
