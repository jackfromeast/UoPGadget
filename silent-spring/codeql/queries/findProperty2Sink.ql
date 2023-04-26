import javascript
import DataFlow::PathGraph

/**
 * @name findProperty2Sink
 * @description find the gadgets from property(not necessary to be undefined) accessed to the eval like sink
 *              TODO: cannot resolve the function call(return value) as the argument of the sink
 * @kind @kind path-problem
 * @id findProperty2Sink
 */

/**
 * An expression which may be evaluated as JavaScript.
 */
class EvalJavaScriptSink extends DataFlow::ValueNode {
    EvalJavaScriptSink() {
        exists(DataFlow::InvokeNode c, int index |
        exists(string callName | c = DataFlow::globalVarRef(callName).getAnInvocation() |
            callName = "eval" and index = 0
            or
            callName = "Function" and index = -1
            or
            callName = "execScript" and index = 0
            or
            callName = "executeJavaScript" and index = 0
            or
            callName = "execCommand" and index = 0
            or
            callName = "setTimeout" and index = 0
            or
            callName = "setInterval" and index = 0
            or
            callName = "setImmediate" and index = 0
        )
        or
        c = DataFlow::globalVarRef("WebAssembly").getAMemberCall(["compile", "compileStreaming"]) and
        index = -1
        |
        this = c.getArgument(index)
        or
        index = -1 and
        this = c.getAnArgument()
        )
    }
}

/**
 * A custom `EvalJavaScriptSink` wrapper.
 *
 * * `t` holds `EvalJavaScriptSink`.
 * * `c` holds the call holding `t`.
 *
 * There's an additional taint step specified in order to catch
 * `tainted` in sinks like `tainted + foo`; since the sink is
 * the entire argument, this way the results are more accurate.
 */
class CustomedEvalJavaScriptSink extends DataFlow::ValueNode {
    DataFlow::ValueNode t;
    DataFlow::InvokeNode c;
  
    CustomedEvalJavaScriptSink() {
      t instanceof EvalJavaScriptSink and
      c.getAnArgument() = t and
      (
        if exists(t.asExpr().(AddExpr))
        then this.asExpr() = t.asExpr().(AddExpr).getAnOperand()
        else this = t
      )
    }
  
    DataFlow::InvokeNode getCall() { result = c }
}

class PropertyReadToEvalConfig extends TaintTracking::Configuration {
    PropertyReadToEvalConfig() { this = "flag{##Tainted}" }
  
    /**
     * An `ObjectLiteralNode` that does not set a custom prototype
     * on its declaration or flow.
     *
     * See `BadIfPollutedSource`.
     */
    override predicate isSource(DataFlow::Node source) { 
        source instanceof DataFlow::PropRead and
        underSrcPath(source) and notAMethod(source)
    }
  
    /**
     * An expression which may be evaluated as JavaScript.
     *
     * See `CustomedEvalJavaScriptSink`.
     */
    override predicate isSink(DataFlow::Node sink) { 
        sink instanceof CustomedEvalJavaScriptSink 
    }

}
  

predicate underSrcPath(DataFlow::PropRead prop_read) {
    prop_read.getFile().getAbsolutePath().indexOf("/home/PPAEG/src/pre-analysis/")=0
}

/**
 * Never appears a call-like statement on this property read
 * for the property read noe console.log 
 * statement like `console.log("xxxx")` would indicate that `log` is a method property
*/
predicate notAMethod(DataFlow::PropRead prop_read) {
    not exists(prop_read.getACall())
}


// from PropertyReadToEvalConfig cfg, DataFlow::PathNode source, DataFlow::PathNode sink
// where cfg.hasFlowPath(source, sink)
// select sink.getNode().(CustomedEvalJavaScriptSink).getCall(), source, sink

from DataFlow::Node sink
where sink instanceof CustomedEvalJavaScriptSink
    and sink.toString()="template"
select sink.getAPredecessor()