/**
 * @kind path-problem
 */

import javascript
import semmle.javascript.security.dataflow.CodeInjectionCustomizations::CodeInjection
import DataFlow::PathGraph

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
class CustomEvalJavaScriptSink extends DataFlow::ValueNode {
  DataFlow::ValueNode t;
  DataFlow::InvokeNode c;

  CustomEvalJavaScriptSink() {
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

/**
 * An `ObjectLiteralNode` not overriding its `__proto__`, `constructor` and
 * `constructor.prototype` properties.
 *
 * It is not set as sanitizer since flow between two same source-sink AST nodes
 * may differ (i.e., one path in source-sink flow may not pass through this
 * property writes)
 */
class BadIfPollutedSource extends DataFlow::ObjectLiteralNode {
  BadIfPollutedSource() {
    not exists(DataFlow::PropWrite propWrite |
      // ObjectLiteralNode.__proto__ and ObjectLiteralNode.constructor
      exists( |
        propWrite.getPropertyName() = ["__proto__", "constructor"] and
        propWrite.getBase().getALocalSource() = this
      )
      or
      // ObjectLiteralNode.constructor.prototype
      exists(DataFlow::PropRead constRead |
        constRead.getPropertyName() = "constructor" and
        constRead.getBase().getALocalSource() = this and
        propWrite.getPropertyName() = "prototype" and
        propWrite.getBase().getALocalSource() = constRead
      ) and
      propWrite.getRhs().asExpr() instanceof NullLiteral
    )
  }
}

class BadIfPollutedConfig extends TaintTracking::Configuration {
  BadIfPollutedConfig() { this = "BadIfPollutedConfig" }

  /**
   * An `ObjectLiteralNode` that does not set a custom prototype
   * on its declaration or flow.
   *
   * See `BadIfPollutedSource`.
   */
  override predicate isSource(DataFlow::Node source) { source instanceof BadIfPollutedSource }

  /**
   * An expression which may be evaluated as JavaScript.
   *
   * See `CustomEvalJavaScriptSink`.
   */
  override predicate isSink(DataFlow::Node sink) { sink instanceof CustomEvalJavaScriptSink }

  /**
   * Make a valid taint step: `a = {} -> Object.create(a)`.
   */
  override predicate isAdditionalTaintStep(DataFlow::Node nodeFrom, DataFlow::Node nodeTo) {
    exists(DataFlow::InvokeNode objectCreate |
      objectCreate = DataFlow::globalVarRef("Object").getAMemberCall("create") and
      nodeFrom = objectCreate.getArgument(0) and
      nodeTo = objectCreate
    )
  }

  /**
   * `foo || BadIfPollutedSource` -> `foo` holds a non (not defined|null|false) value
   *  and so it will be assigned instead of `BadIfPollutedSource`.
   *
   * FP issue: `foo` may be declared out of taint tracking's scope.
   *
   * `leftSource = orExpr.getLeftOperand()`: when a node's local source is itself
   * means the node might not be defined in the scope.
   */
  override predicate isSanitizer(DataFlow::Node sanitizer) {
    exists(LogOrExpr orExpr, Expr leftSource |
      leftSource = orExpr.getLeftOperand().flow().getALocalSource().asExpr() and
      not leftSource = orExpr.getLeftOperand() and
      not leftSource instanceof NullLiteral and
      not orExpr.getLeftOperand().mayHaveBooleanValue(false) and
      sanitizer.asExpr() = orExpr.getRightOperand()
    )
  }
}

from BadIfPollutedConfig cfg, DataFlow::PathNode source, DataFlow::PathNode sink
where cfg.hasFlowPath(source, sink)
select sink.getNode(), source, sink, "$@ flows to $@ as $@", source.getNode(), "This object",
  sink.getNode().(CustomEvalJavaScriptSink).getCall(), "this eval-alike call", sink.getNode(),
  sink.toString()

