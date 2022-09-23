/*
 * Created by Trevor Sears <trevor@trevorsears.com> (https://trevorsears.com/).
 * 8:27 AM -- November 29th, 2021
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

import os from "os";

/**
 * Adds the specified indentation string as indentation to the lines of the provided content string, joining the lines
 * back together with the specified eol (end-of-line) string.
 * 
 * @param {string} content The content to reformat with indentation.
 * @param {string} indentation The indentation string to add to the beginning of each line. Defaults to a single tab.
 * @param {string} eol The end-of-line character with which to join the lines of the content string back together with.
 * @returns {string} The reformatted/indented content string.
 */
export function indentLines(content: string, indentation: string = "\t", eol: string = os.EOL): string {
	
	return content.split(os.EOL).map(
		(line: string): string => `${indentation}${line}`
	).join(eol); 
	
}
