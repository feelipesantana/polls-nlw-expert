import { FastifyInstance } from "fastify";
import { prisma } from "../../library/prisma";
import z from "zod";

export async function createPoll(app: FastifyInstance){
    app.post("/polls",async (req, res) =>{

        const createSchema = z.object({
            title: z.string(),
            options:z.array(z.string())
        })    
    
        const {title, options} = createSchema.parse(req.body)
    
        const createPoll = await prisma.poll.create({
            data:{
                title,
                PollOption: {
                    createMany:{
                        data: options.map(option =>{
                            return {title:option}
                        })
                    }
                }
            }
        })

        if(createPoll){
            return {pollId: createPoll.id}
        }
        
        res.status(400).send(new Error())
    
    })
}