import { replaceItem, flow } from '../src/utils'
import { expect } from 'chai'

describe('utils.js', () => {
  describe('#replaceItem', () => {
    context('normal case', () => {
      it('return new array with replacement', () => {
        const result = replaceItem([ 'a', 'b', 'c' ], 1, 'foobar')

        expect(result).to.eql([ 'a', 'foobar', 'c' ])
      })
    })

    context('with non array', () => {
      it('throw error', () => {
        expect(() =>
          replaceItem(null, 1, 'foobar')
        ).to.throw(TypeError, /Target is not array/)
      })
    })

    context('with index out of length', () => {
      it('throw error', () => {
        expect(() =>
          replaceItem([ 'a', 'b', 'c' ], 3, 'foobar')
        ).to.throw(RangeError, /Target is not allow/)
      })
    })
  })

  describe('#flow', () => {
    context('with multiple functions in array', () => {
      it('returns accumulation result from first function to last', () => {
        const add3 = number => number + 3
        const add2 = number => number + 2

        const result = flow([ add3, add2 ])(1)
        expect(result).to.equal(6)
      })
    })
  })
})
