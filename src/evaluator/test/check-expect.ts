export function checkExpect<T>(res: T, expected: T) {
    describe('check-expect', () =>  it('', () => expect(res).toEqual(expected)));
}
export function checkExpectMultiple<T, U>(f: (element: T) => U, res: T[], expected: U[]) {
    res.map(function (input, idx) { return checkExpect(f(input), expected[idx]); });
}

checkExpectMultiple(function (x) { return x + 1; }, [1, 2, 3, 4, 5, 6], [2, 3, 4, 5, 6, 7]);
