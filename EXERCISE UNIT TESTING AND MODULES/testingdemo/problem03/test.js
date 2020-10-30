let {assert} = require('chai');
let {lookupChar} = require('./charLookup');

// let assert = require('chai').assert;
// let app = require('./charLookup');
// app.lookupChar;

describe('charLookup', () => {
    it ('Should return undefiend with incorrect first param', () => {
        assert.equal(undefined, lookupChar(5, 0));
    }) 

    it ('Should return undefiend with incorrect second param', () => {
        assert.equal(undefined, lookupChar('pesho', 'gosho'));
    }) 

    it ('Should return incorrect index with incorrect first param length', () => {
        assert.equal('Incorrect index', lookupChar('pesho', 5));
    })

    it ('Should return incorrect index with  second first param lower than 0', () => {
        assert.equal('Incorrect index', lookupChar('pesho', -1));
    })

    it ('Should return correct charecter', () => {
        assert.equal('a', lookupChar('Stamat', 2));
    })
})