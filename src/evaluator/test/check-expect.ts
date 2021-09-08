"use strict";

export function checkExpect(res, expected) {
    describe('check-expect', () =>  it('', () => expect(res).toEqual(expected)));
}
export function checkExpectMultiple(f, res, expected) {
    res.map(function (input, idx) { return checkExpect(f(input), expected[idx]); });
}

checkExpectMultiple(function (x) { return x + 1; }, [1, 2, 3, 4, 5, 6], [2, 3, 4, 5, 6, 7]);
