let assert = require('chai').assert;
let {isOddOrEven} = require('./isOddOrEven');

describe ('Is odd or even', () => {
    it ('Should return undefiend with param different from string',() => {
        assert.equal(undefined, isOddOrEven(5))
    })

    it ('Should return undefiend with param different from object',() => {
        assert.equal(undefined, isOddOrEven({}))
    })

    it ('Should return even',() => {
        assert.equal('even', isOddOrEven('word'))
    })

    it ('Should return odd',() => {
        assert.equal('odd', isOddOrEven('words'))
    })
})