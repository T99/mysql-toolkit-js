/*
 * Created by Trevor Sears <trevor@trevorsears.com> (https://trevorsears.com/).
 * 4:45 PM -- October 28, 2021.
 * Project: @t99/mysql-toolkit
 * 
 * @t99/mysql-toolkit - My personal toolkit of functions and functionality for working with MySQL servers in TypeScript.
 * Copyright (C) 2021 Trevor Sears
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
import { DatabaseConnection } from "./database-connection";

export type DatabaseConnectionPoolConfig = {
	host: string,
	user: string,
	password: string,
	database: string,
	connectionLimit: number
} & mysql.PoolConfig;

export type ConnectionOptions = {
	user?: string | undefined;
	password?: string | undefined;
	database?: string | undefined;
	charset?: string | undefined;
	timeout?: number | undefined;
};

export class DatabaseConnectionPool extends Queryable {

	protected connectionPool: mysql.Pool;
	
	public constructor(connectionPool: mysql.Pool);
	public constructor(config: string | DatabaseConnectionPoolConfig);
	public constructor(connectionPoolOrConfig: mysql.Pool | string | DatabaseConnectionPoolConfig) {
		
		let connectionPool: mysql.Pool;
		
		if (typeof connectionPoolOrConfig === "string" ||
			(connectionPoolOrConfig as mysql.PoolConfig).host !== undefined) {
			
			connectionPool = mysql.createPool(connectionPoolOrConfig as string | mysql.PoolConfig)
			
		} else connectionPool = connectionPoolOrConfig as mysql.Pool;
		
		super(connectionPool);
		
		this.connectionPool = connectionPool;
		
	}
	
	public getConnection(options?: ConnectionOptions): Promise<DatabaseConnection> {
		
		return new Promise<DatabaseConnection>((resolve: (value: DatabaseConnection) => void,
												reject: (reason: mysql.MysqlError) => void): void => {
			
			this.connectionPool.getConnection((error: mysql.MysqlError | undefined,
											   connection: mysql.PoolConnection): void => {
				
				if (error !== undefined && error !== null) reject(error);
				else {
					
					if (options !== undefined) {
						
						connection.changeUser(options, (error: mysql.MysqlError): void => {
							
							// Geez, callback hell sure is warm this time of year.
							
							if (error !== undefined && error !== null) reject(error);
							else resolve(new DatabaseConnection(connection));
							
						});
						
					} else resolve(new DatabaseConnection(connection));
					
				}
				
			});
			
		});
		
	}
	
	public close(): Promise<void> {
		
		return new Promise<void>((resolve: () => void, reject: (reason: mysql.MysqlError) => void): void => {
			
			this.connectionPool.end((error: mysql.MysqlError | undefined): void => {
				
				if (error !== undefined && error !== null) reject(error);
				else resolve();
				
			});
			
		});
		
	}
	
}
