/*
 * Created by Trevor Sears <trevor@trevorsears.com> (https://trevorsears.com/).
 * 4:28 PM -- July 29th, 2022
 * Project: mysql-toolkit-js
 */

export type DatabaseDescriptor =
	| string
	| [string]
	| DatabaseIdentifier;

export type DatabaseIdentifier = {
	
	databaseName?: string,
	
};

export function standardizeDatabaseDescriptor(
	databaseName: string): DatabaseIdentifier;

export function standardizeDatabaseDescriptor(
	descriptor: DatabaseDescriptor): DatabaseIdentifier;

export function standardizeDatabaseDescriptor(
	arg1: string | DatabaseDescriptor): DatabaseIdentifier {
	
	if (typeof arg1 === "string") return { databaseName: arg1 as string };
	else if (Array.isArray(arg1)) return { databaseName: arg1[0] };
	else return arg1 as DatabaseIdentifier;
	
}
