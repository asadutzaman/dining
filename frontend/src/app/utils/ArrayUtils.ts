export default class ArrayUtils {
    public arrayHasItems = (arr: any) => {
        return Array.isArray(arr) && arr.length > 0;
    }

    public removeItem = <T>(arr: T[], value: any): T[] => {
        let i = 0;
        while (i < arr.length) {
            if (arr[i] === value) {
                arr.splice(i, 1);
            } else {
                ++i;
            }
        }
        return arr;
    };

    public removeAtIndex = <T extends any>(
        array: T[],
        index: number
    ): T[] => {
        return [...array.slice(0, index), ...array.slice(index + 1)];
    };

    public getUnique = <T>(arr: T[]): T[] => arr.filter((v, i, a) => a.indexOf(v) === i);

    public getArrayOfSize = (size: number): any[] => [...Array(size)];

    public getArrayOfLength = (length: number) => [...Array(length)].map((e, i) => i);

    public getMinValue<T>(array: T[]) {
        return array.reduce(function(prev, curr) {
            return prev < curr ? prev : curr;
        });
    }

    public getMaxValue<T>(array: T[]) {
        return array.reduce(function(prev, curr) {
            return prev > curr ? prev : curr;
        });
    }
}
