var assert = require('assert');
const Spline = require('../../utils/Spline');

describe('Testing Spline functionality', function () {
    const sp = new Spline([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], [10, 20, 30, 40, 50, 60, 70, 80, 90, 100]);
    describe('Should interpolate correctly', () => {
        it('should return expected y target', function () {
            assert.equal(sp.FindYof(1), 10);
            assert.equal(sp.FindYof(5), 50);
            assert.equal(sp.FindYof(2.5), 25);
        });
        it('should work at higher rate as expected', function () {
            for (let i = 1; i < 100; i++) {
                assert.equal(typeof sp.FindYof(i * 0.1), 'number');
            }
        });
    })
});