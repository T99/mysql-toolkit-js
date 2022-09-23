/*
 * Created by Trevor Sears <trevor@trevorsears.com> (https://trevorsears.com/).
 * 4:39 PM -- October 29th, 2021
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

import os from "os";
import mysql from "mysql";
import { MySQLVirtualResourceWithComment } from "./mysql-virtual-resource-with-comment";
import { VirtualColumn } from "./virtual-column";
import { VirtualSchema } from "./virtual-schema";
import { indentLines } from "../../util/indent-lines";

/**
 * A type that indicates the ordinality of a column in some fashion.
 * 
 * Note: ordinality is zero-indexed.
 */
export type Ordinality =
	| number
	| { before: string | VirtualColumn }
	| { after:  string | VirtualColumn };

export class VirtualTable extends MySQLVirtualResourceWithComment {
	
	protected parent?: VirtualSchema;
	
	protected columns: Map<string, VirtualColumn>;
	
	protected ordinality: string[];
	
	protected primaryKey?: string[];
	
	public constructor(name: string, comment?: string, parentSchema?: VirtualSchema) {
		
		super(name, comment);
		
		if (parentSchema !== undefined) this.setParentSchema(parentSchema);
		this.columns = new Map();
		this.ordinality = [];
		
	}
	
	/**
	 * Returns a sanitized and de-duplicated version of the input array of columns.
	 * 
	 * @param {Array<string | VirtualColumn>} columnSet The column set to sanitize.
	 * @returns {string[]} A sanitized and de-duplicated version of the input array of columns.
	 */
	protected static sanitizeColumnSet(columnSet: Array<string | VirtualColumn>): string[] {
		
		return [...new Set(columnSet.map(
			(column: string | VirtualColumn): string => typeof column === "string" ? column : column.getName()
		))];
		
	}
	
	public setName(name: string): void {
		
		if (name === this.getName()) return;
		
		let oldName: string = this.getName();
		
		super.setName(name);
		
		if (this.hasParentSchema()) {
			
			let parentSchema: VirtualSchema = this.getParentSchema() as VirtualSchema;
			let existingTable: VirtualTable | undefined = parentSchema.getTable(name);
			
			if (existingTable !== undefined) {
				
				if (existingTable !== this) {
					
					// Naming collision! Revert to the old name.
					super.setName(oldName);
					
					throw new Error(`Cannot rename table '${this.getName()}' to '${name}' - such an operation ` +
						`would cause a name collision in the parent schema ` +
						`(schema: ${this.getParentSchema()?.getName()}).`);
					
				}
				
			} else parentSchema.renameTable(oldName, name);
			
		}
		
	}
	
	public getColumn(name: string): VirtualColumn | undefined {
		
		return this.columns.get(name);
		
	}
	
	/**
	 * Returns true if the specified column exists in this table.
	 *
	 * Prefer the use of a {@link VirtualColumn} instance over a string as the argument to this method. Calls with a
	 * string argument do not guarantee the pointer-identity of the column that is being referenced. In other words,
	 * calling VirtualTable#hasColumn(string) does not guarantee that the column that the table has (with the given
	 * name) is necessarily the same instance as the desired table. It could potentially be a different instance that
	 * happens to have the same name.
	 *
	 * @param {string | VirtualColumn} column The column to check for in this table.
	 * @return {boolean} true if this table contains the specified column.
	 */
	public hasColumn(column: string | VirtualColumn): boolean {
	
		if (typeof column === "string") return this.columns.has(column);
		else return this.getColumn(column.getName()) === column;
		
	}
	
