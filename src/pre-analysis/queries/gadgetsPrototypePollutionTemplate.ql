/**
 * @name PrototypePollutingGadgetTemplate
 * @kind path-problem
 * @problem.severity warning
 * @precision high
 * @id js/prototype-polluting-gadget-zhengyu
 * 
 * revised by Zhengyu Liu
 * 
 * target codebases are template engine
 * Find flows from 
 *    1. any exported functions to undefined property read
 *    2. from undefined property read to eval-like function sink(internal function for silent-spring)
 * 
 * Use multi-labels to track:
 *    1. callflow for nodes within an exported function
 *    2. polluted for nodes that derived from undefined property read
 *    3. receiver for nodes that represent a object that contains an polluted property
 * 
 * 
 * To run this script on different codebase:
 *    1. specific the source code path in line 38
 *    2. set the underfined property name in line 250
 */

 import javascript
 // import DataFlow
 import DataFlow::PathGraph
 import AccessPath::DominatingPaths
 import PrototypePollutingCommon
 import MultiLabelPathNodes
 
 import semmle.javascript.dataflow.internal.CallGraphs
 import semmle.javascript.dataflow.Nodes
 
 predicate underSrcPath(DataFlow::Node n) {
   n.getFile().getAbsolutePath().indexOf("/home/PPAEG/dataset/ppaeg-codeql")=0 and
   // n.getFile().getAbsolutePath().indexOf("/root/ppaeg-dataset/hogan/")=0 and
   not n.getFile().getBaseName().indexOf(".min.") > 0
 }

 predicate undefinedPropertyNames(string propertyName) {
  propertyName = [
    "line"
  ]
}
 
 
 predicate propagationAnArgumentListIncludes(string funcName) {
   funcName = [
     "_toUSVString",
     "StringPrototypeCharAt",
     "StringPrototypeMatch",
     "StringPrototypeReplace",
     "RegExpPrototypeSymbolReplace",
     "RegExpPrototypeTest", 
     "RegExpPrototypeExec",
     "Url"
   ]
 }
 
 predicate propagationArgumentListIncludes(string funcName, int i) {
   i = 0 and funcName = [
     "decodeURIComponent",
     "_domainToASCII",
     "_domainToUnicode",
     "StringPrototypeIncludes",
     "StringPrototypeSplit",
     "StringPrototypeEndsWith",
     "StringPrototypeStartsWith",
     "pathToFileURL",
     "StringPrototypeLastIndexOf",
     "StringPrototypeIndexOf",
     "JSONStringify",
     "createFromString",
     "StringPrototypeToLowerCase", 
     "StringPrototypeToUpperCase",
     "internalModuleReadJSON",
     "RegExpPrototypeToString",
     "DatePrototypeToString",
     "DatePrototypeToISOString",
     "FunctionPrototypeToString",
     "ErrorPrototypeToString"
   ]
   or
   i = 1 and funcName = [
     "StringPrototypeIncludes",
     "StringPrototypeEndsWith",
     "StringPrototypeStartsWith",
     "StringPrototypeLastIndexOf",
     "StringPrototypeIndexOf"
   ]
 }
 
 // manully fill the gap of some functions from the polluted arguments to the function call
 predicate taintPropagationAnArgument(
   DataFlow::Node pred, DataFlow::Node succ, string funcName
 ) {
   exists(DataFlow::InvokeNode call |
     call.getCalleeName() = funcName
     |
     pred = call.getAnArgument() and
     succ = call
   )
 }
 
 // manully fill the gap of some functions from the specific polluted arguments to the function call
 predicate taintPropagationArgument(
   DataFlow::Node pred, DataFlow::Node succ, string funcName, int i
 ) {
   exists(DataFlow::InvokeNode call |
     call.getCalleeName() = funcName
     |
     pred = call.getArgument(i) and
     succ = call
   )
 }
 

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
 
 class ReceiverLabel extends DataFlow::FlowLabel {
   ReceiverLabel() { this = "receiver" }
 }
 
 class PollutedLabel extends DataFlow::FlowLabel {
   PollutedLabel() { this = "polluted" }
 }
 
 class CallFlowLabel extends DataFlow::FlowLabel {
   CallFlowLabel() { this = "callflow" }
 }
 
 string getPropertyNameFromSymbol(DataFlow::PropRead read) {
   exists(DataFlow::InvokeNode invoke |
     read.getPropertyNameExpr().flow().getALocalSource() = invoke and
     invoke.getCalleeName() = "Symbol" and
     result = invoke.getArgument(0).asExpr().getStringValue()
   )
 }
 
 string resolvePropertyName(DataFlow::PropRead read) {
   result = read.getPropertyName() 
   or 
   result = getPropertyNameFromSymbol(read)
 }
 
 
 /**
  * Current Silent Sprint's approach has two stages:
  * 1. from any exported function to polluted property reads
  * 2. from polluted property reads to attack sinks 
  */
 class ConfigurationGDS extends TaintTracking::Configuration {
   ConfigurationGDS() { this = "PrototypePollutingGadgetSimple" }
 
   DataFlow::FunctionNode getAnExportedFunction() {
     exists(DataFlow::FunctionNode f, DataFlow::Node exportedValue |
       exportedValue = any(Module m).getAnExportedValue(_).getALocalSource() and
       (
         f = exportedValue.getAFunctionValue()
         or
         exists(DataFlow::ClassNode c | c = exportedValue |
               (f = c.getAnInstanceMethod() or f = c.getAStaticMethod()) and
               forall(MethodDeclaration m | f.asExpr() = m.getBody() | m.isPublic())
         )
       ) and 
       not f.getFile().getBaseName() = "inspector.js" and
       not f.getFile().getBaseName() = "repl.js" and
       not f.getFile().getBaseName() = "run_main.js" and
       not exists(string funcName | 
         funcName = f.getName() |
         funcName.matches("\\_%") // we assume that only internal functions have a name with the firts character `_`
       ) and
       result = f
     )
   }
 
   /**
    * Select the exported functions defination and use the callflowlabel
    */
   override predicate isSource(DataFlow::Node node, DataFlow::FlowLabel lbl) {
     exists(DataFlow::FunctionNode func | func = node.(DataFlow::FunctionNode) |
       func = getAnExportedFunction()
     ) and 
     lbl instanceof CallFlowLabel
   }

  //  override predicate isSource(DataFlow::Node pred, DataFlow::FlowLabel lbl){
  //   exists(DataFlow::PropRead read |
  //     undefinedPropertyNames(resolvePropertyName(read)) and
  //     // resolvePropertyName(read) = "%PROP%" and
  //     pred.(DataFlow::FunctionNode) = read.getBasicBlock().getContainer().(Function).flow()) and
  //     lbl instanceof CallFlowLabel
  //  }


 
   // predicate isCallFlowStep(DataFlow::FlowLabel lbl) {
   //   lbl instanceof CallFlowLabel
   // }
 
   /**
    * Select the nodes serve as the inter function call's argument and corresponds to the PollutedLabel or ReceiverLabel
    */
   override predicate isSink(DataFlow::Node node, DataFlow::FlowLabel lbl) {
     node instanceof EvalJavaScriptSink
     and 
     (
       lbl instanceof PollutedLabel
       or 
       lbl instanceof ReceiverLabel
     )
   }
 
   DataFlow::Node getAllRecivers(DataFlow::Node node) {
     result = node 
     or
     result = getAllRecivers(node.(DataFlow::PropRead).getBase().getALocalSource())
   }
 
   predicate propagateLabeles(DataFlow::FlowLabel inlbl, DataFlow::FlowLabel outlbl) {
     inlbl instanceof PollutedLabel and outlbl instanceof PollutedLabel
     or
     inlbl instanceof ReceiverLabel and outlbl instanceof ReceiverLabel
   }
 
   override predicate isAdditionalFlowStep(
     DataFlow::Node pred, DataFlow::Node succ, 
     DataFlow::FlowLabel inlbl, DataFlow::FlowLabel outlbl
   ) {
     // append by lzy
     // propagates from the callflow function node to `looped var` in a for-in loop
     // A for-in, for-of or for each-in loop 
     // E.g  for (var key in codeObj.partials) { ... key ... }
     exists(EnhancedForLoop efl | 
       succ = efl.getLValue().flow() and
       // pred = efl.getIterationDomain().flow() and
       pred.(DataFlow::FunctionNode) = efl.getBasicBlock().getContainer().(Function).flow() and 
       inlbl instanceof CallFlowLabel and
       outlbl instanceof PollutedLabel
     )
     or
     exists(DataFlow::PropRead read |
       undefinedPropertyNames(resolvePropertyName(read)) and
       // resolvePropertyName(read) = "%PROP%" and
       pred.(DataFlow::FunctionNode) = read.getBasicBlock().getContainer().(Function).flow() and 
       succ = read and
       inlbl instanceof CallFlowLabel and
       outlbl instanceof PollutedLabel
     )
     or
     exists(string funcName, int i |
       propagationArgumentListIncludes(funcName, i)
       |
       taintPropagationArgument(pred, succ, funcName, i) and
       propagateLabeles(inlbl, outlbl)
     )
     or
     exists(string funcName|
       propagationAnArgumentListIncludes(funcName)
       |
       taintPropagationAnArgument(pred, succ, funcName) and
       propagateLabeles(inlbl, outlbl)
     )
     or
     exists(DataFlow::PropWrite write | 
       pred = write.getRhs() and
       not pred instanceof DataFlow::FunctionNode and
       succ = getAllRecivers(write.getBase().getALocalSource()) and
       (inlbl instanceof PollutedLabel or inlbl instanceof ReceiverLabel) and
       outlbl instanceof ReceiverLabel
     )
     or 
     exists(DataFlow::PropRead read |
       pred = read.getBase() and
       succ = read and
       not exists(resolvePropertyName(read)) and  // so we assume that this property can be the original tainted property
       inlbl instanceof ReceiverLabel and
       outlbl instanceof PollutedLabel
     )
     or
     TaintTracking::sharedTaintStep(pred, succ) and 
     propagateLabeles(inlbl, outlbl)
   }
   // override predicate isAdditionalFlowStep(
   //   DataFlow::Node pred, DataFlow::Node succ, 
   //   DataFlow::FlowLabel inlbl, DataFlow::FlowLabel outlbl
   // ) { 
   //   // propagates from the callflow function node to `looped var` in a for-in loop
   //   // A for-in, for-of or for each-in loop 
   //   // E.g  for (var key in codeObj.partials) { ... key ... }
   //   exists(EnhancedForLoop efl | 
   //       succ = efl.getLValue().flow() and
   //       // pred = efl.getIterationDomain().flow() and
   //       pred.(DataFlow::FunctionNode) = efl.getBasicBlock().getContainer().(Function).flow() and 
   //       inlbl instanceof CallFlowLabel and
   //       outlbl instanceof PollutedLabel
   //     )
   //   or
   //   // propagates from the callflow function node to undefined property read
   //   exists(DataFlow::PropRead read|
   //     undefinedPropertyNames(resolvePropertyName(read)) and
   //     // resolvePropertyName(read) = "%PROP%" and
   //     // assure that the Propread node and pred node are in the same function
   //     pred.(DataFlow::FunctionNode) = read.getBasicBlock().getContainer().(Function).flow() and 
   //     succ = read and
   //     inlbl instanceof CallFlowLabel and
   //     outlbl instanceof PollutedLabel
   //   )
   //   or
   //   // manully fill the gap of some functions from the specific polluted arguments to the function call
   //   exists(string funcName, int i |
   //     propagationArgumentListIncludes(funcName, i)
   //     |
   //     taintPropagationArgument(pred, succ, funcName, i) and
   //     propagateLabeles(inlbl, outlbl)
   //   )
   //   or
   //   // manully fill the gap of some functions from the polluted arguments to the function call
   //   exists(string funcName|
   //     propagationAnArgumentListIncludes(funcName)
   //     |
   //     taintPropagationAnArgument(pred, succ, funcName) and
   //     propagateLabeles(inlbl, outlbl)
   //   )
   //   or
   //   // propogate the written object as receiver
   //   exists(DataFlow::PropWrite write | 
   //     pred = write.getRhs() and
   //     not pred instanceof DataFlow::FunctionNode and
   //     succ = getAllRecivers(write.getBase().getALocalSource()) and
   //     (inlbl instanceof PollutedLabel or inlbl instanceof ReceiverLabel) and
   //     outlbl instanceof ReceiverLabel
   //   )
   //   or 
   //   // a read from receiver propogate from receiver to polluted
   //   exists(DataFlow::PropRead read |
   //     pred = read.getBase() and
   //     succ = read and
   //     not exists(resolvePropertyName(read)) and  // so we assume that this property can be the original tainted property
   //     inlbl instanceof ReceiverLabel and
   //     outlbl instanceof PollutedLabel
   //   )
   //   or
   //   // underSrcPath(pred) and 
   //   // underSrcPath(succ) and
   //   TaintTracking::sharedTaintStep(pred, succ) and
   //   propagateLabeles(inlbl, outlbl)
   
   // }
 
   override predicate isSanitizerEdge(DataFlow::Node pred, DataFlow::Node succ, DataFlow::FlowLabel lbl) {
     // receiver label cannot flow through receiver object to its property read
     exists(DataFlow::PropRead read |
       pred = read.getBase() and
       succ = read and
       lbl instanceof ReceiverLabel
     )
     or
     // ???
     exists(DataFlow::PropRead read, DataFlow::MethodCallNode method |
       method.getReceiver() = read and
       pred = read.getBase() and
       succ = read and
       (lbl instanceof ReceiverLabel or lbl instanceof PollutedLabel)
     )
     or
     super.isSanitizerEdge(pred, succ, lbl)
   }
 
 }
 
 string output(DataFlow::Node node) {
   if  (
         exists(node.(DataFlow::MethodCallNode).getReceiver()) and 
         exists(node.(DataFlow::MethodCallNode).getMethodName())
       )
   then result = node.(DataFlow::MethodCallNode).getReceiver().toString() + "." + node.(DataFlow::MethodCallNode).getMethodName()
   else if (exists(node.(DataFlow::InvokeNode).getCalleeName()))
   then result = node.(DataFlow::InvokeNode).getCalleeName()
   else if (exists(node.(DataFlow::FunctionNode).getName()))
   then result = node.(DataFlow::FunctionNode).getName()
   else result = node.toString() + " [?]"
 }
 
 string outputCsv(DataFlow::Node node) {
   if (exists(node.(DataFlow::MethodCallNode).getMethodName()))
   then result = node.(DataFlow::MethodCallNode).getMethodName()
   else if (exists(node.(DataFlow::InvokeNode).getCalleeName()))
   then result = node.(DataFlow::InvokeNode).getCalleeName()
   else if (exists(node.(DataFlow::FunctionNode).getName()))
   then result = node.(DataFlow::FunctionNode).getName()
   else result = node.toString() + " [?]"
 }
 
 
 from ConfigurationGDS cfg, LabelSourcePathNode source, DataFlow::PathNode sink, DataFlow::InvokeNode sinkInvoke 
 where cfg.hasFlowPath(source, sink)
       and sinkInvoke.getAnArgument() = sink.getNode()
 select  source, source, sink, 
         "$@ (" + source.getNode().getFile().getRelativePath() + ") -> [] -> $@", 
         source.getNode(), outputCsv(source.getNode()),
         sink.getNode(), outputCsv(sinkInvoke)