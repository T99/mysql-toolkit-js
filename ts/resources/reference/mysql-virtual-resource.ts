/*
 * Created by Trevor Sears <trevor@trevorsears.com> (https://trevorsears.com/).
 * 11:27 AM -- December 03, 2021.
 * Project: @t99/mysql-toolkit
 * 
 * @t99/mysql-toolkit - My personal toolkit of functions and functionality for
 *     working with MySQL servers in TypeScript.
 * Copyright (C) 2022 Trevor Sears
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

import mysql from "mysql";

export abstract class MySQLVirtualResource {
	
	protected name: string;
	
	protected constructor(name: string) {
		
		this.name = name;
		
	}
	
	public getName(): string {
		
		return this.name;
		
	}
	
	public setName(name: string): void {
		
		this.name = name;
		
	}
	
	public abstract buildDDL(escapingAgent: mysql.EscapeFunctions): string;
	
}
