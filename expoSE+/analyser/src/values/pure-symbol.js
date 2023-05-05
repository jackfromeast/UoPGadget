/** jackfromeast
 * 
 * when we create an pure symbol, what we are trying to say is that the type/sort of the value is undecidable yet
 * in ExpoSE, they try to mkNot of all the others types and tese them one by one
 * in ExpoSE+, we try to determine the type of the value in the first round, add the possible type constraints and only check these types in the following rounds
 * 
 * when conduct symbolic execution with prueSymbol, all the operations(binary, unary, methods, etc) will helps to determine the type of the value, and push to the path constraints
 * however, since javascript supports an implicit type conversion, we are trying to determine the type of the value that most likely to be and necessary to be 
 * 
 * TODO: the decision of the type of the pure symbol should be keep refining
 * e.g.
 * if there aren't any forin/get/set operations, then object/array won't be pushed to the path constraints
 * 
 * 
 */
import { WrappedValue } from "./wrapped-values";

class PureSymbol extends WrappedValue {
    
    constructor(name) {
       	super(undefined);

       	this._name = name;
        this._possibleTypes = [];
        this._pureType = undefined;

        // the following are the methods names of the different object
        // delete the shared methods for different types: toString, valueOf, toLocaleString
        this._string_methods = ["charAt", "charCodeAt", "concat", "endsWith", "includes", "indexOf", "lastIndexOf", "localeCompare", "match", "normalize", "padEnd", "padStart", "repeat", "replace", "search", "slice", "split", "startsWith", "substring", "toLocaleLowerCase", "toLocaleUpperCase", "toLowerCase", "toUpperCase", "trim", "trimStart", "trimEnd"]
        this._array_methods = ["concat", "copyWithin", "entries", "every", "fill", "filter", "find", "findIndex", "flat", "flatMap", "forEach", "includes", "indexOf", "join", "keys", "lastIndexOf", "map", "pop", "push", "reduce", "reduceRight", "reverse", "shift", "slice", "some", "sort", "splice", "unshift", "values"]
        this._number_methods = ["toExponential", "toFixed", "toLocaleString", "toPrecision"]
        // this._boolean_methods = ["toString", "valueOf"]
        this._object_methods = ["hasOwnProperty", "isPrototypeOf", "propertyIsEnumerable"]

        this._method_dict = {
            "string": this._string_methods,
            "array": this._array_methods,
            "number": this._number_methods,
            // "boolean": this._boolean_methods,
            "object": this._object_methods
        }
    }

    /**
     * try to determine the type of the pure symbol through the operations
     * 
     * for the binary operations, we can determine the type of the pure symbol by the type of the operands
     * for the unary operations, we can indicate the type of the pure symbol by the type of the operator
     * for the methods, we can indicate the type of the pure symbol by through the name of the method
     * @param {string} op_type: binary, unary, method
     * @param {string} op: operator or method name 
     * @param {*} operand_type: only exists if the op_type is binary
     * @param {*} get_field_name: only exists if the op_type is method and op is getField
     */
    addType(op_type, op, operand_type=undefined, get_field_name=undefined){
        if(op_type === "binary"){
            this.__handleBinaryType(op, operand_type);
        }
        else if(op_type === "unary"){
            this.__handleUnaryType(op);
        }
        else if(op_type === "method"){
            this.__handleMethodType(op, get_field_name);
        }
    }

    /**
     * determine the type of the pure symbol by the type of the operator
     * however, the usually the type of the unary operator is not enough to determine the type of the pure symbol
     * @param {*} op : +, -, ~, !, typeof
     */
    __handleUnaryType(op){
        let possible_type = "unknown";

        if(op === "+"){
            // could be number, boolean, etc
            // shouldn't be undefined, null, object, array, string, etc

        }else if(op === "-"){
            // could be number, boolean, etc
            // shouldn't be undefined, null, object, array, string, etc

        }else if(op === "~"){
            // could be all kinds of primitive types
            // shouldn't be object, array, etc

        }else if(op === "!"){
            // could be all kinds of primitive types
            // shouldn't be object, array, etc
        }else if(op === "typeof"){
            // could be all kinds of primitive types
            // shouldn't be object, array, etc
        }else{
            possible_type = "unknown"
        }

    }

    /**
     * determine the type of the pure symbol by the type of the operands
     * @param {*} op: +, - , *, /, %, <<, >>, >>>, &, |, ^, ==, !=, ===, !==, <, <=, >, >=, instanceof, in
     * @param {*} operand_type 
     */
    __handleBinaryType(op, operand_type){
        let possible_type = "unknown";
        if(op !== 'in'){
            if(operand_type === "undefined"){
                possible_type = "undefined"
                this._possibleTypes.push(possible_type);
            }else if(operand_type === "null"){
                possible_type = "null"
                this._possibleTypes.push(possible_type);
            }else if(operand_type === "boolean"){
                possible_type = "boolean"
                this._possibleTypes.push(possible_type);
            }else if(operand_type === "number"){
                possible_type = "number"
                this._possibleTypes.push(possible_type);
            }else if(operand_type === "string"){
                possible_type = "string"
                this._possibleTypes.push(possible_type);
            }else if(operand_type === "object"){
                possible_type = "object"
                this._possibleTypes.push(possible_type);
            }else if(operand_type === "array"){
                possible_type = "array"
                this._possibleTypes.push(possible_type);
            }else{
                possible_type = "unknown"
            }
        }
        else if (op === 'in'){
            this._possibleTypes.push("array");
            this._possibleTypes.push("object");
        }
    }

    /**
     * determine the type of the pure symbol by the name of the method
     */
    __handleMethodType(op, field_name){
        
        // most likely the pure symbol is an object
        this._possibleTypes.push("object");

        // other possible types
        if(op === 'getField'){
            for (const [type, methodList] of Object.entries(this._method_dict)) {
                if (methodList.includes(field_name)) {
                    this._possibleTypes.push(type);
                }
            }
        }
    }

    getPossibleTypes(){ return new Set(this._possibleTypes); }

    getName(){ return this._name; }

    setPureType(type){ this._pureType = type; }

    getPureType(){ return this._pureType; }
}

export { PureSymbol };