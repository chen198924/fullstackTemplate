import { z } from "zod";
import { publicProcedure, router } from "../trpc/trpc";

export const topRouter = router({
    //首页用来测试的
    test: publicProcedure.input(
        z.undefined()
    ).query(async (req) => {
        const result = '1234'
        return result
    })
})