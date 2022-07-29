/*
 * Created by Trevor Sears <trevor@trevorsears.com> (https://trevorsears.com/).
 * 7:27 PM -- July 22nd, 2022
 * Project: mysql-toolkit-js
 */

import { Queryable } from "../../connection/queryable";
import { MySQLQueryResults } from "../../util/mysql-query-results";
import { EscapeFunctions } from "mysql";
import { QueryComponent } from "./query-component";

export abstract class QueryStatement implements QueryComponent {
	
	public abstract build(escapingAgent: EscapeFunctions): string;
	
	/**
	 * Executes this statement on the provided {@link Queryable} instance and
	 * returns the result.
	 * 
	 * @param {Queryable} queryable The Queryable instance on which to execute
	 * this statement.
	 * @returns {Promise<MySQLQueryResults>} The result of executing this
	 * statement against the provided Queryable.
	 */
	public async execute(queryable: Queryable): Promise<MySQLQueryResults> {
		
		return await queryable.query(
			this.build(queryable)
		);
		
	}
	
}
