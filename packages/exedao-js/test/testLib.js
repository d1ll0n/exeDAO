const {expect} = require('chai');
const {votesNeeded} = require('../src/lib');

describe('exedao.js lib', () => {
  it('Should calculate votes needed for basic majority', () => {
    const yes = 24;
    const no = 25;
    const calculated = votesNeeded('1', 51, yes, no);
    expect(calculated).to.eql(2);
  })

  it('Should calculate votes needed for absolute majority', () => {
    const yes = 24;
    const total = 51;
    const calculated = votesNeeded('2', total, yes, 0);
    expect(calculated).to.eql(2);
  })

  it('Should calculate votes needed for super majority', () => {
    const yes = 66;
    const total = 100;
    const calculated = votesNeeded('3', total, yes, 0);
    expect(calculated).to.eql(1);
  })

  it('Should calculate votes needed for ultra majority', () => {
    const yes = 90;
    const total = 100;
    const calculated = votesNeeded('4', total, yes, 0);
    expect(calculated).to.eql(1);
  })
})