	public addColumn(column: VirtualColumn, ordinality?: Ordinality): void {
		
		let shouldSetParentSchema: boolean = true;
		let shouldAddChildColumn: boolean = true;
		
		let newColumnParent: VirtualTable | undefined = column.getParentTable();
		
		if (newColumnParent !== undefined) {
			
			if (newColumnParent === this) shouldSetParentSchema = false;
			else {
				
				throw new Error("Attempted to call VirtualTable#addColumn with a column that was already a member of " +
					`a different table (table: '${newColumnParent.getName()}').`);
				
			}
			
		}
		
		let existingColumn: VirtualColumn | undefined = this.getColumn(column.getName());
		
		if (existingColumn !== undefined) {
			
			if (existingColumn === column) shouldAddChildColumn = false;
			else {
				
				throw new Error("Attempted to call VirtualTable#addColumn with a column that would result in " +
					"duplicate/non-unique columns names.");
				
			}
			
		}
		
		if (shouldAddChildColumn) {
			
			let columnName: string = column.getName();
			
			this.columns.set(columnName, column);
			this.ordinality.splice(this.normalizeOrdinality(ordinality, columnName), 0, columnName);
			
		} else this.reorderColumn(column, ordinality);
		
		if (shouldSetParentSchema) column.setParentTable(this);
		
	}
	
	/**
	 * Removes the specified column from this table.
	 * 
	 * @param {string | VirtualColumn} column
	 * @returns {boolean}
	 */
	public removeColumn(column: string | VirtualColumn): boolean {
		
		// If the specified column isn't a member of this table, return false.
		if (!this.hasColumn(column)) return false;
		
		// Sanitize `column` to a VirtualColumn instance.
		column = typeof column === "string" ? this.getColumn(column) as VirtualColumn : column;
		
		// Remove the column from this table's column map.
		this.columns.delete(column.getName());
		
		// Remove the column from this table's ordinality array.
		this.ordinality.filter((columnName: string): boolean => columnName !== (column as VirtualColumn).getName());
		
		// Inform the column to remove this table as its parent.
		column.removeParentTable();
		
		return true;
		
	}
	
	protected normalizeOrdinality(ordinality: Ordinality | undefined, column?: string): number {
		
		let isExistingColumn: boolean = column === undefined ? false : this.hasColumn(column);
		
		if (ordinality === undefined) {
			
			// If this table has a column with the provided name, return that column's index.
			if (isExistingColumn) return this.getColumnIndex(column as string);
			// Otherwise, return the index at the end of the column ordinality array.
			else return this.ordinality.length;
			
		}
		
		let ordinalityBound: number = this.ordinality.length;
		
		if (isExistingColumn) ordinalityBound--;
		
		if (typeof ordinality === "number") {
			
			// If an index beyond the end of the ordinality array is specified, normalize it to the end of the array.
			if (ordinality > ordinalityBound) return this.ordinality.length;
			// If a negative relative index is specified before the beginning of the ordinality array, normalize it to
			// the beginning of the array.
			else if (ordinality <= (-ordinalityBound + 1)) return 0;
			// If a negative relative index is specified within the bounds of the ordinality array, normalize it to the
			// positive bounds of the ordinality array.
			else if (ordinality < 0) return (ordinalityBound - 1) + ordinality;
			// If all else fails, the ordinality was just a regular ordinal index, so we can return it as-is.
			else return ordinality;
			
		} else {
			
			let referenceColumn: string | VirtualColumn = (ordinality as any).before ?? (ordinality as any).after;
			let referenceColumnName: string =
				typeof referenceColumn === "string" ? referenceColumn : referenceColumn.getName();
			
			if (!this.hasColumn(referenceColumn)) {
				
				throw new Error(`Attempted to reorder a column (column: '${column}') relative to a reference ` +
					`column (reference column: '${referenceColumnName}') in a table (table: '${this.getName()}') ` +
					`that does not contain the reference column in question.`);
				
			}
			
			// If the column is being re-ordered relative to itself, no recording will actually occur, so just return
			// the column's current index.
			if (referenceColumnName === column) return this.getColumnIndex(referenceColumnName);
			
			let relativeIndex: number = "before" in ordinality ? 0 : 1;
			let referenceColumnPosition: number = this.getColumnIndex(referenceColumn);
			let adjustForExistingColumn: boolean = isExistingColumn && (
				this.getColumnIndex(column as string) < referenceColumnPosition
			);
			
			return referenceColumnPosition + relativeIndex + (adjustForExistingColumn ? -1 : 0);
			
		}
		
	}
	
