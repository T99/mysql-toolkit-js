/*
 * Created by Trevor Sears <trevor@trevorsears.com> (https://trevorsears.com/).
 * 9:05 AM -- December 6th, 2021
 * Project: @t99/mysql-toolkit
 * 
 * @t99/mysql-toolkit - My personal toolkit of functions and functionality for
 *     working with MySQL servers in TypeScript.
 * Copyright (C) 2022 Trevor Sears
 * 
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 * 
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 * 
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

import mysql from "mysql";
import { Queryable } from "./queryable";
import { ConnectionOptions, DatabaseConnectionPool } from "./database-connection-pool";
import { DatabaseConnection } from "./database-connection";
import { MySQLQueryResults } from "../util/mysql-query-results";

export class DatabaseConnectionSubPool extends Queryable {
	
	protected connectionPool: DatabaseConnectionPool;
	
	protected config: ConnectionOptions;

	public constructor(connectionPool: DatabaseConnectionPool, config: ConnectionOptions) {
		
		super(connectionPool.queryableAgent)
		
		this.connectionPool = connectionPool;
		this.config = config;
		
	}
	
	public async getConnection(): Promise<DatabaseConnection> {
		
		return this.connectionPool.getConnection(this.config);
		
	}
	
	public async query(options: string | mysql.QueryOptions, values?: any[]): Promise<MySQLQueryResults> {
		
		return (await this.getConnection()).query(options, values);
		
	}
	
}
