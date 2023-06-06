import javascript
import semmle.javascript.dataflow.Nodes

class KeyVariable extends VarAccess {
  KeyVariable() {
    exists(string keyVarName |
      keyVarName = this.getVariable().getName() and
      isKeyVariable(keyVarName)
    )
  }
}

/**
 * Modify this predicate to define your own list of key variables.
 * this predicate should be overrided in the using query.
 */
predicate isKeyVariable(string varName) {
    varName = ["ast", "buf", "ast.node", "ast.nodes"]
}

class DataFlowNodeIsKeyVariable extends DataFlow::Node {
  DataFlowNodeIsKeyVariable() {
    this.asExpr() = any(KeyVariable keyVar)
  }
}

// from DataFlowNodeIsKeyVariable keyVarNode
// select keyVarNode, "This data flow node is a key variable."
