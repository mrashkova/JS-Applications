let {assert} = require('chai');
let StringBuilder = require('./stringBuilder');

describe('StringBuilder', () => {
    let sb;
    beforeEach(() => {
        sb = new StringBuilder();
    })

    describe('verifyParams', () => {
        it ('Should throw exception when param is not a string', () => {
            assert.throw(() => {
                new StringBuilder({});
            }, 'Argument must be string')
        })
    })

    describe('constructo', () => {
        it ('should work properly without argument', () => {
            assert.equal('', sb.toString());
        })

        it ('Should work properly with argument', () => {
            sb = new StringBuilder('pesho');

            assert.equal('pesho', sb.toString());
        })
    })

    describe('append', () => {
        it ('Should append string after the text', () => {
            sb.append('pesho')
            assert.equal('pesho', sb.toString())
        })
    })

    describe('prepend', () => {
        it ('Should append text at the start of a string', () => {
            sb.append('pesho')
            assert.equal('pesho', sb.toString())
        })
    })

    describe('insertAt', () => {
        it ('Should insert text at index', () => {
            sb.append('psho')
            sb.insertAt('e', 1)
            assert.equal('pesho', sb.toString())
        })
    })

    describe('remove', () => {
        it ('Should remove text from index to length', () => {
            sb.append('pesho')
            sb.remove(0, 1)
            assert.equal('esho', sb.toString())
        })
    })

    describe('toString', () => {
        it ('Should return correct string', () => {
            sb.append('pesho')
            assert.equal('pesho', sb.toString())
        })
    })
})