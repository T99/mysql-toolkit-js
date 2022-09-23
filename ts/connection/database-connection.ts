/*
 * Created by Trevor Sears <trevor@trevorsears.com> (https://trevorsears.com/).
 * 10:52 AM -- December 03, 2021.
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

export type DatabaseConnectionConfig = {
	host: string,
	user: string,
	password: string,
	database: string
};

/**
 * A class that represents a single, one-off connection to a database server.
 */
export class DatabaseConnection extends Queryable {
	
	/**
	 * A connection to the database server.
	 */
	protected connection: mysql.Connection;
	
	/**
	 * Constructs a new DatabaseConnection instance with the provided existing
	 * connection instance.
	 * 
	 * @param {mysql.Connection} connection An existing {@link mysql.Connection}
	 * instance with which to construct 
	 */
	public constructor(connection: mysql.Connection);
	public constructor(config: string | DatabaseConnectionConfig);
	public constructor(connectionOrConfig: mysql.Connection | string | DatabaseConnectionConfig) {
		
		let connection: mysql.Connection;
		
		if (typeof connectionOrConfig === "string" ||
			(connectionOrConfig as mysql.ConnectionConfig).host !== undefined) {
			
			connection = mysql.createConnection(connectionOrConfig as string | mysql.ConnectionConfig)
			
		} else connection = connectionOrConfig as mysql.Connection;
		
		super(connection);
		
		this.connection = connection;
		
	}
	
	public close(): Promise<void> {
		
		return new Promise<void>((resolve: () => void, reject: (reason: mysql.MysqlError) => void): void => {
			
			this.connection.end((error: mysql.MysqlError | undefined): void => {
				
				if (error !== undefined && error !== null) reject(error);
				else resolve();
				
			});
			
		});
		
	}
	
	public destroy(): void {
		
		this.connection.destroy();
		
	}
	
}
