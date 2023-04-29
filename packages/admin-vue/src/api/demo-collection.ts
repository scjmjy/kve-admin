import { AxiosPromise, AxiosResponse } from "axios";
import {
    CreateDemoCollectionBody,
    CreateResult,
    FindDemoCollectionParams,
    FindDemoCollectionResult,
    IDemoCollection,
    UpdateDemoCollectionBody,
} from "admin-common";
import { UploadUserFile, genFileId } from "element-plus";
import { makeFormData, parseFormData, FormDataOptions, request } from "./request";

export function getDemoCollectionList(params: FindDemoCollectionParams): AxiosPromise<FindDemoCollectionResult> {
    return request({
        method: "POST",
        url: "/api/demo-collection/list",
        data: params,
    });
}

const demoFormDataOpts: FormDataOptions<CreateDemoCollectionBodyVue> = {
    inlineFile: {
        inline: true,
    },
    inlineFileList: {
        inline: true,
        array: true,
    },
    gridFsFile: {
        useKeyAsName: true,
    },
    gridFsFileList: {
        array: true,
        useKeyAsName: true,
    },
};

export async function getDemoCollection(id: string): Promise<AxiosResponse<UpdateDemoCollectionBodyVue, any>> {
    const res = (await request({
        method: "GET",
        url: "/api/demo-collection/" + id,
    })) as AxiosResponse<IDemoCollection>;
    const data: UpdateDemoCollectionBodyVue = parseFormData(res.data, demoFormDataOpts);
    return {
        ...res,
        data,
    };
}

export interface CreateDemoCollectionBodyVue extends Omit<CreateDemoCollectionBody, "inlineFile" | "gridFsFile"> {
    inlineFile: UploadUserFile[];
    gridFsFile: UploadUserFile[];
}

export interface UpdateDemoCollectionBodyVue extends Omit<UpdateDemoCollectionBody, "inlineFile" | "gridFsFile"> {
    inlineFile: UploadUserFile[];
    gridFsFile: UploadUserFile[];
}

export async function createDemoCollection(body: CreateDemoCollectionBodyVue): Promise<AxiosResponse<CreateResult>> {
    const formData = await makeFormData(body, demoFormDataOpts);
    const res = await request({
        method: "POST",
        url: "/api/demo-collection",
        data: formData,
    });
    return res;
}

export async function updateDemoCollection(body: UpdateDemoCollectionBodyVue): Promise<AxiosResponse<void, any>> {
    const formData = await makeFormData(body, demoFormDataOpts);
    const res = request({
        method: "PUT",
        url: "/api/demo-collection",
        data: formData,
    });
    return res;
}

export function deleteDemoCollection(id: string): AxiosPromise<void> {
    return request({
        method: "DELETE",
        url: "/api/demo-collection/" + id,
    });
}
