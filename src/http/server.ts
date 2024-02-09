import Fastify from "fastify"
import z from "zod"
import { prisma } from "../library/prisma"


const app = Fastify()

app.post("/polls",async (req, res) =>{

    
    const createSchema = z.object({
        title: z.string()
    })    

    const {title} = createSchema.parse(req.body)

    const create =await  prisma.poll.create({
        data:{
            title
        }
    })

    

    if(create){
        res.status(201).send(title)

    }
    
    res.status(400).send(new Error())

})

app.listen({
    host:"0.0.0.0",
    port:3333
}).then(res =>{
    console.log("HTTP server is Running!")
})