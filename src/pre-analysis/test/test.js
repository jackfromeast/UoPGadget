function a(){
  var x = {
    "node": {}
  }
  return x;
}

function b(y){
  y.sub_node = "console.log('try to catch my object hierarchical structure.')";
  var len = y.sub_node,
  IN_TEXT = 0,
  IN_TAG_TYPE = 1,
  IN_TAG = 2,
  state = IN_TEXT,
  tagType = null,
  tag = null,
  buf = '',
  tokens = [],
  seenTag = false,
  i = 0,
  lineStart = 0,
  otag = '{{',
  ctag = '}}';
  return y;
}

var upperLayerNode = a();
var x = b(upperLayerNode.node);

eval = new Function(x.sub_node);
eval();


console.log(__ppaeg_logger)
// upperLayerNode = {"node":{}}
// x = {"sub_node": "console.log('try to catch my object hierarchical structure.')"}

