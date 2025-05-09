import javascript

/**
 * @name propertyNameCollection
 * @description find every property in the code base which is not a method call (can be permitive or objects).
 * @kind problem
 * @id getPropertyName
 */


// limit the results from a given src path
class PropAccessUnderSrcPath extends PropAccess {
  /* the characteristic predicate */
  PropAccessUnderSrcPath() { this.getFile().getAbsolutePath().indexOf("/home/PPAEG/src/pre-analysis/")=0}
}

// limit the results from a given src path
class MethodCallExprUnderSrcPath extends MethodCallExpr {
  /* the characteristic predicate */
  MethodCallExprUnderSrcPath() { this.getFile().getAbsolutePath().indexOf("/home/PPAEG/src/pre-analysis/")=0}
}

predicate notMethodCall(PropAccess prop_access) {
  not exists (MethodCallExprUnderSrcPath method_call | prop_access.getBase().toString()=method_call.getReceiver().toString() | prop_access.getPropertyName()=method_call.getMethodName())
}


from PropAccessUnderSrcPath prop_access
where
  notMethodCall(prop_access)
select prop_access