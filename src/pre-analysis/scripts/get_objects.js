const fs = require('fs')

var ORI_PATH_SUFFIX = "src/pre-analysis/test/"
var WORK_PATH_SUFFIX = "src/pre-analysis/test/"
// var ORI_PATH_SUFFIX = "./"
// var WORK_PATH_SUFFIX = "./"

var TYPES = ['function', 'string', 'number', 'boolean', 'undefined', 'any']

function read_logged_objects(){
    let logged_objects = fs.readFileSync(WORK_PATH_SUFFIX+'./logged_raw_objects.json', 'utf8');
    logged_objects = JSON.parse(logged_objects)
    return logged_objects;
}

class Lexer{
    // constructor
    constructor(object_stringlike) {
        this.input = object_stringlike;
        this.input_length = object_stringlike.length
        this.cur_index = 0;
        this.lookahead_index = 0;
    }

    read_tokens(from, to) {
        let token = this.input.slice(from, to);

        this.cur_index = to;
        this.lookahead_index = to;

        return token;

    }

    lookahead(from, to){
        return this.input.slice(from, to);
    }
    
    // fast forward to the first non-whilespace tokens
    consume_whitespace(){
        for (let i = this.cur_index; i < this.input_length; i++) {
            let token = this.lookahead(i, i+1);
            if(token!==' '){
                this.read_tokens(this.get_current_index, i);
                break;
            }
        }
    }

    consume_a_char(target){
        for (let i = this.cur_index; i < this.input_length; i++) {
            let token = this.lookahead(i, i+1);
            if(token===target){
                this.read_tokens(this.get_current_index, i+1);
                break;
            }
        }
    }

    get_current_index(){
        return this.cur_index;
    }

    is_end(){
        if(this.cur_index >= this.input_length){
            return true;
        }else{
            return false;
        }
    }

}

/**
 * @description destringfy the output of util.inspect() to js objects
 */
function parse(object_stringlike){
    // parse the first layer
    let obj = parse_a_layer(object_stringlike);

    // parse recursively
    obj = __parse(obj);

    return obj;
}

/**
 * @description a helper function to parse recursively
 */
function __parse(obj){
    for (let key in obj){
        if(!TYPES.includes(obj[key])){
            obj[key] = __parse(parse_a_layer(obj[key]))
        }
    }
    return obj
}

/**
 * @description destringfy a layer of the output of util.inspect() to js objects
 * @param object_stringlike
 * 
 * every layer has the same pattern(object or array):
 * {
 *     key_name: (\n)(<ref *a_number>) {next_layer}/other permitives/{[Function: ]\n[xxx]\n}
 * }
 * or 
 * [permitive/{}/function, ...[length]: N]
 */
