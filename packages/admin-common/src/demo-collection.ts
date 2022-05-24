import { omit } from "lodash";
import { IBase, ValidatorRules } from "./utils";

export interface IDemoCollection extends IBase {
    field1: number;
    field2: string;
    field3: number[];
    field4: string[];
    inlineFile?: GridFsFile;
    inlineFileList?: GridFsFile[];
    gridFsFile?: GridFsFile;
    gridFsFileList?: GridFsFile[];
}

export const FindDemoCollectionProjection = [
    "_id",
    "field1",
    "field2",
    "field3",
    "field4",
    "createdAt",
    "updatedAt",
] as const;

type FindDemoCollectionKeys = typeof FindDemoCollectionProjection[number];

export type DemoCollectionFilter = Extract<keyof IDemoCollection, "field1" | "field2" | "createdAt">;
export type FindDemoCollectionParams = PaginationParams<DemoCollectionFilter>;
export type FindDemoCollectionResult = PaginationResult<Pick<IDemoCollection, FindDemoCollectionKeys>>;

export interface CreateDemoCollectionBody
    extends Pick<
        IDemoCollection,
        "field1" | "field2" | "field3" | "field4" | "inlineFile" | "inlineFileList" | "gridFsFile" | "gridFsFileList"
    > {}
export interface UpdateDemoCollectionBody extends CreateDemoCollectionBody, Pick<IBase, "_id"> {}

export function getUpdateDemoCollRules(): ValidatorRules<UpdateDemoCollectionBody> {
    return {
        _id: {
            required: true,
            len: 24,
            message: "请提供正确的文档 ID！",
        },
        field1: {
            required: true,
            type: "number",
            message: "field1 不能为空，且为数字！",
        },
        field2: {
            required: true,
            message: "field2 不能为空！",
        },
        field3: {
            required: false,
            type: "array",
            message: "field3 为数组类型！",
        },
        field4: {
            required: true,
            type: "array",
            message: "field4 为数组类型！",
        },
    };
}

export function getCreateDemoCollRules(): ValidatorRules<CreateDemoCollectionBody> {
    return omit(getUpdateDemoCollRules(), ["_id"]);
}