	/**
	 * Returns the ordinality/column index of the specified column.
	 * 
	 * @param {string | VirtualColumn} column The name of, or instance of the column to reorder.
	 * @returns {number} The ordinality/column index of the specified column.
	 * @throws {Error} If the specified column is not a member of this table.
	 * @see Ordinality
	 */
	public getColumnIndex(column: string | VirtualColumn): number {
		
		let columnName: string = typeof column === "string" ? column : column.getName();
		
		if (!this.hasColumn(column)) {
			
			throw new Error(`Attempted to retrieve the index of a column (column: '${columnName}') in a table ` +
				`(table: '${this.getName()}') that does not contain the column in question.`);
			
		}
		
		return this.ordinality.indexOf(columnName);
		
	}
	
	/**
	 * Reorders the specified column to match the provided ordinality, returning the resultant index of the column after
	 * the reordering operation.
	 * 
	 * @param {string | VirtualColumn} column The name of, or instance of the column to reorder.
	 * @param {Ordinality} ordinality The desired resulting ordinality of the specified column. 
	 * @returns {number} The resultant ordinality/column index of the reordered column after the reordering operation.
	 * @throws {Error} If the specified column (or reference column as a part of the ordinality) is not a member of this
	 * table.
	 * @see Ordinality
	 * @see VirtualTable#getColumnIndex
	 */
	public reorderColumn(column: string | VirtualColumn, ordinality?: Ordinality): number {
		
		if (!this.hasColumn(column)) {
			
			let columnName: string = typeof column === "string" ? column : column.getName();
			
			throw new Error(`Attempted to reorder a column (column: '${columnName}') in a table (table: ` +
				`'${this.getName()}') that does not contain the column in question.`);
			
		}
		
		// Sanitize `column` to a VirtualColumn instance.
		column = typeof column === "string" ? this.getColumn(column) as VirtualColumn : column;
		
		let newIndex: number = this.normalizeOrdinality(ordinality, column.getName());
		
		if (newIndex !== this.getColumnIndex(column)) {
			
			// Remove the column from its old index.
			this.ordinality.splice(this.ordinality.indexOf(column.getName()), 1);
			
			// Add it back in, in its new index.
			this.ordinality.splice(newIndex, 0, column.getName());
			
		}
		
		return newIndex;
		
	}
	
	// DOC-ME [11/19/2021 @ 3:02 PM] Documentation is required!
	public getPrimaryKey(): string[] | undefined {
		
		return this.primaryKey;
		
	}
	
	/**
	 * If this method is called without any arguments, this method returns true if this table has a primary key. If
	 * called with an argument, this method returns true if this table's primary key matches that which was specified in
	 * the argument.
	 * 
	 * @param {Array<string | VirtualColumn>} primaryKey An optional array of columns/column names to check for equality
	 * against this table's primary key, if one exists.
	 * @returns {boolean} true if this table has a primary key (and if this table's primary key matches the key
	 * provided, if such a key was in fact provided).
	 */
	public hasPrimaryKey(primaryKey?: Array<string | VirtualColumn>): boolean {
		
		if (primaryKey === undefined) return this.primaryKey !== undefined;
		else {
			
			if (this.primaryKey === undefined) return false;
			
			let set1: string[] = this.primaryKey.sort();
			let set2: string[] = VirtualTable.sanitizeColumnSet(primaryKey).sort();
			
			return (
				(set1.length === set2.length) &&
				set1.every((value: string, index: number): boolean => set2[index] === value)
			);
			
		}
		
	}
	
	// DOC-ME [11/19/2021 @ 3:02 PM] Documentation is required!
	public setPrimaryKey(primaryKey: Array<string | VirtualColumn>): string[] {
		
		// Sanitize and dedupe the provided primary key.
		primaryKey = VirtualTable.sanitizeColumnSet(primaryKey);
		
		// If any of the columns from the provided primary key are not members of this table, throw an error.
		if (!primaryKey.every(this.hasColumn.bind(this))) {
			
			throw new Error("Attempted to set the ");
			
		}
		
		this.primaryKey = primaryKey as string[];
		
		return this.primaryKey;
		
	}
	
