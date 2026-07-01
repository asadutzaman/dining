export default class EnumUtils {
    public getEnumKeys<T>(enumObject: T): string[] {
        const retArray = new Array<string>();
        Object.keys(enumObject as any)
            .filter((key) => isNaN(Number(key)))
            .forEach((key) => {
                retArray.push(key);
            });
        return retArray;
    }

    public getEnumKeyByValue<T extends { [index: string]: string | number }>(enumObject: T, value: string | number): keyof T | null {
        const keys = Object.keys(enumObject) as Array<keyof T>;

        for (const key of keys) {
            if (enumObject[key] === value) {
                return key;
            }
        }

        return null;
    }

    public getEnumValues<T>(enumObject: any): T[keyof T][] {
        const retArray = this.getEnumKeys(enumObject).map((key: string) => enumObject[key]);
        return retArray;
    }

    public convertEnumToList<T>(enumObject: any): { key: any; value: string }[] {
        return Object.keys(enumObject as any).map((key) => ({
            key,
            value: enumObject[key],
        }));
    }
}
