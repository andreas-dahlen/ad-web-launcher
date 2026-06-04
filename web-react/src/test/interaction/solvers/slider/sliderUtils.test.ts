import { describe, expect, it } from 'vitest';
// import { createSliderInput } from '@test/fixtures/input';
// import { sliderSolver } from '@interaction/solvers/sliderSolver/sliderSolver';
import { createBaseWithAxis1D } from '@test/fixtures/base';
import { createSliderData } from '@test/fixtures/data';
import { sliderUtils } from '@interaction/solvers/sliderSolver/sliderUtils';

describe('SliderUtils', () => {

  describe('normalize', () => {

    describe('normalize', () => {
      function createNormalizeSliderInput() {
        const base = createBaseWithAxis1D()
        const data = createSliderData()
        const delta = { x: 0, y: 0 }

        return sliderUtils.normalize(base, data, delta)
      }
      it('returns valid mainSize', () => {
        const result = createNormalizeSliderInput()
        expect(typeof result.mainSize).toBe('number')
      })
      it('returns valid crossSize', () => {
        const result = createNormalizeSliderInput()
        expect(typeof result.crossSize).toBe('number')
      })
      it('returns valid thumbSize', () => {
        const result = createNormalizeSliderInput()
        expect(typeof result.mainThumbSize).toBe('number')
      })
      it('returns valid thumbSize', () => {
        const result = createNormalizeSliderInput()
        expect(typeof result.mainThumbSize).toBe('number')
      })
    })

    describe('resolveStart', () => {

    })
  })
})




// import { describe, expect, it } from 'vitest';
// import { createSliderInput } from '@test/fixtures/input';
// import { sliderSolver } from '@interaction/solvers/sliderSolver/sliderSolver';

// describe('SliderSolver', () => {

//   describe('functions', () => {
//     it('confirms that all functions exist', () => {
//       expect(sliderSolver.swipeStart).toBeDefined()
//       expect(sliderSolver.swipe).toBeDefined()
//       expect(sliderSolver.swipeCommit).toBeDefined()
//       expect(sliderSolver.press).toBeDefined()
//     })
//     it('confirms that some functions does NOT exist', () => {
//       expect(sliderSolver.pressCancel).not.toBeDefined()
//       expect(sliderSolver.pressRelease).not.toBeDefined()
//       expect(sliderSolver.swipeRevert).not.toBeDefined()
//     })
//   })
//   describe('Press', () => {
//     it('')
//   })
// })