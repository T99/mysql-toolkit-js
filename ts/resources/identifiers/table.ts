/*
 * Created by Trevor Sears <trevor@trevorsears.com> (https://trevorsears.com/).
 * 6:13 PM -- September 26th, 2022
 * Project: mysql-toolkit-js
 */

export type TableReference =
	| string
	| [string]
	| [string, string]
	| TableIdentifier;

export type TableIdentifier = {
	table?: string,
	database?: string,
};

/**
 * Sanitizes the input value to a TableIdentifier object and returns the result.
 * @param {TableReference} tableReference The original TableReference value,
 * which could be in a number of different formats.
 * @returns {TableIdentifier} The sanitized TableIdentifier object.
 */
export function sanitizeTableReference(
	tableReference: TableReference): TableIdentifier {
	
	if (typeof tableReference === "string") {
		
		return {
			table: tableReference,
		};
		
	} else if (Array.isArray(tableReference)) {
		
		if (tableReference.length === 1) {
			
			return {
				table: tableReference[0],
			};
			
		} else {
			
			return {
				database: tableReference[0],
				table: tableReference[1],
			};
			
		}
		
	} else return tableReference;
	
}
