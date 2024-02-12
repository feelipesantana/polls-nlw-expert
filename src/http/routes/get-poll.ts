import { FastifyInstance } from "fastify";
import { prisma } from "../../library/prisma";
import z from "zod";
import { redis } from "../../library/redis";

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
            const result = await redis.zrange(id,0,-1, 'WITHSCORES')
            
            // {id: 3}
            const votes = result.reduce((obj, line, index) =>{

                if(index % 2 === 0){
                    const score = result[index + 1]

                    Object.assign(obj, {[line]: Number(score)})
                }

                return obj
            }, {} as Record<string, number>, )
            
            
            res.status(200).send({
                poll:{
                    id: getPoll.id,
                    title: getPoll.title,
                    options: getPoll.PollOption.map(option =>{
                        return {
                            id: option.id,
                            title: option.title,
                            score: (option.id in votes) ?  votes[option.id] : 0
                        }
                    }),
                    
                    
                }
            })

        }
        
        res.status(400).send(new Error())
    
    })
}