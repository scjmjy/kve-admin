/**
 * async-validator v4.1.1 报错：
 * ```ts
 * import Schema from "async-validator";
 * const schema = new Schema(xxx); // TypeError: Schema is not a constructor
 * ```
 */
import _Schema from "async-validator";
// @ts-ignore
const Schema = _Schema.default as  typeof _Schema;
export { Schema };