function parse_a_layer(object_stringlike){
    let layer_type = "object"; //by default

    //clean the \n in the object_stringlike
    object_stringlike = object_stringlike.replaceAll(/\n/g, '');

    let lexer = new Lexer(object_stringlike);

    lexer.consume_whitespace();
    // find the outter-most string { or [
    // inital the layer
    if(lexer.lookahead(lexer.get_current_index(), lexer.get_current_index()+1)==='{'){
        lexer.consume_a_char('{');
        var cur_layer = {};
    }else if(lexer.lookahead(lexer.get_current_index(), lexer.get_current_index()+1)==='['){
        lexer.consume_a_char('[');
        var cur_layer = [];
        layer_type = "array";
    }else{
        console.log("[-]Found error while parsing: cannot recongnize outter-most [ or {")
    }


    while(!lexer.is_end()){

        // could be an empty object or array
        if(lexer.lookahead(lexer.get_current_index(), lexer.get_current_index()+1)==='}'){
            cur_layer = {};
            break;
        }else if(lexer.lookahead(lexer.get_current_index(), lexer.get_current_index()+1)===']'){
            cur_layer = [];
            break;
        }

        // find a key and its string like value
        if(layer_type==="object"){
            // first read the key_name
            var key_name = [] // [from_index, to_index, keyname]
            lexer.consume_whitespace();
            key_name.push(lexer.get_current_index());
            for (let i = lexer.get_current_index(); i < object_stringlike.length; i++) {
                let token = lexer.lookahead(i, i+1);
                if(token===' ' || token ===':'){
                    key_name.push(i);
                    key_name.push(lexer.read_tokens(key_name[0], key_name[1]));
                    break;
                }
            }

            // find the :
            lexer.consume_a_char(':');
        }
        
        // find the {} or <ref *N> {} or permitive like value
        let type = 'any';
        let value = []; // [from_index, to_index, value]
        lexer.consume_whitespace();
        switch(lexer.lookahead(lexer.get_current_index(), lexer.get_current_index()+1)){
            // another layer of object or looks like another function
            case '{':
                var left_brace_stack = [];
                left_brace_stack.push(lexer.get_current_index());

                // push the {
                value.push(lexer.get_current_index());
                lexer.consume_a_char('{')
                lexer.consume_whitespace();

                let next_token = lexer.lookahead(lexer.get_current_index(), lexer.get_current_index()+1);

                // pretty sure it is a function rather than an object
                // do not return its value
                if(next_token === '['){
                    type = 'function';
                }
                
                // to aviod string "{", we should ignore the { and } inside ' or "
                let apostrophe_stack = [];
                let double_quotes_stack = [];

                for (let i = lexer.get_current_index(); i < object_stringlike.length; i++) {
                    let token = lexer.lookahead(i, i+1);
                    if(token === '"' && apostrophe_stack.length===0){
                        double_quotes_stack.push(i);
                        if(double_quotes_stack.length%2===0){double_quotes_stack = [];}
                    }
                    else if(token === "'" && double_quotes_stack.length===0){
                        apostrophe_stack.push(i);
                        if(apostrophe_stack.length%2===0){apostrophe_stack = [];}
                    }
                    else if(token==='{' && apostrophe_stack.length===0 && double_quotes_stack.length===0){
                        left_brace_stack.push(i);
                    }
                    else if(token==='}' && apostrophe_stack.length===0 && double_quotes_stack.length===0){
                        left_brace_stack.pop();
                        if(left_brace_stack.length === 0){
                            value.push(i);
                            value.push(lexer.read_tokens(value[0], value[1]));
                            // consume the }
                            value[2] = value[2]+lexer.read_tokens(i, i+1);
                            break;
                        }
                    }
                }

                // append to the cur_layer
                if(layer_type==="object"){
                    if(type==='function'){
                        cur_layer[key_name[2]] = 'function';
                    }else{
                        cur_layer[key_name[2]] = value[2];
                    }
                }
                else{
                    if(type==='function'){
                        cur_layer.push('function');
                    }else{
                        cur_layer.push(value[2]);
                    }
                }

                // consume next comma
                lexer.consume_a_char(',');
                break;

            // looks like a function
            case '<':
                for (let i = lexer.get_current_index(); i < object_stringlike.length; i++) {
                    token = lexer.lookahead(i, i+1);
                    if(token==='>'){
                        // consume the <ref *N>
                        lexer.read_tokens(lexer.get_current_index(), i+1);
                        break
                    }
                }
                lexer.consume_whitespace();

                // fast forward to the next {
                if(lexer.lookahead(lexer.get_current_index(), lexer.get_current_index()+1)!=='{'){
                    console.log('Error!! Cannot find the next { after <ref *N>');
                }

                var left_brace_stack = [];
                left_brace_stack.push(lexer.get_current_index());
                value.push(lexer.get_current_index());

                for (let i = lexer.get_current_index()+1; i < object_stringlike.length; i++) {
                    token = lexer.lookahead(i, i+1);
                    if(token==='{'){
                        left_brace_stack.push(i);
                    }
                    else if(token==='}'){
                        left_brace_stack.pop();
                        if(left_brace_stack.length === 0){
                            value.push(i);
                            value.push(lexer.read_tokens(value[0], value[1]));
                            // consume the }
                            value[2] = value[2]+lexer.read_tokens(i, i+1);
                            break;
                        }
                    }
                }

                // append to the cur_layer
                if(layer_type==="object"){
                    cur_layer[key_name[2]] = 'function';
                }
                else{
                    cur_layer.push('function');
                }

                // consume next comma
                lexer.consume_a_char(',');

                break;

            // might be other perimitive
            // determine whether it is string, number or bool
            case '"':
                for (let i = lexer.get_current_index()+1; i < object_stringlike.length; i++) {
                    token = lexer.lookahead(i, i+1);
                    if(token==='"'){
                        // consume the 'xxx'
                        lexer.read_tokens(lexer.get_current_index(), i+1);
                        break
                    }
                }
                if(layer_type==="object"){
                    cur_layer[key_name[2]] = 'string';
                }
                else{
                    cur_layer.push('string');
                }

                // consume next comma
                lexer.consume_a_char(',');
                break;

            case "'":
                for (let i = lexer.get_current_index()+1; i < object_stringlike.length; i++) {
                    token = lexer.lookahead(i, i+1);
                    if(token==="'"){
                        // consume the "xxx"
                        lexer.read_tokens(lexer.get_current_index(), i+1);
                        break
                    }
                }

                if(layer_type==="object"){
                    cur_layer[key_name[2]] = 'string';
                }
                else{
                    cur_layer.push('string');
                }

                // consume next comma
                lexer.consume_a_char(',');
                break;

            default:
                lexer.consume_whitespace();
                value.push(lexer.get_current_index());
                for (let i = lexer.get_current_index()+1; i < object_stringlike.length; i++) {
                    token = lexer.lookahead(i, i+1);
                    if(token===' ' || token===','){
                        value.push(i);
                        // consume the value (could be number or bool)
                        value.push(lexer.read_tokens(lexer.get_current_index(), i));
                        break
                    }
                }

                const number_regex = /-?[0-9]+/;
                const bool_regex = /^true$|^false$/;
                const undefined_regex = /undefined/;
                let value_tmp = value.pop();
                if(number_regex.test(value_tmp)){
                    if(layer_type==="object"){
                        cur_layer[key_name[2]] = 'number';
                    }
                    else{
                        cur_layer.push('number');
                    }
                }
                else if(bool_regex.test(value_tmp)){
                    if(layer_type==="object"){
                        cur_layer[key_name[2]] = 'boolean';
                    }
                    else{
                        cur_layer.push('boolean');
                    }
                }
                else if(undefined_regex.test(value_tmp)){
                    if(layer_type==="object"){
                        cur_layer[key_name[2]] = 'undefined';
                    }
                    else{
                        cur_layer.push('undefined');
                    }
                }
                else{
                    if(layer_type==="object"){
                        cur_layer[key_name[2]] = 'any';
                    }
                    else{
                        cur_layer.push('any');
                    }
                }
                lexer.consume_a_char(',');
                break

        }
        
        // check the end } or [length]: N ]
        lexer.consume_whitespace();
        if(layer_type==='object'){
            if(lexer.lookahead(lexer.get_current_index(), lexer.get_current_index()+1)=='}'){
                lexer.consume_a_char('}');
            }
        }else{
            const array_end_regex = /^\[length\]:\s?\d+\s?\]/
            if(array_end_regex.test(lexer.lookahead(lexer.get_current_index(), object_stringlike.length))){
                lexer.read_tokens(lexer.get_current_index(), object_stringlike.length);
            }
        }

    }

    return cur_layer;
    
}



function main(){
    let logged_objects_stringlike = read_logged_objects();

    // delete the string that include each other
    let filtered_logged_objects_stringlike = [];
    for (let i = 0; i<logged_objects_stringlike.length; i++) {
        let del_flag = false;
        for (let j=i+1; j<logged_objects_stringlike.length; j++){
            if(logged_objects_stringlike[j].includes(logged_objects_stringlike[i])){
                del_flag = true;
                break;
            }
        }
        if(!del_flag){
            filtered_logged_objects_stringlike.push(logged_objects_stringlike[i]);
        }
    }

    let parsed_objects = []
    for (let i = 0; i<filtered_logged_objects_stringlike.length; i++) {
        try{
            parsed_objects.push(parse(filtered_logged_objects_stringlike[i]));
        }
        catch(e){
            console.log("[-]Found a error while parsing an object: " + e);
            console.log(filtered_logged_objects_stringlike[i]);
        }
    }
    //
    fs.writeFile('./parsed_objects.json', JSON.stringify(parsed_objects, null, "\t"), 'utf8', ()=>{});

}

main()