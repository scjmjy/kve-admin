import mitt from "mitt";

export type Events = {
    // "logged-in": string;
    // "logged-out": string;
    "theme-dark": boolean;
};

const emitter = mitt<Events>();

export { emitter };
