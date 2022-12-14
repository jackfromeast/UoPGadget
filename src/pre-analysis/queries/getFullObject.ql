import javascript
// import DataFlow::PathGraph

/**
 * @name getFullObject
 * @description log every property reference and its base expression
 * @kind problem
 * @id getFullObject
 */


// // limit the results from a given src path
// class PropAccessUnderSrcPath extends PropAccess {
//   /* the characteristic predicate */
//   PropAccessUnderSrcPath() { this.getFile().getAbsolutePath().indexOf("/home/PPAEG/src/pre-analysis/")=0}
// }

// // limit the results from a given src path
// class MethodCallExprUnderSrcPath extends MethodCallExpr {
//   /* the characteristic predicate */
//   MethodCallExprUnderSrcPath() { this.getFile().getAbsolutePath().indexOf("/home/PPAEG/src/pre-analysis/")=0}
// }

predicate underSrcPath(DataFlow::Node n) {
    n.getFile().getAbsolutePath().indexOf("/home/PPAEG/src/pre-analysis/")=0
}

predicate notMethodCall(DataFlow::PropRef prop_ref) {
  not exists (DataFlow::MethodCallNode method_call | prop_ref.getPropertyName()=method_call.getMethodName())
}

// TODO: limit the finding inside the function call graph of render/compiler
from DataFlow::PropRef prop_ref
where 
  notMethodCall(prop_ref) and 
  underSrcPath(prop_ref)
// get the prop_ref's base, prop_ref, its statement's endline, its function's endline
// this would exclude the property which not inside a function
select prop_ref, "$@---$@---$@---$@", prop_ref, prop_ref.getBase().toString(), prop_ref, prop_ref.toString(), prop_ref, prop_ref.getEnclosingExpr().getEnclosingStmt().getLocation().getEndLine().toString(), prop_ref, prop_ref.getEnclosingExpr().getEnclosingFunction().getLocation().getEndLine().toString()


// select prop_ref, "$@:$@", prop_ref, prop_ref.getBase().toString(), prop_ref, prop_ref.toString()
// select prop_ref, prop_ref.getEnclosingExpr().getEnclosingStmt().toString()