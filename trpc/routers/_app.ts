import { baseProcedure, createTRPCRouter, protectedProcedure } from '../init';
import prisma from '@/lib/prisma';
 
export const appRouter = createTRPCRouter({
  getUsers: protectedProcedure
    .query(({ ctx }) => { 
        return prisma.user.findMany({
          where: {
            id: ctx.auth.user.id,
          }
        });
    })
});
 
// export type definition of API: 2:24
export type AppRouter = typeof appRouter;