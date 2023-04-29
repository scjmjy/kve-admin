import mongoose from "mongoose";
import { GridFsFile } from "admin-common";

export const GridFsSchema = new mongoose.Schema<GridFsFile>(
    {
        name: String,
        url: String,
        size: Number,
        mimetype: String,
    },
    { _id: false },
);
