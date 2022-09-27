/*
 * Created by Trevor Sears <trevor@trevorsears.com> (https://trevorsears.com/).
 * 4:28 PM -- July 29th, 2022
 * Project: mysql-toolkit-js
 */

export type DatabaseReference =
	| string
	| [string]
	| DatabaseIdentifier;

export type DatabaseIdentifier = {
	database: string,
};

/**
 * Sanitizes the input value to a DatabaseIdentifier object and returns the
 * result.
 * @param {DatabaseReference} databaseReference The original DatabaseReference
 * value, which could be in a number of different formats.
 * @returns {DatabaseIdentifier} The sanitized DatabaseIdentifier object.
 */
export function sanitizeDatabaseReference(
	databaseReference: DatabaseReference): DatabaseIdentifier {
	
	if (typeof databaseReference === "string") {
		
		return {
			database: databaseReference,
		};
		
	} else if (Array.isArray(databaseReference)) {
		
		return {
			database: databaseReference[0],
		};
		
	} else return databaseReference;
	
}
