/**
 * https://github.com/github/codeql/tree/main/javascript/ql/src/Security
 */
import javascript
// import DataFlow
import DataFlow::PathGraph

import semmle.javascript.dataflow.internal.CallGraphs
import semmle.javascript.dataflow.Nodes


class EvalJavaScriptSink extends DataFlow::ValueNode {
    EvalJavaScriptSink() {
        exists(DataFlow::InvokeNode c |
        exists(string callName | c = DataFlow::globalVarRef(callName).getAnInvocation() |
            callName = "eval"
            or
            callName = "Function"
            or
            callName = "execScript"
            or
            callName = "executeJavaScript"
            or
            callName = "execCommand"
            or
            callName = "setTimeout"
            or
            callName = "setInterval"
            or
            callName = "setImmediate"
        )
        or
        c = DataFlow::globalVarRef("WebAssembly").getAMemberCall(["compile", "compileStreaming"])
        |
        this = c
        )
    }
  }

class FileIOJavaScriptSink extends DataFlow::ValueNode {
    FileIOJavaScriptSink() {
        exists(DataFlow::InvokeNode c |
            c = DataFlow::moduleImport("fs").getAMemberCall(["readFile", "readFileSync", "writeFile", "writeFileSync"])
            |
            this = c
        )
    }
}

class JavaScriptSink extends DataFlow::ValueNode {
    string sinkLabel;

    JavaScriptSink() {
        this instanceof EvalJavaScriptSink and sinkLabel = "CommandInjection" 
        or
        this instanceof FileIOJavaScriptSink and sinkLabel = "ArbitraryFileIO"
    }

    string getSinkLabel() {
        result = sinkLabel
    }
}


from JavaScriptSink sink
select sink, sink.getSinkLabel()