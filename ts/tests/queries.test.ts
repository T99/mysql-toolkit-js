/*
 * Created by Trevor Sears <trevor@trevorsears.com> (https://trevorsears.com/).
 * 12:50 PM -- July 25th, 2022
 * Project: mysql-toolkit-js
 */

import { SELECT, SelectStatement } from "../query/select-statement";
import { EscapeFunctions } from "mysql";

type TestType = `Decimal(${number})`;

let a: TestType = "Decimal(2)";

const dummyEscapingAgent: EscapeFunctions = {
	
	escape(value: any, stringifyObjects?: boolean, timeZone?: string): string {
		
		if (typeof value === "string") return `'${value}'`;
		else if (typeof value === "number") return `${value}`;
		else throw new Error("unexpected type");
		
	},
	
	escapeId(value: string): string {
		
		return `\`${value}\``;
		
	},
	
	format(sql: string, values: any[], stringifyObjects?: boolean,
		   timeZone?: string): string {
		
		throw new Error("didn't expect to be called");
		
	}
	
}

test("Basic select statement", (): void => {
	
	let statement: SelectStatement = SELECT([
		"column1",
		"column2"
	]).FROM("myTable");
	
	expect(statement.build(dummyEscapingAgent)).toStrictEqual(
		"SELECT `column1`,\n" +
		"       `column2`\n" +
		"FROM `myTable`;"
	)
	
});
