import bcrypt from "bcryptjs";
import mongoose from "mongoose";

export interface BcryptPluginOptions {
    field?: string;
    fields?: string[];
    rounds?: number;
}

export function BcryptPlugin(schema: mongoose.Schema, options: BcryptPluginOptions) {
    options = options || {};

    // Get array of encrypted field(s)
    const fields: string[] = [];
    if (options.field) {
        fields.push(options.field);
    } else if (options.fields) {
        fields.push(...options.fields);
    }

    // Scan schema for fields marked as encrypted
    schema.eachPath(function (name, type) {
        if (type.options.bcrypt && fields.indexOf(name) < 0) {
            fields.push(name);
        }
    });

    // Use default 'password' field if no fields specified
    if (fields.length === 0) fields.push("password");

    // Get encryption rounds or use defaults
    const rounds = options.rounds || 0;

    // Add properties and verifier functions to schema for each encrypted field
    fields.forEach(function (field) {
        // Setup field name for camelcasing
        const path = field.split(".");
        const fieldName = path
            .map(function (word) {
                return word[0].toUpperCase() + word.slice(1);
            })
            .join("");

        // Define encryption function
        schema.statics["encrypt" + fieldName] = function (value, cb) {
            return encrypt(field, value, cb);
        };

        // Define async verification function
        schema.methods["verify" + fieldName] = function (value: string, cb: (err: any, valid: boolean) => void) {
            if (Promise) {
                const self = this;
                return new Promise(function (resolve, reject) {
                    bcrypt.compare(value, self.get(field), function (err, valid) {
                        if (cb) {
                            cb(err, valid);
                        }
                        if (err) {
                            reject(err);
                        } else {
                            resolve(valid);
                        }
                    });
                });
            } else {
                return bcrypt.compare(value, this.get(field), cb);
            }
        };

        // Define sync verification function
        schema.methods["verify" + fieldName + "Sync"] = function (value: string) {
            return bcrypt.compareSync(value, this.get(field));
        };

        // Add field to schema if not already defined
        if (!schema.path(field)) {
            const pwd = {} as any;
            let nested = pwd;
            for (let i = 0; i < path.length - 1; ++i) {
                nested[path[i]] = {};
                nested = nested[path[i]];
            }
            nested[path[path.length - 1]] = { type: String };
            schema.add(pwd);
        }
    });

    // Hash all modified encrypted fields upon saving the model
    schema.pre("save", function (next) {
        const model = this;
        const changed: string[] = [];

        // Determine list of encrypted fields that have been modified
        fields.forEach(function (field) {
            if (model.isModified(field)) {
                changed.push(field);
            }
        });

        // Create/update hash for each modified encrypted field
        let count = changed.length;
        if (count > 0) {
            changed.forEach(function (field) {
                const value = model.get(field);
                if (typeof value === "string") {
                    encrypt(field, value, function (err, hash) {
                        if (err) return next(err);
                        model.set(field, hash);
                        if (--count === 0) next();
                    });
                } else {
                    model.set(field, "");
                    if (--count === 0) next();
                }
            });
        } else {
            next();
        }
    });

    function getUpdateField(update: any, name: string) {
        if (update.hasOwnProperty(name)) {
            return update[name];
        }
        if (update.$set && update.$set.hasOwnProperty(name)) {
            return update.$set[name];
        }
        return undefined;
    }

    function setUpdateField(update: any, name: string, value: string) {
        if (update.hasOwnProperty(name)) {
            update[name] = value;
        } else if (update.$set && update.$set.hasOwnProperty(name)) {
            update.$set[name] = value;
        }
    }

    schema.pre(["update", "updateOne", "updateMany", "findOneAndUpdate"], function (next) {
        const query = this;
        const update = query.getUpdate();
        const changed: string[] = [];
        fields.forEach(function (field) {
            if (getUpdateField(update, field) !== undefined) {
                changed.push(field);
            }
        });
        let count = changed.length;
        if (count > 0) {
            changed.forEach(function (field) {
                const value = getUpdateField(update, field);
                if (typeof value === "string") {
                    encrypt(field, value, function (err, hash) {
                        if (err) {
                            return next(err);
                        }
                        setUpdateField(update, field, hash!);
                        if (--count === 0) {
                            next();
                        }
                    });
                } else {
                    setUpdateField(update, field, "");
                    if (--count === 0) {
                        next();
                    }
                }
            });
        } else {
            next();
        }
    });

    schema.pre("insertMany", function (next: any, documents: any) {
        documents.forEach(function (document: any, idx: any, thisArr: any) {
            var changed: string[][] = [];
            var lastIdx = thisArr.length - 1;
            var isLastDocument = idx === lastIdx;

            // Determine list of encrypted fields that have been modified
            fields.forEach(function (field) {
                const splitField = field.split(".");
                // we are concerned only about the leftmost part
                if (document.hasOwnProperty(splitField[0])) {
                    changed.push(splitField);
                }
            });

            // Create/update hash for each modified encrypted field
            var count = changed.length;
            if (count > 0) {
                changed.forEach(function (splitField: string[]) {
                    var value: any;
                    var nestedObjWithValue: any;
                    var lastField: string = "";
                    var originalField = splitField.join(".");

                    splitField.forEach(function (field, idx, thisArr) {
                        const lastIdx = thisArr.length - 1;
                        value = value ? value[field] : document[field];
                        lastField = field;
                        if (idx < lastIdx) nestedObjWithValue = value;
                    });

                    nestedObjWithValue = nestedObjWithValue ? nestedObjWithValue : document;

                    if (typeof value === "string") {
                        encrypt(originalField, value, function (err, hash) {
                            if (err) return next(err);
                            nestedObjWithValue[lastField] = hash;
                            if (--count === 0 && isLastDocument) next();
                        });
                    } else {
                        nestedObjWithValue[lastField] = "";
                        if (--count === 0 && isLastDocument) next();
                    }
                });
            } else {
                next();
            }
        });
    });

    function encrypt(field: string, value: string, cb: (err: any, hash?: string) => void) {
        if (Promise) {
            return new Promise(function (resolve, reject) {
                bcrypt.genSalt(schema.path(field).options.rounds || rounds, function (err, salt) {
                    if (cb && err) {
                        cb(err, salt);
                    }
                    if (err) {
                        reject(err);
                    } else {
                        bcrypt.hash(value, salt, function (err, result) {
                            if (cb) {
                                cb(err, result);
                            }
                            if (err) {
                                reject(err);
                            } else {
                                resolve(result);
                            }
                        });
                    }
                });
            });
        } else {
            bcrypt.genSalt(schema.path(field).options.rounds || rounds, function (err, salt) {
                if (err) {
                    cb(err);
                } else {
                    bcrypt.hash(value, salt, cb);
                }
            });
        }
    }
}
