/*
 * Created by Trevor Sears <trevor@trevorsears.com> (https://trevorsears.com/).
 * 12:21 PM -- November 19th, 2021
 * Project: @t99/mysql-toolkit
 * 
 * @t99/mysql-toolkit - My personal toolkit of functions and functionality for working with MySQL servers in TypeScript.
 * Copyright (C) 2021 Trevor Sears
 * 
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 * 
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 * 
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

import os from "os";
import * as mysql from "mysql";
import { VirtualSchema } from "../resources/reference/virtual-schema";
import { VirtualTable } from "../resources/reference/virtual-table";
import { VirtualColumn } from "../resources/reference/virtual-column";
import { MySQLType } from "../util/mysql-type";

const escapingAgent: mysql.EscapeFunctions = mysql.createPool({
	host: "localhost",
	user: "root",
	password: ""
});

/**
 * These tests seek to test the operations involved in constructing the DDL for a given set of resources.
 */
describe("DDL construction.", (): void => {
	
	let schema: VirtualSchema;
	
	let table1: VirtualTable;
	// let table2: VirtualTable;
	
	let column_id: VirtualColumn;
	let column_name: VirtualColumn;
	let column_modified_at: VirtualColumn;
	
	beforeEach((): void => {
		
		schema = new VirtualSchema("batadase");
		
		table1 = new VirtualTable("users", "A collection of user information.");
		
		column_id = new VirtualColumn("id", {
			type: MySQLType.INT(),
			isNullable: false
		}, "A uniquely identifying integer.");
		
		column_name = new VirtualColumn("name", {
			type: MySQLType.VARCHAR(128),
			isNullable: true
		}, "The name of this user.");
		
		column_modified_at = new VirtualColumn("modifiedAt", {
			type: MySQLType.VARCHAR(64), // TODO [12/2/2021 @ 9:01 AM] update this to 'DATETIME' once that has been implemented
			isNullable: false,
			extras: "DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP"
		}, "A timestamp for the moment at which this row was most recently modified/updated.");
		
	});
	
	test("Simple column.", (): void => {
		
		expect(column_id.buildDDL(escapingAgent))
		.toStrictEqual("`id` INT NOT NULL COMMENT 'A uniquely identifying integer.'");
		
	});
	
	test("Advanced column.", (): void => {
		
		expect(column_modified_at.buildDDL(escapingAgent))
			.toStrictEqual(
				"`modifiedAt` VARCHAR(64) NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'A " +
				"timestamp for the moment at which this row was most recently modified/updated.'"
			);
		
	});
	
	test("Simple table.", (): void => {
		
		table1.addColumn(column_id);
		
		expect(table1.buildDDL(escapingAgent))
		.toStrictEqual(
			"CREATE TABLE `users` (" + os.EOL +
			"    `id` INT NOT NULL COMMENT 'A uniquely identifying integer.'" + os.EOL +
			") COMMENT 'A collection of user information.';"
		);
		
	});
	
	test("Advanced table.", (): void => {
		
		table1.addColumn(column_id);
		table1.addColumn(column_name);
		table1.addColumn(column_modified_at);
		
		expect(table1.buildDDL(escapingAgent))
		.toStrictEqual(
			"CREATE TABLE `users` (" + os.EOL +
			"    `id` INT NOT NULL COMMENT 'A uniquely identifying integer.'," + os.EOL +
			"    `name` VARCHAR(128) NULL COMMENT 'The name of this user.'," + os.EOL +
			"    `modifiedAt` VARCHAR(64) NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'A timestamp for the moment at which this row was most recently modified/updated.'" + os.EOL +
			") COMMENT 'A collection of user information.';"
		);
		
	});
	
	test("Simple schema.", (): void => {
		
		expect(schema.buildDDL(escapingAgent))
			.toStrictEqual("CREATE SCHEMA `batadase`;");
		
	});
	
	// TODO [12/2/2021 @ 9:13 AM] Test: 'Advanced schema'.
	
});

/**
 * These tests seek to test the interlinked references between resources, such as schema <-> table or table <-> column.
 */
describe("Resource inter-linking.", (): void => {
	
	describe("schema <-> table", (): void => {
		
		let schema1: VirtualSchema;
		// let schema2: VirtualSchema;
		
		let table1: VirtualTable;
		let table2: VirtualTable;
		
		beforeEach((): void => {
			
			schema1 = new VirtualSchema("schema1");
			// schema2 = new VirtualSchema("schema2");
			
			table1 = new VirtualTable("table1");
			table2 = new VirtualTable("table2");
			
		});
		
		describe("Adding table to schema.", (): void => {
			
			describe("From schema.", (): void => {
				
				
				
			});
			
			describe("From table.", (): void => {
				
				
				
			});
			
		});
		
		describe("Renaming table.", (): void => {
			
			beforeEach((): void => {
				
				schema1.addTable(table1);
				schema1.addTable(table2);
				
			});
			
			describe("From schema.", (): void => {
				
				test("Valid renaming operation.", (): void => {
					
					let oldName: string = "table1";
					let newName: string = "table1-backup";
					
					schema1.renameTable(oldName, newName);
					
					expect(schema1.hasTable(oldName)).toBeFalsy();
					expect(schema1.hasTable(newName)).toBeTruthy();
					expect(schema1.getTable(oldName)).not.toBe(table1);
					expect(schema1.getTable(newName)).toBe(table1);
					expect(table1.getName()).toStrictEqual(newName);
					
				});
				
				test("Naming collision.", (): void => {
					
					expect((): void => schema1.renameTable("table1", "table2")).toThrow();
					
				});
				
			});
			
			describe("From table.", (): void => {
				
				test("Valid renaming operation.", (): void => {
					
					let oldName: string = "table1";
					let newName: string = "table1-backup";
					
					table1.setName(newName);
					
					expect(schema1.hasTable(oldName)).toBeFalsy();
					expect(schema1.hasTable(newName)).toBeTruthy();
					expect(schema1.getTable(oldName)).not.toBe(table1);
					expect(schema1.getTable(newName)).toBe(table1);
					expect(table1.getName()).toStrictEqual(newName);
					
				});
				
				test("Naming collision.", (): void => {
					
					expect((): void => table1.setName("table2")).toThrow();
					
				});
				
			});
			
		});
		
		describe("Removing table from schema.", (): void => {
			
			describe("From schema.", (): void => {
				
				
				
			});
			
			describe("From table.", (): void => {
				
				
				
			});
			
		});
		
	});
	
	describe("table <-> column", (): void => {
		
		
		
	});
	
});

describe("Per-method tests.", (): void => {
	
	describe("VirtualSchema", (): void => {
		
		
		
	});
	
	describe("VirtualTable", (): void => {
		
		
		
	});
	
	describe("VirtualColumn", (): void => {
		
		
		
	});
	
});
