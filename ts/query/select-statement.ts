/*
 * Created by Trevor Sears <trevor@trevorsears.com> (https://trevorsears.com/).
 * 7:24 PM -- July 22nd, 2022
 * Project: mysql-toolkit-js
 */

import { QueryStatement } from "./base/query-statement";
import type { EscapeFunctions } from "mysql";
import {
	ColumnIdentifier,
	ColumnReference,
	sanitizeColumnReference
} from "../resources/identifiers/column";
import {
	TableIdentifier,
	TableReference,
	sanitizeTableReference
} from "../resources/identifiers/table";
import { ConstructorFunction } from "../util/constructor-function.js";

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

export class SelectStatement extends QueryStatement {
	
	private uniquenessModifier?: SelectUniquenessModifier;
	
	private highPriority: boolean;
	
	private straightJoin: boolean;
	
	private sqlModifiers: SelectSQLModifiers[];
	
	private columns: ColumnIdentifier[];
	
	private fromTable?: TableIdentifier;
	
	private limitRowCount?: number;
	
	private limitOffset?: number;
	
	public constructor(columns: ColumnReference[] = [],
					   table?: TableReference) {
		
		super();
		
		if (table !== undefined) {
			
			this.fromTable = sanitizeTableReference(table);
			
		}
		
		this.columns = columns.map(sanitizeColumnReference);
		
		this.uniquenessModifier = undefined;
		this.highPriority = false;
		this.straightJoin = false;
		this.sqlModifiers = [];
		this.limitRowCount = undefined;
		this.limitOffset = undefined;
		
	}
	
	public from(table: TableReference | undefined): SelectStatement {
		
		const result: SelectStatement = structuredClone(this);
		
		if (table !== undefined) {
			
			result.fromTable = sanitizeTableReference(table);
			
		}
		
		return result;
		
	}
	
	// public where(): SelectStatement {
	// 	return null;
	// }
	//
	// public groupBy(): SelectStatement {
	// 	return null;
	// }
	//
	// public having(): SelectStatement {
	// 	return null;
	// }
	//
	// public orderBy(): SelectStatement {
	// 	return null;
	// }
	
	public limit(rowCount: number | undefined): SelectStatement;
	public limit(offset: number, rowCount: number): SelectStatement;
	public limit(offset: undefined, rowCount: undefined): SelectStatement;
	public limit(rowCountOrOffset: number | undefined,
				 rowCount?: number | undefined): SelectStatement {
		
		const result: SelectStatement = structuredClone(this);
		
		switch (arguments.length) {
			
			case 0:
				result.limitRowCount = undefined;
				result.limitOffset = undefined;
				break;
				
			case 1:
				result.limitRowCount = rowCountOrOffset;
				break;
				
			default:
				result.limitRowCount = rowCount;
				result.limitOffset = rowCountOrOffset;
				break;
			
		}
		
		return result;
		
	}
	
	public select(...columns: ColumnReference[]): SelectStatement {
		
		return this.addColumn(...columns);
		
	}
	
	public addColumn(...columns: ColumnReference[]): SelectStatement {
		
		const result: SelectStatement = structuredClone(this);
		
		result.columns.push(...columns.map(sanitizeColumnReference));
		
		return result;
		
	}
	
	public build(escapingAgent: EscapeFunctions): string {
		
		let queryComponents: string[] = ["SELECT"];
		
		let modifiers: string[] = [
			this.uniquenessModifier,
			this.highPriority ? "HIGH_PRIORITY" : undefined,
			this.straightJoin ? "STRAIGHT_JOIN" : undefined,
			...this.sqlModifiers,
		].filter((value?: string): boolean => value !== undefined) as string[];
		
		queryComponents.push(...modifiers);
		
		if (this.columns.length > 0) {
			
			const columnSelectionClause: string = this.columns.map(
				(columnIdentifier: ColumnIdentifier): string => [
					columnIdentifier.database,
					columnIdentifier.table,
					columnIdentifier.column
				].filter(
					(x?: string): x is string => x !== undefined
				).map(
					(x: string): string => escapingAgent.escapeId(x, true)
				).join(".")
			).join(", ");
			
			queryComponents.push(columnSelectionClause);
			
		} else queryComponents.push("*");
		
		if (this.fromTable !== undefined) {
			
			const escapedFromTable: string = escapingAgent.escapeId(this.fromTable);
			
			queryComponents.push(`FROM ${this.fromTable}`);
			
		}
		
		if (this.limitRowCount !== undefined) {
			
			queryComponents.push(`LIMIT ${this.limitRowCount}`);
			
			if (this.limitOffset !== undefined) {
				
				queryComponents.push(`OFFSET ${this.limitOffset}`);
				
			}
			
		} 
		
		const query: string = queryComponents.join(" ");
		
		return `${query};`;
		
	}
	
}

export const select: ConstructorFunction<typeof SelectStatement> =
	(columns?: ColumnReference[], fromTableID?: string): SelectStatement =>
		new SelectStatement(columns, fromTableID);
