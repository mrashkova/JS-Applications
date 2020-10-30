let {addFive, subtractTen, sum} = require('./mathEnforcer');
let {assert} = require('chai');

describe('MathEnforcer', () => {
    it('Should return undefined with incorrect type', () => {
        assert.equal(undefined, addFive('Pesho'));
    })

    it('Should return correct number', () => {
        assert.equal(10, addFive(5));
    })

    describe('substractTen', () => {
        it('Should return undefined with incorrect type', () => {
            assert.equal(undefined, subtractTen('Pesho'));
        })

        it('Should return correct number', () => {
            assert.equal(0, subtractTen(10));
        })

        describe('sum', () => {
            it('Should return undefined with incorrect type', () => {
                assert.equal(undefined, sum(5, 'Pesho'));
            })

            it('Should return undefined with incorrect type', () => {
                assert.equal(undefined, sum('Pesho', 5));
            })
    
            it('Should return correct sum', () => {
                assert.equal(10, sum(5, 5));
            })
        })
    })   
})
