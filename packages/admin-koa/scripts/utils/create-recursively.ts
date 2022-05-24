import { ObjectId } from "bson";
import mongoose from "mongoose";

export interface CreateRecursivelyOption<DocT> {
    field: keyof DocT;
    model: mongoose.Model<any>;
    /** 是否递归，默认为 true */
    recursive?: boolean;
    opts?: CreateRecursivelyOption<any>[];
}

export async function createRecursively<DocT>(
    model: mongoose.Model<DocT>,
    docs: any[],
    opts: CreateRecursivelyOption<DocT>[],
) {
    const ids: ObjectId[] = [];
    for (const doc of docs) {
        for (const opt of opts) {
            if (opt.field in doc) {
                let value = doc[opt.field];
                if (Array.isArray(value)) {
                    if (opt.recursive === false) {
                        doc[opt.field] = (await opt.model.create(value)).map((item: any) => item._id);
                    } else {
                        doc[opt.field] = await createRecursively(opt.model, value, opt.opts || opts);
                    }
                } else {
                    if (opt.recursive === false) {
                        doc[opt.field] = (await opt.model.create(value))._id;
                    } else {
                        const ids = await createRecursively(opt.model, [value], opt.opts || opts);
                        doc[opt.field] = ids[0];
                    }
                }
            }
        }
        const res = await model.create(doc);
        ids.push(res._id);
    }
    return ids;
}
