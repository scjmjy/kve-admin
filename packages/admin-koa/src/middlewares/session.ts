import type koa from "koa";
import session from "koa-session";

export function setupSession(app: koa) {
    app.keys = ["kve123456"];
    app.use(
        session(
            {
                // maxAge: 86400000,
                // signed: false,
            },
            app,
        ),
    );
    // app.use((ctx, next) => {
    //     if (ctx.session) {
    //         let count = ctx.session.views || 0;
    //         ctx.session.views = ++count;
    //         console.log("[session]", ctx.session.toJSON());
    //     }
    //     next();
    // });
}
