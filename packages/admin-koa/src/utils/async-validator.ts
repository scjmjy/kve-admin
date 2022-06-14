/**
 * async-validator v4.1.1 在 ESM 下报错：
 * ```js
 * import Schema from "async-validator";
 * const schema = new Schema(xxx); // TypeError: Schema is not a constructor
 * ```
 */
import _Schema from "async-validator";
// @ts-ignore
const Schema = (_Schema.default ? _Schema.default : _Schema) as  typeof _Schema;
export { Schema };