	/**
	 * Returns the parent schema for this table, or undefined if this table has no parent schema.
	 * 
	 * @returns {VirtualSchema | undefined} The parent schema for this table, or undefined if this table has no parent
	 * schema.
	 */
	public getParentSchema(): VirtualSchema | undefined {
		
		return this.parent;
		
	}
	
	// DOC-ME [11/19/2021 @ 3:31 PM] Documentation is required!
	public hasParentSchema(parentSchema?: string | VirtualSchema): boolean {
		
		let currentParentSchema: VirtualSchema | undefined = this.getParentSchema();
		
		if (parentSchema === undefined) return currentParentSchema !== undefined;
		else if (typeof parentSchema === "string") return currentParentSchema?.getName() === parentSchema;
		else return currentParentSchema === parentSchema;
		
	}
	
	/**
	 * Sets the parent schema for this table (or removes the parent schema if 'undefined' is passed).
	 * 
	 * @param {VirtualSchema | undefined} parentSchema The schema to set as the parent of this schema, or undefined to
	 * remove any parent schema from this table.
	 */
	public setParentSchema(parentSchema: VirtualSchema): void {
		
		if (this.hasParentSchema(parentSchema)) return;
		
		let isParentBeingReplaced: boolean = this.hasParentSchema();
		let shouldAddSelfToNewParent: boolean = true;
		
		let existingTableInParent: VirtualTable | undefined = parentSchema.getTable(this.getName());
		
		if (existingTableInParent !== undefined) {
			
			if (existingTableInParent === this) shouldAddSelfToNewParent = false;
			else {
				
				throw new Error(`A naming collision occurred between conflicting tables in the ` +
					`'${parentSchema.getName()}' schema, on the '${this.getName()}' table.`);
				
			}
			
		}
		
		if (isParentBeingReplaced) this.getParentSchema()?.removeTable(this);
		if (shouldAddSelfToNewParent) parentSchema.addTable(this);
		
		this.parent = parentSchema;
		
	}
	
	/**
	 * Removes the parent schema from this table, returning true if this table had a parent schema that was removed as a
	 * result of this operation.
	 * 
	 * @return {boolean} true if this table had a parent schema that was removed as a result of this operation.
	 */
	public removeParentSchema(): boolean {
		
		if (!this.hasParentSchema()) return false;
		else {
			
			let parent: VirtualSchema = this.parent as VirtualSchema;
			
			this.parent = undefined;
			if (parent.hasTable(this)) parent.removeTable(this);
			
			return true;
			
		}
		
	}
	
	public buildDDL(escapingAgent: mysql.EscapeFunctions, ifNotExists: boolean = false): string {
		
		if (this.columns.size < 1) {
			
			throw new Error(`Cannot build DDL for a table without at least one column (table: ${this.getName()}).`);
			
		}
		
		let openingStanza: string[] = ["CREATE TABLE"];
		
		if (ifNotExists) openingStanza.push("IF NOT EXISTS");
		
		openingStanza.push(escapingAgent.escapeId(this.getName()));
		
		let columnDefinitions: string[] = [...this.columns.values()].map(
			(column: VirtualColumn): string => column.buildDDL(escapingAgent)
		);
		
		// Append one tab of indentation to each line of the DDL for the columns of this table.
		columnDefinitions = columnDefinitions.map((ddl: string): string => indentLines(ddl, "    "));
		
		let columnsStanza: string = `(${os.EOL}${columnDefinitions.join(`,${os.EOL}`)}${os.EOL})`;
		
		let commentStanza: string = "";
		
		if (this.hasComment()) commentStanza = ` COMMENT ${escapingAgent.escape(this.getComment() as string)}`;
		
		return `${openingStanza.join(" ")} ${columnsStanza}${commentStanza};`;
		
	}
	
}
