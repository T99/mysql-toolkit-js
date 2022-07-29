/*
 * Created by Trevor Sears <trevor@trevorsears.com> (https://trevorsears.com/).
 * 4:04 PM -- July 29th, 2022
 * Project: mysql-toolkit-js
 */

export type TableDescriptor =
	| string
	| [string]
	| [string, string]
	| TableIdentifier;

export type TableIdentifier = {
	
	databaseName?: string,
	
	tableName?: string,
	
};

export function standardizeTableDescriptor(tableName: string): TableIdentifier;

export function standardizeTableDescriptor(databaseName: string,
	tableName: string): TableIdentifier;

export function standardizeTableDescriptor(
	descriptor: TableDescriptor): TableIdentifier;

export function standardizeTableDescriptor(arg1: string | TableDescriptor,
	arg2?: string): TableIdentifier {
	
	if (arg2 !== undefined) {
		
		return {
			databaseName: arg1 as string,
			tableName: arg2,
		};
		
	} else if (typeof arg1 === "string") return { tableName: arg1 as string };
	else if (Array.isArray(arg1)) {
		
		const paddedDescriptor = arg1.slice(0, 2).reverse();
		
		return {
			tableName: paddedDescriptor[0],
			databaseName: paddedDescriptor[1],
		};
		
	} else return arg1 as TableIdentifier;
	
}
