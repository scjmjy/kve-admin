import { ObjectId } from "bson";
import mongoose from "mongoose";

export interface CreateRecursivelyOption<DocT> {
    /** 子文档的字段名 */
    field: keyof DocT;
    /** 子文档的 Model */
    model: mongoose.Model<any>;
    /** 子文档是否也包含子文档，默认为 true */
    recursive?: boolean;
    /** 子文档的子文档的选项 */
    opts?: CreateRecursivelyOption<any>[];
}
/**
 * 递归创建文档
 * @param model 父文档的 Model
 * @param docs 父文档
 * @param opts 递归选项：父文档中哪些字段包含子文档以及对应的子文档 Model
 * @returns 
 */
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
