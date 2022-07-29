/*
 * Created by Trevor Sears <trevor@trevorsears.com> (https://trevorsears.com/).
 * 1:02 PM -- July 26th, 2022
 * Project: mysql-toolkit-js
 */

import { EscapeFunctions } from "mysql";

export interface QueryComponent {
	
	/**
	 * Builds this query component into a plain string, returning the result.
	 *
	 * @returns {string} A plain string representation for the query component
	 * represented by this QueryComponent.
	 */
	build(escapingAgent: EscapeFunctions): string;
	
}
