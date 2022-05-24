import mongoose from "mongoose";

export const GridFsSchema = new mongoose.Schema<GridFsFile>(
    {
        name: String,
        url: String,
        size: Number,
        mimetype: String,
    },
    { _id: false },
);
