export default class ObjectUtils {
    public isObject = (val: any): boolean => {
        return val != null && typeof val === 'object' && Array.isArray(val) === false;
    }

    public isEmptyObject = (obj: any): boolean => {
        return !Object.keys(obj).length;
    }

    public objectClone = (obj: object): any[] => {
        return JSON.parse(JSON.stringify(obj))
    }

    // public objectArrayClone = (obj) => {
    //     return obj.map(item => { return { ...item } })
    // }

    public compare = (obj1: any, obj2: any) => {
        return JSON.stringify(obj1) === JSON.stringify(obj2);
    }

    public arrayToObject = (array: Array<any>) => {
        array.reduce((obj, item) => {
            (obj as any)[item.id] = item;
            return obj;
        }, {}
        );
    }

    public removeEmptyOfObject = (obj: any): any => {
        if (typeof obj === "object") {
            for (let [key, value] of Object.entries(obj)) {
                if (value != null && value !== '' && value !== undefined) delete obj[key];
                else if (typeof value === "object") this.removeEmptyOfObject(value);
            }
        }
    }

    public removeNullOfObject = (obj: any) => {
        if (typeof obj === "object") {
            for (let [key, value] of Object.entries(obj)) {
                if (value === null) delete obj[key];
                else if (typeof value === "object") this.removeNullOfObject(value);
            }
        }
    }

    public removeUndefinedOfObject(obj: any): any {
        if (typeof obj === "object") {
            for (let [key, value] of Object.entries(obj)) {
                if (value === undefined) delete obj[key];
                else if (typeof value === "object") this.removeUndefinedOfObject(value);
            }
        }
    }

    public deleteKeysFromObject(object: any, keysToDelete: string[]): any {
        const clonedObject = Object.assign({}, object)
        keysToDelete.forEach(key => delete clonedObject[key])
        return clonedObject
    }

    public getObjectKeys = (object: any): any[] => {
        const result: any[] = []
        for (const k of object) {
            result.push(k)
        }
        return result
    }

    // public pick = (obj: any, keys: any) => {
    //     const result = keys.map(k => k in obj ? { [k]: obj[k] } : {})
    //         .reduce((res, o) => Object.assign(res, o), {});
    //     return result;
    // }

    // public pickArray = (arrayObj: any, keys: any) => {
    //     const result: any[] = []
    //     for (const obj of arrayObj) {
    //         const pickObj = this.pick(obj, keys);
    //         result.push(pickObj)
    //     }
    //     return result
    // }

    public exclude = (obj: any, keys: any) => {
        return Object.keys(obj)
            .filter(k => !keys.includes(k))
            .map(k => Object.assign({}, { [k]: obj[k] }))
            .reduce((res, o) => Object.assign(res, o), {});
    }
}

