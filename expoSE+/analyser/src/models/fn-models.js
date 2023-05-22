export default function(state, ctx, model, helpers) {

	const ConcretizeIfNative = helpers.ConcretizeIfNative;
  const symbolicHook = helpers.symbolicHook;

	//TODO: Test IsNative for apply, bind & call
	model.add(Function.prototype.apply, ConcretizeIfNative(Function.prototype.apply));
	model.add(Function.prototype.call, ConcretizeIfNative(Function.prototype.call));
	model.add(Function.prototype.bind, ConcretizeIfNative(Function.prototype.bind));

  model.add(Object.prototype.hasOwnProperty, function(base, args) {
    for (let i = 0; i < args.length; i++) {
      args[i] = state.getConcrete(args[i]);
    }
    return Object.prototype.hasOwnProperty.apply(state.getConcrete(base), args); 
  });

  model.add(Object.prototype.keys, function(base, args) {

    for (let i = 0; i < args.length; i++) {
      args[i] = state.getConcrete(args[i]);
    }

    return Object.prototype.keys.apply(state.getConcrete(base), args);
  });

  // jackfromeast
  model.add(Object.prototype.toString, symbolicHook(
    Object.prototype.toString,
    (base, _a) => state.isSymbolic(base) && typeof(state.getConcrete(base)) === "object",
    (base, _a, result) => {
      if (state.isSymbolic(base)) {
        return new ConcolicValue(base.toString(), ctx.mkString('[object Object]'));
      }else{
        return base.toString();
      }
  }
  ));

  model.add(Object.assign, (base, args) => {
    return Object.assign.call(base, state.getConcrete(args[0]), state.getConcrete(args[1]));
  });

  model.add(Array.isArray, (base, args) => {
    return Array.isArray.call(base, state.getConcrete(args[0]));
  });
 
  model.add(console.log, function(base, args) {

    for (let i = 0; i < args.length; i++) {
      args[i] = state.getConcrete(args[i]);
    }

		console.log.apply(base, args);
	});
}
