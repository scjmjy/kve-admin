import Router from "koa-router";
import { postLogin } from "@/controllers/login";
import { getHelloworld } from "@/controllers/helloworld";

export const router = new Router();

router.post("/api/login", postLogin);

router.get("/api/helloworld", getHelloworld);
