/*
 * Created by Trevor Sears <trevor@trevorsears.com> (https://trevorsears.com/).
 * 3:56 PM -- July 29th, 2022
 * Project: mysql-toolkit-js
 */

export type ColumnDescriptor =
	| string
	| [string]
	| [string, string]
	| [string, string, string]
	| ColumnIdentifier;

export type ColumnIdentifier = {
	
	databaseName?: string,
	
	tableName?: string,
	
	columnName: string,
	
};

export function standardizeColumnDescriptor(
	columnName: string): ColumnIdentifier;

export function standardizeColumnDescriptor(tableName: string,
	columnName: string): ColumnIdentifier;

export function standardizeColumnDescriptor(databaseName: string,
	tableName: string, columnName: string): ColumnIdentifier;

export function standardizeColumnDescriptor(
	descriptor: ColumnDescriptor): ColumnIdentifier;

export function standardizeColumnDescriptor(arg1: string | ColumnDescriptor,
	arg2?: string, arg3?: string): ColumnIdentifier {
	
	if (arg3 !== undefined) {
		
		return {
			databaseName: arg1 as string,
			tableName: arg2,
			columnName: arg3,
		};
		
	} else if (arg2 !== undefined) {
		
		return {
			tableName: arg1 as string,
			columnName: arg2,
		};
		
	} else if (typeof arg1 === "string") return { columnName: arg1 as string };
	else if (Array.isArray(arg1)) {
		
		const paddedDescriptor = arg1.slice(0, 3).reverse();
		
		return {
			columnName: paddedDescriptor[0],
			tableName: paddedDescriptor[1],
			databaseName: paddedDescriptor[2],
		};
		
	} else return arg1 as ColumnIdentifier;
	
}
