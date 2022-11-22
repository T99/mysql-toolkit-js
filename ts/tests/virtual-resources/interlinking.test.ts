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

import { VirtualSchema } from "../../resources/reference/virtual-schema";
import { VirtualTable } from "../../resources/reference/virtual-table";
// import { VirtualColumn } from "../../resources/reference/virtual-column";

/**
 * These tests seek to test the interlinked references between resources, such
 * as schema <-> table or table <-> column.
 */
describe("Resource inter-linking.", (): void => {
	
	describe("schema <-> table", (): void => {
		
		let schema1: VirtualSchema;
		
		let table1: VirtualTable;
		let table2: VirtualTable;
		
		beforeEach((): void => {
			
			schema1 = new VirtualSchema("schema1");
			
			table1 = new VirtualTable("table1");
			table2 = new VirtualTable("table2");
			
		});
		
		describe("Adding table to schema.", (): void => {
			
			test("From schema.", (): void => {
				
				schema1.addTable(table1);
				
				expect(schema1.hasTable("table1")).toBeTruthy();
				expect(schema1.hasTable(table1)).toBeTruthy();
				expect(schema1.hasTable("table2")).toBeFalsy();
				expect(schema1.hasTable(table2)).toBeFalsy();
				expect(table1.hasParentSchema("schema1")).toBeTruthy();
				expect(table1.hasParentSchema(schema1)).toBeTruthy();
				expect(table2.hasParentSchema("schema1")).toBeFalsy()
				expect(table2.hasParentSchema(schema1)).toBeFalsy();
				
			});
			
			test("From table.", (): void => {
				
				table1.setParentSchema(schema1);
				
				expect(schema1.hasTable("table1")).toBeTruthy();
				expect(schema1.hasTable(table1)).toBeTruthy();
				expect(schema1.hasTable("table2")).toBeFalsy();
				expect(schema1.hasTable(table2)).toBeFalsy();
				expect(table1.hasParentSchema("schema1")).toBeTruthy();
				expect(table1.hasParentSchema(schema1)).toBeTruthy();
				expect(table2.hasParentSchema("schema1")).toBeFalsy()
				expect(table2.hasParentSchema(schema1)).toBeFalsy();
				
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
					
					expect(
						(): void => schema1.renameTable("table1", "table2")
					).toThrow();
					
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
