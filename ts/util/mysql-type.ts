/*
 * Created by Trevor Sears <trevor@trevorsears.com> (https://trevorsears.com/).
 * 4:45 PM -- October 28, 2021.
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

import { MySQLInvalidTypeError } from "../errors/mysql-invalid-type-error";

export type MySQLTypeDescriptor = {
	
	readonly dataType: string;
	
	readonly characterMaximumLength?: number;
	
	readonly numericPrecision?: number;
	
	readonly numericScale?: number;
	
	readonly datetimePrecision?: number;
	
};

export class MySQLType {
	
	// ========== Numeric Types ==========
	
	public static TINYINT(): MySQLType {
		
		return new MySQLType({
			dataType: "TINYINT"
		});
		
	}
	
	public static SMALLINT(): MySQLType {
		
		return new MySQLType({
			dataType: "SMALLINT"
		});
		
	}
	
	public static MEDIUMINT(): MySQLType {
		
		return new MySQLType({
			dataType: "MEDIUMINT"
		});
		
	}
	
	public static INT(): MySQLType {
		
		return new MySQLType({
			dataType: "INT"
		});
		
	}
	
	public static BIGINT(): MySQLType {
		
		return new MySQLType({
			dataType: "BIGINT"
		});
		
	}
	
	public static DECIMAL(): MySQLType;
	public static DECIMAL(precision: number): MySQLType;
	public static DECIMAL(precision: number, scale: number): MySQLType;
	public static DECIMAL(precision?: number, scale?: number): MySQLType {
		
		if ((scale ?? 0) > (precision ?? 10)) {
			
			throw new MySQLInvalidTypeError(
				"DECIMAL",
				`Scale cannot be greater than precision (scale: ${scale ?? 0}, precision: ${precision ?? 10}).`
			);
			
		}
		
		return new MySQLType({
			dataType: "DECIMAL",
			numericPrecision: precision,
			numericScale: scale
		});
		
	}
	
	public static FLOAT(): MySQLType {
		
		return new MySQLType({
			dataType: "FLOAT"
		});
		
	}
	
	public static DOUBLE(): MySQLType {
		
		return new MySQLType({
			dataType: "DOUBLE"
		});
		
	}
	
	public static BIT(): MySQLType;
	public static BIT(precision: number): MySQLType;
	public static BIT(precision?: number): MySQLType {
		
		return new MySQLType({
			dataType: "BIT",
			numericPrecision: precision ?? 1
		});
		
	}
	
	// ========== Textual Types ==========
	
	public static VARCHAR(length: number): MySQLType {
		
		return new MySQLType({
			dataType: "VARCHAR",
			characterMaximumLength: length
		});
		
	}
	
	public static CHAR(length: number): MySQLType {
		
		return new MySQLType({
			dataType: "CHAR",
			characterMaximumLength: length
		})
		
	}
	
	// ========== Instance Members ==========
	
	public readonly descriptor: Readonly<MySQLTypeDescriptor>;
	
	public constructor(descriptor: MySQLTypeDescriptor) {
		
		this.descriptor = descriptor;
		
	}
	
	public toSQLString(): string {
		
		let result: string = this.descriptor.dataType;
		
		let arg1: number | undefined = this.descriptor.characterMaximumLength ??
		                               this.descriptor.numericPrecision ??
		                               this.descriptor.datetimePrecision;
		let arg2: number | undefined = this.descriptor.numericScale;
		
		if (arg1 !== undefined) {
			
			result += `(${arg1}`;
			
			if (arg2 !== undefined) result += `, ${arg2}`;
			
			result += `)`;
			
		}
		
		return result;
		
	}
	
}
