/*
 * Created by Trevor Sears <trevor@trevorsears.com> (https://trevorsears.com/).
 * 8:18 PM -- November 21st, 2022
 * Project: mysql-toolkit-js
 */

import * as mysql from "mysql";
import { VirtualColumn } from "../../resources/reference/virtual-column";
import { MySQLType } from "../../util/mysql-type";
import { ColumnSchema } from "../../resources/schemas/column-schema";

const escapingAgent: mysql.EscapeFunctions = mysql.createPool({
	host: "",
	user: "",
	password: "",
});

type DDLConstructionTestParameters = {
	columnParams: {
		name: string,
		descriptor: ColumnSchema,
		comment?: string,
	},
	expectedDDL: string,
};

const ddlTestCases: DDLConstructionTestParameters[] = [
	{
		columnParams: {
			name: "id",
			descriptor: {
				type: MySQLType.INT(),
				isNullable: false
			},
			comment: "A uniquely identifying integer.",
		},
		expectedDDL: "`id` INT NOT NULL COMMENT 'A uniquely identifying integer.'",
	},
	{
		columnParams: {
			name: "name",
			descriptor: {
				type: MySQLType.VARCHAR(128),
				isNullable: true
			},
			comment: "The name of this user.",
		},
		expectedDDL: "`name` VARCHAR(128) NULL COMMENT 'The name of this user.'",
	},
	{
		columnParams: {
			name: "modifiedAt",
			descriptor: {
				type: MySQLType.VARCHAR(64), // TODO [12/2/2021 @ 9:01 AM] update this to 'DATETIME' once that has been implemented
				isNullable: false,
				extras: "DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP",
			},
			comment: "A timestamp for the moment at which this row was most recently modified/updated.",
		},
		expectedDDL: "`modifiedAt` VARCHAR(64) NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'A timestamp for the moment at which this row was most recently modified/updated.'",
	},
];

/**
 * These tests seek to test the operations involved in constructing the DDL for
 * a given set of resources.
 */
describe("DDL construction", (): void => {
	
	test.each<DDLConstructionTestParameters>(ddlTestCases)(
		"DDL construction for '$columnParams.name' is correct.",
		({ columnParams, expectedDDL }: DDLConstructionTestParameters): void => {
			
			const column: VirtualColumn = new VirtualColumn(
				columnParams.name,
				columnParams.descriptor,
				columnParams.comment,
			);
			
			expect(column.buildDDL(escapingAgent)).toBe(expectedDDL);
		
		}
	);
	
});
