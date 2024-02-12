import { FastifyInstance } from "fastify";
import { prisma } from "../../library/prisma";
import z from "zod";

export async function getPoll(app: FastifyInstance){
    app.get("/polls/:id",async (req, res) =>{

        const createSchema = z.object({
            id: z.string().uuid(),
        })    
    
        const {id} = createSchema.parse(req.params)
    
        const getPoll = await prisma.poll.findUnique({
            where:{
                id
            },
            include:{
                PollOption:{
                    select:{
                        id:true,
                        title: true,
                    }
                }
            }
        })

        if(getPoll){
            return {getPoll}
        }
        
        res.status(400).send(new Error())
    
    })
}