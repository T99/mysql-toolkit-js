/*
 * Created by Trevor Sears <trevor@trevorsears.com> (https://trevorsears.com/).
 * 11:26 AM -- December 03, 2021.
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
import { MySQLQueryResults } from "../util/mysql-query-results";
import { ValueOf } from "../util/value-of";

export type QueryableAgent = {
	
	query: mysql.QueryFunction;
	
} & mysql.EscapeFunctions;

export abstract class Queryable implements mysql.EscapeFunctions {
	
	/**
	 * An object capable of fulfilling database queries, such as a MySQL connection, or connection pool.
	 */
	public readonly queryableAgent: QueryableAgent;
	
	/**
	 * Initializes a new Queryable instance with the provided queryable agent.
	 * 
	 * @param {QueryableAgent} queryableAgent An object capable of fulfilling database queries, such as a MySQL
	 * connection, or connection pool.
	 */
	protected constructor(queryableAgent: QueryableAgent) {
		
		this.queryableAgent = queryableAgent;
		
	}
	
	public escape(value: any, stringifyObjects?: boolean, timeZone?: string): string {
		
		return this.queryableAgent.escape(value, stringifyObjects, timeZone);
		
	}
	
	public escapeId(value: string, forbidQualified?: boolean): string {
		
		return this.queryableAgent.escapeId(value, forbidQualified);
		
	}
	
	public format(sql: string, values: any, stringifyObjects?: boolean, timeZone?: string): string {
		
		return this.queryableAgent.format(sql, values, stringifyObjects, timeZone);
		
	}
	
	/**
	 * Returns a Promise that resolves with the results of the specified query, or rejects with the error that
	 * occurred while attempting to complete the query.
	 *
	 * This function is a Promisified version of the underlying MySQL connection's #query function. See the
	 * documentation of that library/function for more details as to further available options and configuration.
	 *
	 * @param {string | mysql.QueryOptions} options The string SQL query or QueryOptions object to query with/on.
	 * @param {any} values An optional collection of values to use inside the provided query.
	 * @return {Promise<MySQLQueryResults>} A Promise that resolves with the results of the specified query, or rejects
	 * with the error that occurred while attempting to complete the query.
	 */
	public query(options: string | mysql.QueryOptions, values?: any): Promise<MySQLQueryResults> {
		
		return new Promise<MySQLQueryResults>((resolve: (value: MySQLQueryResults) => void,
											   reject: (reason: mysql.MysqlError) => void): void => {
			
			function callback(error: mysql.MysqlError | null, results?: any, fields?: mysql.FieldInfo[]): void {
				
				if (error !== null) reject(error);
				else resolve({ results, fields: fields as mysql.FieldInfo[] });
				
			}
			
			if (values === undefined) this.queryableAgent.query(options, callback);
			else this.queryableAgent.query(options, values, callback);
			
		});
		
	}
	
	/**
	 * Returns a Promise that resolves to true if there is at least one row returned by the query, otherwise returning
	 * false.
	 *
	 * This function is a Promisified version of the underlying MySQL connection's #query function. See the
	 * documentation of that library/function for more details as to further available options and configuration.
	 *
	 * @param {string | mysql.QueryOptions} options The string SQL query or QueryOptions object to query with/on.
	 * @param {any[]} values An optional collection of values to use inside the provided query.
	 * @return {Promise<boolean>} A Promise that resolves to true if there is at least one row returned by the query,
	 * otherwise resolving to false, or rejects with the error that occurred while attempting to complete the query.
	 */
	public async queryForExistence(options: string | mysql.QueryOptions, values?: any[]): Promise<boolean> {
		
		return (await this.query(options, values)).results.length >= 1;
		
	}
	
	/**
	 * Returns a Promise that resolves to the value contained in the first column of the first row of the result set, or
	 * undefined if no rows were returned.
	 *
	 * This function is a Promisified version of the underlying MySQL connection's #query function. See the
	 * documentation of that library/function for more details as to further available options and configuration.
	 *
	 * @param {string | mysql.QueryOptions} options The string SQL query or QueryOptions object to query with/on.
	 * @param {any[]} values An optional collection of values to use inside the provided query.
	 * @return {Promise<T | undefined>} A Promise that resolves to the value contained in the first column of the first
	 * row of the result set, or undefined if no rows were returned, or rejects with the error that occurred while
	 * attempting to complete the query.
	 */
	public async queryForSingleValue<T>(options: string | mysql.QueryOptions, values?: any[]): Promise<T | undefined> {
		
		let results: MySQLQueryResults = await this.query(options, values);
		
		if (results.results.length >= 1) {
			
			let row: ValueOf<MySQLQueryResults["results"]> = results.results[0];
			
			return row[Object.keys(row)[0]];
			
		} else return undefined;
		
	}
	
	/**
	 * Returns a Promise that resolves to a count of the number of rows returned by the given query.
	 *
	 * This function is a Promisified version of the underlying MySQL connection's #query function. See the
	 * documentation of that library/function for more details as to further available options and configuration.
	 *
	 * @param {string | mysql.QueryOptions} options The string SQL query or QueryOptions object to query with/on.
	 * @param {any[]} values An optional collection of values to use inside the provided query.
	 * @return {Promise<number>} A Promise that resolves to a count of the number of rows returned by the given query,
	 * or rejects with the error that occurred while attempting to complete the query.
	 */
	public async queryForRowCount(options: string | mysql.QueryOptions, values?: any[]): Promise<number> {
		
		return (await this.query(options, values)).results.length;
		
	}
	
	/**
	 * Returns a Promise that resolves to an array of the values of the first column of the results.
	 *
	 * This function is a Promisified version of the underlying MySQL connection's #query function. See the
	 * documentation of that library/function for more details as to further available options and configuration.
	 *
	 * @param {string | mysql.QueryOptions} options The string SQL query or QueryOptions object to query with/on.
	 * @param {any[]} values An optional collection of values to use inside the provided query.
	 * @return {Promise<T[]>} A Promise that resolves to an array of the values of the first column of the results, or
	 * rejects with the error that occurred while attempting to complete the query.
	 */
	public async queryForColumnArray<T>(options: string | mysql.QueryOptions, values?: any[]): Promise<T[]> {
		
		let results: MySQLQueryResults = await this.query(options, values);
		
		if (results.results.length >= 1) {
			
			let columnName: string = Object.keys(results.results[0])[0];
			
			return results.results.map((row: any): T => {
				
				return row[columnName] as T;
				
			});
			
		} else return [];
		
	}
	
}
