export abstract class StorableObject {
    constructor(private __STORAGE_KEY: string) {
        console.assert(__STORAGE_KEY != "", "存储键值不能为空！");
    }

    // abstract emptyObject(): any;

    save() {
        localStorage.setItem(this.__STORAGE_KEY, JSON.stringify(this));
    }

    // empty() {
    //     Object.assign(this, this.emptyObject());
    //     this.save();
    // }

    remove() {
        localStorage.removeItem(this.__STORAGE_KEY);
    }
}

export function loadStorableObject<T>(storageKey: string, Cls: new () => T) {
    const newObject = new Cls();
    const savedObject = localStorage.getItem(storageKey);
    if (savedObject) {
        Object.assign(newObject, savedObject);
    }
    return newObject;
}
