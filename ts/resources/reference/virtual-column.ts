/*
 * Created by Trevor Sears <trevor@trevorsears.com> (https://trevorsears.com/).
 * 11:27 AM -- December 03, 2021.
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
import { MySQLVirtualResourceWithComment } from "./mysql-virtual-resource-with-comment";
import { ColumnSchema } from "../schemas/column-schema";
import { VirtualTable, ColumnOrdinality } from "./virtual-table";

export class VirtualColumn extends MySQLVirtualResourceWithComment {
	
	protected parent?: VirtualTable;

	protected schema: ColumnSchema;
	
	public constructor(name: string, descriptor: ColumnSchema, comment?: string, parentTable?: VirtualTable) {
		
		super(name, comment);
		
		this.parent = parentTable;
		this.schema = descriptor;
		
	}
	
	public setName(name: string): void {
		
		if (name === this.getName()) return;
		
		if (this.hasParentTable() && this.getParentTable()?.hasColumn(name)) {
			
			throw new Error(`Cannot rename table '${this.getName()}' to '${name}' - such an operation would cause a ` +
				`name collision in the parent schema (schema: ${this.getParentTable()?.getName()}).`);
			
		}
		
		super.setName(name);
		
	}
	
	public getParentTable(): VirtualTable | undefined {
		
		return this.parent;
		
	}
	
	public hasParentTable(parentTable?: string | VirtualTable): boolean {
		
		let currentParentTable: VirtualTable | undefined = this.getParentTable();
		
		if (parentTable === undefined) return currentParentTable !== undefined;
		else if (typeof parentTable === "string") return currentParentTable?.getName() === parentTable;
		else return currentParentTable === parentTable;
		
	}
	
	public setParentTable(table: VirtualTable, ordinality?: ColumnOrdinality): void {
		
		// If the requested parent is already the current parent, do nothing.
		if (table === this.parent) return;
		
		// We need to check if the parent table already has a column with this column's name.
		switch (table.getColumn(this.getName())) {
			
			// No collision - we're good to go.
			case undefined:
				// Remove this column from the old parent table if such a table exists and if such an operation is
				// necessary.
				this.getParentTable()?.removeColumn(this.getName());
				
				// Add this column to the given table.
				table.addColumn(this, ordinality);
				break;
			
			// Somehow the given table had already registered this column as a child without this column's knowledge.
			// This could potentially indicate an error, but ultimately the problem is easily fixed.
			case this:
				console.warn("VirtualColumn#setParent was called with table that had already registered the given " +
					"column as a child without the given column's knowledge.");
				break;
			
			// Name collision! The given table already has a column with the same name as this column that is not the
			// same instance.
			default:
				throw new Error(`A naming collision occurred between conflicting columns in the ` +
					`'${table.getName()}' table, on the '${this.getName()}' column.`);
			
		}
		
		// Internally link the given schema as our parent schema.
		this.parent = table;
		
	}
	
	/**
	 * Removes the parent table from this column, returning true if this column had a parent table that was removed as a
	 * result of this operation.
	 *
	 * @return {boolean} true if this column had a parent table that was removed as a result of this operation.
	 */
	public removeParentTable(): boolean {
		
		if (!this.hasParentTable()) return false;
		else {
			
			let parent: VirtualTable = this.parent as VirtualTable;
			
			this.parent = undefined;
			parent.removeColumn(this);
			
			return true;
			
		}
		
	}
	
	public buildDDL(escapingAgent: mysql.EscapeFunctions): string {
		
		let identifier: string = escapingAgent.escapeId(this.getName());
		let type: string = this.schema.type.toSQLString();
		let nullability: string = this.schema.isNullable ? "NULL" : "NOT NULL";
		
		let result: string = `${identifier} ${type} ${nullability}`;
		
		if (this.schema.extras !== undefined) result += ` ${this.schema.extras}`;
		
		let comment: string | undefined = this.getComment();
		
		if (comment !== undefined) result += ` COMMENT ${escapingAgent.escape(comment)}`;
		
		return result;
		
	}
	
}
