/*
 * Created by Trevor Sears <trevor@trevorsears.com> (https://trevorsears.com/).
 * 5:58 PM -- September 26th, 2022
 * Project: mysql-toolkit-js
 */

import { SELECT, SelectStatement } from "../../query/select-statement";
import {
	DatabaseConnectionPool
} from "../../connection/database-connection-pool";

let database: DatabaseConnectionPool;

beforeAll((): void => {
	
	database = new DatabaseConnectionPool({
	});
	
});

test("Basic initialization", (): void => {
	
	const statement: SelectStatement = SELECT(["id", "name"], "myTable");
	
	expect(statement.build(database))
		.toBe("SELECT `id`, `name` FROM `myTable`");
	
});
