/*
 * Created by Trevor Sears <trevor@trevorsears.com> (https://trevorsears.com/).
 * 3:23 PM -- November 16th, 2021
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

import * as os from "os";
import { MySQLVirtualResource } from "./mysql-virtual-resource";
import { EscapeFunctions } from "mysql";
import { VirtualTable } from "./virtual-table";

/**
 * A virtualized version of the format/outline of a database schema.
 * 
 * @author Trevor Sears <trevor@trevorsears.com> (https://trevorsears.com/)
 * @version v0.1.0
 * @since v0.1.0
 */
export class VirtualSchema extends MySQLVirtualResource {
	
	/**
	 * A mapping from table names to table instances.
	 */
	protected tables: Map<string, VirtualTable>;
	
	/**
	 * Initializes a new schema with the specified name.
	 * 
	 * @param {string} name The name of the newly constructed schema.
	 */
	public constructor(name: string) {
		
		super(name);
		
		this.tables = new Map();
		
	}
	
	/**
	 * Returns the table in this schema with the specified name, if such a table exists, otherwise undefined.
	 * 
	 * @param {string} name The name of the table to fetch from this schema.
	 * @returns {VirtualTable | undefined} Table in this schema with the specified name, if such a table exists,
	 * otherwise undefined.
	 */
	public getTable(name: string): VirtualTable | undefined {
		
		return this.tables.get(name);
		
	}
	
	/**
	 * Returns an array of all of the tables contained within this schema.
	 * 
	 * @returns {VirtualTable[]} An array of all of the tables contained within this schema.
	 */
	public getAllTables(): VirtualTable[] {
		
		return [...this.tables.values()];
		
	}
	
	/**
	 * Returns true if this schema contains the specified table.
	 * 
	 * @param {string | VirtualTable} table The name or instance of the table to check for in this schema.
	 * @returns {boolean} true if this schema contains the specified table.
	 */
	public hasTable(table: string | VirtualTable): boolean {
		
		if (typeof table === "string") return this.tables.has(table);
		else return this.getTable(table.getName()) === table;
		
	}
	
	// TODO [11/29/2021 @ 2:32 PM]
	public addTable(table: VirtualTable): void {
		
		let shouldSetParentSchema: boolean = true;
		let shouldAddChildTable: boolean = true;
		
		let newTableParent: VirtualSchema | undefined = table.getParentSchema();
		
		if (newTableParent !== undefined) {
			
			if (newTableParent === this) shouldSetParentSchema = false;
			else {
				
				throw new Error("Attempted to call VirtualSchema#addTable with a table that was already a member of a " +
					`different schema (schema: '${newTableParent.getName()}').`);
				
			} 
			
		}
		
		let existingTable: VirtualTable | undefined = this.getTable(table.getName());
		
		if (existingTable !== undefined) {
			
			// The 'new' table is already present in this schema, so it doesn't need to be added.
			if (existingTable === table) shouldAddChildTable = false;
			else {
				
				throw new Error("Attempted to call VirtualSchema#addTable with a table that would result in " +
					"duplicate/non-unique table names.");
				
			}
			
		}
		
		if (shouldAddChildTable) this.tables.set(table.getName(), table);
		if (shouldSetParentSchema) table.setParentSchema(this);
		
	}
	
	// TODO [11/29/2021 @ 2:32 PM]
	public renameTable(table: string | VirtualTable, newName: string): void {
		
		let hasTableBeenRenamed: boolean = (
			((table instanceof VirtualTable) && (table.getName() === newName)) ||
			((typeof table === "string") && (this.getTable(table)?.getName() === newName))
		);
		let oldTableName: string = typeof table === "string" ? table : table.getName();
		
		// If the new table name would result in a naming collision...
		if (this.hasTable(newName)) {
			
			throw new Error(`Cannot rename table '${oldTableName}' to '${newName}' - such an operation would cause a ` +
				`name collision (schema: ${this.getName()}).`);
			
		}
		
		// If the table in question is not present in this schema...
		if (!this.hasTable(table)) {
			
			throw new Error(`Attempted to rename a table (table: '${oldTableName}') in a schema (schema: ` +
				`'${this.getName()}') that does not contain the aforementioned table.`)
			
		}
		
		table = typeof table === "string" ? this.getTable(table) as VirtualTable : table;
		
		if (!hasTableBeenRenamed) table.setName(newName);
		else {
			
			this.tables.delete(oldTableName);
			this.tables.set(table.getName(), table);
			
		}
		
	}
	
	/**
	 * Removes the specified table from this schema, returning true if the table exists and was removed, otherwise
	 * false.
	 * 
	 * @param {string | VirtualTable} table The name or instance of the table to remove from this schema.
	 * @returns {boolean} true if the specified table exists and was removed, otherwise false.
	 */
	public removeTable(table: string | VirtualTable): boolean {
		
		if (this.hasTable(table)) {
			
			let tableName: string = typeof table === "string" ? table : table.getName();
			table = this.getTable(tableName) as VirtualTable;
			
			this.tables.delete(tableName);
			if (table.hasParentSchema(this)) table.removeParentSchema();
			
			return true;
			
		} else return false;
		
	}
	
	public buildDDL(escapingAgent: EscapeFunctions): string {
		
		let result: string = `CREATE SCHEMA ${escapingAgent.escapeId(this.getName())};`;
		
		let childrenDDL: string[] = [...this.tables.values()].map(
			(table: VirtualTable): string => table.buildDDL(escapingAgent)
		);
		
		result = [result, ...childrenDDL].join(os.EOL.repeat(2));
		
		return result;
		
	}
	
}
