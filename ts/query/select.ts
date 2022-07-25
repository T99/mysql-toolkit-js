/*
 * Created by Trevor Sears <trevor@trevorsears.com> (https://trevorsears.com/).
 * 7:24 PM -- July 22nd, 2022
 * Project: mysql-toolkit-js
 */

import { MySQLQueryStatement } from "./mysql-query-statement";
import type { EscapeFunctions } from "mysql";

export  

type ColumnIdentifier = {
	
	column: string,
	
	table?: string
	
};

export class Select extends MySQLQueryStatement {
	
	private fromTableID: string;
	
	private columns: ColumnIdentifier[];
	
	protected constructor(fromTableID: string,
						  columns: ColumnIdentifier[] = []) {
		
		super();
		
		this.fromTableID = fromTableID;
		this.columns = columns;
		
	}
	
	public static from(tableID: string): Select {
		
		return new Select(tableID, []);
		
	}
	
	public addColumn(
		...columns: Array<string | [string, string] | ColumnIdentifier>): void {
		
		for (let column of columns) {
			
			
			
		}
		
	}
	
	public build(escapingAgent: EscapeFunctions): string {
		
		if (this.columns.length <= 0) {
			
			throw new Error(
				"Cannot build a SELECT statement that does not select at " +
				"least one column."
			);
			
		}
		
		let columnSelectionClauses = this.
		
		return "";
		
	}
	
	
	
}
