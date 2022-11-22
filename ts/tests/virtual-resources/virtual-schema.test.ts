/*
 * Created by Trevor Sears <trevor@trevorsears.com> (https://trevorsears.com/).
 * 8:18 PM -- November 21st, 2022
 * Project: mysql-toolkit-js
 */

import * as mysql from "mysql";
import { VirtualSchema } from "../../resources/reference/virtual-schema";

const escapingAgent: mysql.EscapeFunctions = mysql.createPool({
	host: "",
	user: "",
	password: "",
});

type DDLConstructionTestParameters = {
	schemaParams: {
		name: string,
	},
	expectedDDL: string,
};

const ddlTestCases: DDLConstructionTestParameters[] = [
	{
		schemaParams: {
			name: "batadase",
		},
		expectedDDL: "CREATE SCHEMA `batadase`;",
	},
	{
		schemaParams: {
			name: "whataface",
		},
		expectedDDL: "CREATE SCHEMA `whataface`;",
	},
	{
		schemaParams: {
			name: "largeFryChocolateShake",
		},
		expectedDDL: "CREATE SCHEMA `largeFryChocolateShake`;",
	},
];

/**
 * These tests seek to test the operations involved in constructing the DDL for
 * a given set of resources.
 */
describe("DDL construction", (): void => {
	
	test.each<DDLConstructionTestParameters>(ddlTestCases)(
		"DDL construction for '$schemaParams.name' is correct.",
		({ schemaParams, expectedDDL }: DDLConstructionTestParameters): void => {
			
			const schema: VirtualSchema = new VirtualSchema(
				schemaParams.name,
			);
			
			expect(schema.buildDDL(escapingAgent)).toBe(expectedDDL);
		
		}
	);
	
});
