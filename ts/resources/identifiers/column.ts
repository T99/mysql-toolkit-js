/*
 * Created by Trevor Sears <trevor@trevorsears.com> (https://trevorsears.com/).
 * 6:13 PM -- September 26th, 2022
 * Project: mysql-toolkit-js
 */

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

/**
 * Sanitizes the input value to a ColumnIdentifier object and returns the
 * result.
 * @param {ColumnReference} columnReference The original ColumnReference value,
 * which could be in a number of different formats.
 * @returns {ColumnIdentifier} The sanitized ColumnIdentifier object.
 */
export function sanitizeColumnReference(
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
