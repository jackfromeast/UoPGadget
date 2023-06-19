/** jackfromeast
 * 
 * when we create an pure symbol, what we are trying to say is that the type/sort of the value is undecidable yet
 * in ExpoSE, they try to mkNot of all the others types and tese them one by one
 * in ExpoSE+, we try to determine the type of the value in the first round, add the possible type constraints and only check these types in the following rounds
 * 
 * when conduct symbolic execution with prueSymbol, all the operations(binary, unary, methods, etc) will helps to determine what types COULD the value holds, and push to the path constraints
 * however, since javascript supports an implicit type conversion, we are trying to determine the type of the value that most likely to be and necessary to be 
 * 
 * TODO: the decision of the type of the pure symbol should be keep refining
 * e.g.
 * if there aren't any forin/get/set operations, then object/array won't be pushed to the path constraints
 * 
 * TODO: should we summary the type of the pure symbol in the end of the execution?
 * currently, we add types once we seen a new operation
 * however, to determine the valid type of the pure symbol, we need to check all the operations
 * e.g.
 * if(x.a.length > 0) { ... } => x.a is an array, object, or string
 * x.a + ".local" => x.a can only be a string, or array (due to the implicit type conversion)
 * 
 * FIXME: 
 * if we only try to indicate the type of pureSymbol in the first round, some operations may not be visible as the concrete value is undefined
 * e.g.
 * if (x.a && x.a.length > 0) { ... }
 * a could be an array or object, however, we don't know the length field has been visited in the first round
 * 
 * 
 */
import { WrappedValue } from "./wrapped-values";

/**
 * the following are the methods names of the different object
 * delete the shared methods for different types: toString, valueOf, toLocaleString
 */
class MethodDict{
    constructor(){
        // this is a static class 
    }

    static string_methods = ["charAt", "charCodeAt", "concat", "endsWith", "includes", "indexOf", "lastIndexOf", "localeCompare", "match", "normalize", "padEnd", "padStart", "repeat", "replace", "search", "slice", "split", "startsWith", "substring", "toLocaleLowerCase", "toLocaleUpperCase", "toLowerCase", "toUpperCase", "trim", "trimStart", "trimEnd"]

    static array_methods = ["concat", "copyWithin", "entries", "every", "fill", "filter", "find", "findIndex", "flat", "flatMap", "forEach", "includes", "indexOf", "join", "keys", "lastIndexOf", "map", "pop", "push", "reduce", "reduceRight", "reverse", "shift", "slice", "some", "sort", "splice", "unshift", "values", "length"]

    static number_methods = ["toExponential", "toFixed", "toLocaleString", "toPrecision"]

    // static boolean_methods = ["toString", "valueOf"]

    static object_methods = ["hasOwnProperty", "isPrototypeOf", "propertyIsEnumerable"]
}

class PureSymbol extends WrappedValue {
    
    constructor(name) {
       	super(undefined);

        this.__defineProperty("_name", name)
        this.__defineProperty("_possibleTypes", [])
        this.__defineProperty("_pureType", undefined)

        this.__defineProperty("_method_dict", {
            "string": MethodDict.string_methods,
            "array": MethodDict.array_methods,
            "number": MethodDict.number_methods,
            // "boolean": MethodDict.boolean_methods,
            "object": MethodDict.object_methods
        })
    }

    __defineProperty(name, value){
        Object.defineProperty(this, name, {
            value: value,
            enumerable: false,
            writable: true,
            configurable: true
        });
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
            if(operand_type === "boolean"){
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
                // TODO: the array type is not accurate
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
     * 
     * A found issue:
     * if the something like `a.b.c` apprears, although b is most likely an object, but there also a chance that we can make a.b a primitive and c an other primitive(undefined property) 
     * 
     * 
     * TODO:
     * For the getField method, there are three cases for the offset:
     * 1. built-in method name: string, array, number, boolean, object
     * 2. index(numeric): array
     * 3. property name(string): object
     * 
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

    getPossibleTypes(){ 
        // if the type is unknown
        if(this._possibleTypes.length === 0){
            return ["string","object","array_string"];
        }
        else{
            // always include string
            this._possibleTypes.push("string");
            return Array.from(new Set(this._possibleTypes)); 
        }
    }

    getName(){ return this._name; }

    setPureType(type){ this._pureType = type; }

    getPureType(){ return this._pureType; }
}

export { PureSymbol };