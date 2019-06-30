/* const {expect} = require('chai');
const {votesNeeded} = require('../src/lib');

describe('exedao.js lib', () => {
  it('Should calculate votes needed for basic majority', () => {
    const yes = 24;
    const calculated = votesNeeded(50, 51, yes);
    expect(calculated).to.eql(2);
  })

  it('Should calculate votes needed for super majority', () => {
    const total = 100;
    const calculated = votesNeeded(66, total, 50);
    expect(calculated).to.eql(17);
  })

  it('Should calculate votes needed for ultra majority', () => {
    const yes = 90;
    const total = 100;
    const calculated = votesNeeded(90, total, 90);
    expect(calculated).to.eql(1);
  })
})
 */