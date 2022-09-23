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

import { MySQLVirtualResource } from "./mysql-virtual-resource";

export abstract class MySQLVirtualResourceWithComment extends MySQLVirtualResource {
	
	protected comment?: string;
	
	protected constructor(name: string, comment?: string) {
		
		super(name);
		
		this.comment = comment;
		
	}
	
	public getComment(): string | undefined {
		
		return this.comment;
		
	}
	
	public hasComment(): boolean {
		
		return this.comment !== undefined;
		
	}
	
	public setComment(comment: string | undefined): void {
		
		this.comment = comment;
		
	}
	
	public removeComment(): void {
		
		this.setComment(undefined);
		
	}
	
}
