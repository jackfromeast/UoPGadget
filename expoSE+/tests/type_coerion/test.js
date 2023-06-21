const assert = require('assert');

const { _binaryTypeCoercion, _unaryTypeCoercion } = require('/home/ubuntu/ppaeg/expoSE+/analyser/src/type-coercion.js');

describe('_binaryTypeCoercion function', () => {
    it('should coerce + operator correctly', () => {
        const result = _binaryTypeCoercion('+', 'hello', 5);
        assert.strictEqual(result.cor, true);
        assert.strictEqual(result.op1, '');
        assert.strictEqual(result.op2, 'string');
    });

    it('should coerce - operator correctly', () => {
        const result = _binaryTypeCoercion('-', 'hello', 5);
        assert.strictEqual(result.cor, true);
        assert.strictEqual(result.op1, 'number');
        assert.strictEqual(result.op2, '');
    });

    it('should not coerce when types match', () => {
        const result = _binaryTypeCoercion('-', 5, 7);
        assert.strictEqual(result.cor, false);
        assert.strictEqual(result.op1, '');
        assert.strictEqual(result.op2, '');
    });

    it('should coerce && operator correctly', () => {
        const result = _binaryTypeCoercion('&&', 0, 1);
        assert.strictEqual(result.cor, true);
        assert.strictEqual(result.op1, 'boolean');
        assert.strictEqual(result.op2, 'boolean');
    });
});

describe('_unaryTypeCoercion function', () => {
    it('should coerce + operator correctly', () => {
        const result = _unaryTypeCoercion('+', '5');
        assert.strictEqual(result.cor, true);
        assert.strictEqual(result.op1, 'number');
    });

    it('should not coerce when type match', () => {
        const result = _unaryTypeCoercion('-', 5);
        assert.strictEqual(result.cor, false);
        assert.strictEqual(result.op1, '');
    });

    it('should coerce ! operator correctly', () => {
        const result = _unaryTypeCoercion('!', 0);
        assert.strictEqual(result.cor, true);
        assert.strictEqual(result.op1, 'boolean');
    });
});



