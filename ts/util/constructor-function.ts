/*
 * Created by Trevor Sears <trevor@trevorsears.com> (https://trevorsears.com/).
 * 6:18 PM -- November 22nd, 2022
 * Project: mysql-toolkit-js
 */

/**
 * A type that allows users to extract constructor arguments and 'return' type
 * from a given newable type.
 */
type Constructor<Args extends any[] = any, Type = any> = new (...args: Args) => Type;

/**
 * A function type that matches the parameter types of the given 
 */
export type ConstructorFunction<T extends new (...args: any) => any> =
	T extends Constructor<infer Args, infer Type> ? (...args: Args) => Type : never;
