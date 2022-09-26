/*
 * Created by Trevor Sears <trevor@trevorsears.com> (https://trevorsears.com/).
 * 7:24 PM -- July 22nd, 2022
 * Project: mysql-toolkit-js
 */

import { QueryStatement } from "./base/query-statement";
import type { EscapeFunctions } from "mysql";

export  

export type SelectUniquenessModifier =
	| "ALL"
	| "DISTINCT"
	| "DISTINCTROW";

export type SelectSQLModifiers =
	| "SQL_SMALL_RESULT"
	| "SQL_BIG_RESULT"
	| "SQL_BUFFER_RESULT"
	| "SQL_NO_CACHE"
	| "SQL_CALC_FOUND_ROWS";

export type ColumnReference =
	| string
	| [string]
	| [string, string]
	| [string, string, string]
	| ColumnIdentifier;

export type ColumnIdentifier = {
	
	column: string,
	
	table?: string,
	
	database?: string,
	
};

export type TableIdentifier = {
	
	table: string,
	
	database?: string,
	
};

export class SelectStatement extends QueryStatement {
	
	private uniquenessModifier?: SelectUniquenessModifier;
	
	private highPriority: boolean;
	
	private straightJoin: boolean;
	
	private sqlModifiers: SelectSQLModifiers[];
	
	private columns: ColumnIdentifier[];
	
	private fromTableID?: string;
	
	public constructor(columns: ColumnIdentifier[] = [],
						  fromTableID?: string) {
		
		super();
		
		this.fromTableID = fromTableID;
		this.columns = columns;
		
	}
	
	protected static sanitizeColumnReference(
		columnReference: ColumnReference): ColumnIdentifier {
		
		if (typeof columnReference === "string") {
			
			return {
				column: columnReference,
			};
			
		} else if (Array.isArray(columnReference)) {
			
			if (columnReference.length === 1) {
				
				return {
					column: columnReference[0],
				};
				
			} else if (columnReference.length === 2) {
				
				return {
					table: columnReference[0],
					column: columnReference[1],
				};
				
			} else {
				
				return {
					database: columnReference[0],
					table: columnReference[1],
					column: columnReference[2],
				};
				
			}
			
		} else return columnReference;
		
	}
	
	public from(tableID: string): SelectStatement {
		
		const result: SelectStatement = structuredClone(this);
		
		result.fromTableID = tableID;
		
		return result;
		
	}
	
	public addColumn(...columns: ColumnReference[]): SelectStatement {
		
		const newStatement: SelectStatement = structuredClone(this);
		
		for (let column of columns) {
			
			newStatement.columns.push(
				SelectStatement.sanitizeColumnReference(column)
			);
			
		}
		
		return newStatement;
		
	}
	
	public build(escapingAgent: EscapeFunctions): string {
		
		if (this.columns.length <= 0) {
			
			throw new Error(
				"Cannot build a SELECT statement that does not select at " +
				"least one column."
			);
			
		} else if (this.fromTableID === undefined) {
			
			throw new Error(
				"Cannot build a SELECT statement that does not reference at " +
				"least one source table."
			);
			
		}
		
		let modifiers: string[] = [
			this.uniquenessModifier,
			this.highPriority ? "HIGH_PRIORITY" : undefined,
			this.straightJoin ? "STRAIGHT_JOIN" : undefined,
			...this.sqlModifiers
		].filter((value?: string): boolean => value !== undefined) as string[];
		
		let selections: string[] = 
		
		const query: string = [
			"SELECT",
			...modifiers
		].join(" ");
		
		return `${query};`;
		
	}
	
}

export const SELECT:
	(columns: ColumnIdentifier[], fromTableID?: string) => SelectStatement =
	(columns: ColumnIdentifier[] = [], fromTableID?: string): SelectStatement =>
		new SelectStatement(columns, fromTableID);
