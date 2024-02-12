import { FastifyInstance } from "fastify";

import  { randomUUID} from 'node:crypto';

import { prisma } from "../../library/prisma";
import z from "zod";
import { redis } from "../../library/redis";

export async function voteOnPoll(app: FastifyInstance){
    app.post("/polls/:pollId/votes",async (req, res) =>{

        const voteOnPollBodySchema = z.object({
            pollOptionId: z.string().uuid()
        })    

        const voteOnPollParamsSchema = z.object({
            pollId: z.string().uuid()
        })
    
        const {pollId} = voteOnPollParamsSchema.parse(req.params)
        const {pollOptionId} = voteOnPollBodySchema.parse(req.body)
    
       let {sessionId} = req.cookies

       if(sessionId){
            const usePreviousVoteOnPoll = await prisma.vote.findUnique({
                where:{
                    sessionId_pollId:{
                        pollId,
                        sessionId
                    }
                }
            })

            if(usePreviousVoteOnPoll && (usePreviousVoteOnPoll.pollOptionId !== pollOptionId)){
               
                await prisma.vote.delete({
                    where:{
                        id: usePreviousVoteOnPoll.id
                    }
                })

                await redis.zincrby(pollId, -1,usePreviousVoteOnPoll.pollOptionId)
              
            }else if(usePreviousVoteOnPoll){
                return res.status(400).send({massage: 'You are ready vote on this poll'})
            }
       }
       if(!sessionId){
        sessionId = randomUUID();

        res.setCookie('sessionId', sessionId,{
            path: '/',
            maxAge: 60 * 60  * 24 * 30, //30 days
            signed: true,
            httpOnly: true,
        })
       }

        await prisma.vote.create({
            data:{
                sessionId,
                pollId,
                pollOptionId
            }
        })   

        await redis.zincrby(pollId, 1, pollOptionId)

        return res.status(201).send()
    })
}