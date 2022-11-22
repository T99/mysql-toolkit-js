/*
 * Created by Trevor Sears <trevor@trevorsears.com> (https://trevorsears.com/).
 * 8:18 PM -- November 21st, 2022
 * Project: mysql-toolkit-js
 */

import * as os from "os";
import * as mysql from "mysql";
import { VirtualTable } from "../../resources/reference/virtual-table";
import { VirtualColumn } from "../../resources/reference/virtual-column";
import { MySQLType } from "../../util/mysql-type";

const escapingAgent: mysql.EscapeFunctions = mysql.createPool({
	host: "",
	user: "",
	password: "",
});

type DDLConstructionTestParameters = {
	tableParams: {
		name: string,
		columns: VirtualColumn[],
		comment?: string,
	},
	expectedDDL: string,
};

const ddlTestCases: DDLConstructionTestParameters[] = [
	{
		tableParams: {
			name: "User",
			columns: [
				new VirtualColumn("id", { type: MySQLType.INT(), isNullable: false }, "The ID for this user."),
				new VirtualColumn("name", { type: MySQLType.VARCHAR(128), isNullable: false }, "The name of this user."),
			],
			comment: "A collection of user information.",
		},
		expectedDDL: "CREATE TABLE `User` (" + os.EOL +
			"    `id` INT NOT NULL COMMENT 'The ID for this user.'," + os.EOL +
			"    `name` VARCHAR(128) NOT NULL COMMENT 'The name of this user.'" + os.EOL +
			") COMMENT 'A collection of user information.';",
	},
];

/**
 * These tests seek to test the operations involved in constructing the DDL for
 * a given set of resources.
 */
describe("DDL construction", (): void => {
	
	test("DDL construction should fail for empty tables.", (): void => {
		
		const emptyTable: VirtualTable = new VirtualTable(
			"EmptyTable",
			"A table with no columns."
		);
		
		expect((): string => emptyTable.buildDDL(escapingAgent)).toThrow();
		
	});
	
	test.each<DDLConstructionTestParameters>(ddlTestCases)(
		"DDL construction for '$tableParams.name' is correct.",
		({ tableParams, expectedDDL }: DDLConstructionTestParameters): void => {
			
			const table: VirtualTable = new VirtualTable(
				tableParams.name,
				tableParams.comment,
			);
			
			for (const column of tableParams.columns) table.addColumn(column);
			
			expect(table.buildDDL(escapingAgent)).toBe(expectedDDL);
		
		}
	);
	
});
