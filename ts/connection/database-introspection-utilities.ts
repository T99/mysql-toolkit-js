/*
 * Created by Trevor Sears <trevor@trevorsears.com> (https://trevorsears.com/).
 * 10:49 AM -- December 03, 2021.
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

import { Queryable } from "./queryable";

/**
 * A collection of introspection tools that can be used to query the form of databases, tables, columns, etc.
 * 
 * @author Trevor Sears <trevor@trevorsears.com> (https://trevorsears.com/)
 * @version v0.1.0
 * @since v0.1.0
 */
export class DatabaseIntrospectionUtilities {
	
	/**
	 * The Queryable instance to use to make the queries specified by the methods in this class.
	 */
	protected queryable: Queryable;
	
	/**
	 * Initializes a new DatabaseMetaUtilities instance using the connection available via the given Queryable instance.
	 *
	 * @param {Queryable} queryable The Queryable instance to use to make the queries specified by the methods in this
	 * class.
	 */
	public constructor(queryable: Queryable) {
		
		this.queryable = queryable;
		
	}
	
	/**
	 * Returns true if the provided error is a MysqlError indicating that a given resource does not exist (such as a
	 * database, table, etc).
	 *
	 * @param {any} error The error to check if it is a 'resource not found'-type error.
	 * @return {boolean} true if the provided error is a MysqlError indicating that a given resource does not exist.
	 */
	private static isErrorResourceNotFoundError(error: any): boolean {
		
		switch (error?.originalError?.code) {
			
			case "ER_BAD_DB_ERROR":
			case "ER_NO_SUCH_TABLE":
				return true;
			
			default:
				return false;
			
		}
		
	}
	
	/**
	 * Returns a Promise that resolves to true if the given database name matches the name of the name of a database
	 * present on the server of the associated Queryable instance, otherwise resolving to false.
	 *
	 * If the empty string is passed for 'databaseName', this function will return false.
	 *
	 * @param {string} databaseName The name of the database to check for on the server of the associated Queryable
	 * instance.
	 * @return {Promise<boolean>} A Promise that resolves to true if the given database name matches the name of the
	 * name of a database present on the server of the associated Queryable instance, otherwise resolving to false.
	 */
	public async doesDatabaseExist(databaseName: string): Promise<boolean> {
		
		if (databaseName === "") return false;
		else {
			
			try {
				
				return await this.queryable.queryForExistence(
					"SHOW DATABASES LIKE ?",
					[databaseName]
				);
				
			} catch (error: any) {
				
				if (DatabaseIntrospectionUtilities.isErrorResourceNotFoundError(error)) return false;
				else throw error;
				
			}
			
		}
		
	}
	
	/**
	 * Returns a Promise that resolves to an array of strings representing the names of the databases present on the
	 * server of the associated Queryable instance.
	 *
	 * @return {Promise<string[]>} A Promise that resolves to an array of strings representing the names of the
	 * databases present on the server of the associated Queryable instance.
	 */
	public async getDatabases(): Promise<string[]> {
		
		return await this.queryable.queryForColumnArray(
			"SHOW DATABASES"
		);
		
	}
	
	/**
	 * Returns a Promise that resolves to true if the given table and database name pair match the respective names of a
	 * table and database pair present on the server of the associated Queryable instance, otherwise resolving to false.
	 *
	 * If the empty string is passed for 'databaseName' or 'tableName', this function will return false.
	 *
	 * @param {string} databaseName The name of the database that contains the table to check for on the server of the
	 * associated Queryable instance.
	 * @param {string} tableName The name of the table to check for in the specified database on the server of the
	 * associated Queryable instance.
	 * @return {Promise<boolean>} A Promise that resolves to true if the given table and database name pair match the
	 * respective names of a table and database pair present on the server of the associated Queryable instance,
	 * otherwise resolving to false.
	 */
	public async doesTableExist(databaseName: string, tableName: string): Promise<boolean> {
		
		if (databaseName === "" || tableName === "") return false;
		else {
			
			try {
				
				databaseName = this.queryable.escapeId(databaseName);
				
				return await this.queryable.queryForExistence(
					`SHOW TABLES FROM ${databaseName} LIKE ?`,
					[tableName]
				);
				
			} catch (error: any) {
				
				if (DatabaseIntrospectionUtilities.isErrorResourceNotFoundError(error)) return false;
				else throw error;
				
			}
			
		}
		
	}
	
	/**
	 * Returns a Promise that resolves to an array of strings representing the names of the tables present in the
	 * specified database on the server of the associated Queryable instance.
	 *
	 * @param {string} databaseName The name of the database for which to retrieve its tables.
	 * @return {Promise<string[]>} A Promise that resolves to an array of strings representing the names of the tables
	 * present in the specified database on the server of the associated Queryable instance.
	 */
	public async getTables(databaseName: string): Promise<string[]> {
		
		databaseName = this.queryable.escapeId(databaseName);
		
		return await this.queryable.queryForColumnArray(
			`SHOW TABLES FROM ${databaseName}`
		);
		
	}
	
	/**
	 * Returns a Promise that resolves to true if the given column, table, and database name pair match the respective
	 * names of a column, table, and database pair present on the server of the associated Queryable instance, otherwise
	 * resolving to false.
	 *
	 * If the empty string is passed for 'databaseName', 'tableName', or 'columnName', this function will return false.
	 *
	 * @param {string} databaseName The name of the database that contains the table and column to check for on the
	 * server of the associated Queryable instance.
	 * @param {string} tableName The name of the table that contains the column to check for on the server of the
	 * associated Queryable instance.
	 * @param {string} columnName The name of the column to check for in the specified database and table on the server
	 * of the associated Queryable instance.
	 * @return {Promise<boolean>} A Promise that resolves to true if the given column, table, and database name pair
	 * match the respective names of a column, table, and database pair present on the server of the associated
	 * Queryable instance, otherwise resolving to false.
	 */
	public async doesColumnExist(databaseName: string, tableName: string, columnName: string): Promise<boolean> {
		
		if (databaseName === "" || tableName === "" || columnName === "") return false;
		else {
			
			try {
				
				databaseName = this.queryable.escapeId(databaseName);
				tableName = this.queryable.escapeId(tableName);
				
				return await this.queryable.queryForExistence(
					`SHOW COLUMNS FROM ${databaseName}.${tableName} LIKE ?`,
					[columnName]
				);
				
			} catch (error: any) {
				
				if (DatabaseIntrospectionUtilities.isErrorResourceNotFoundError(error)) return false;
				else throw error;
				
			}
			
		}
		
	}
	
	/**
	 * Returns a Promise that resolves to an array of strings representing the names of the tables present in the
	 * specified database on the server of the associated Queryable instance.
	 *
	 * @param {string} databaseName The name of the database that contains the table for which columns are being
	 * retrieved.
	 * @param {string} tableName The name of the table for which to retrieve its columns.
	 * @return {Promise<string[]>} A Promise that resolves to an array of strings representing the names of the columns
	 * present in the specified table, database pair on the server of the associated Queryable instance.
	 */
	public async getColumns(databaseName: string, tableName: string): Promise<string[]> {
		
		databaseName = this.queryable.escapeId(databaseName);
		tableName = this.queryable.escapeId(tableName);
		
		return await this.queryable.queryForColumnArray(
			`SHOW COLUMNS FROM ${databaseName}.${tableName}`,
		);
		
	}
	
}
