import Fastify from "fastify"
import z from "zod"
import { prisma } from "../library/prisma"
import { createPoll } from "./routes/create-poll"
import { getPoll } from "./routes/get-poll"
import { voteOnPoll } from "./routes/vote-on-poll"
import cookie from '@fastify/cookie'

const app = Fastify()

app.register(cookie,{
    secret: 'my-secret',
    hook: 'onRequest',
})

app.register(createPoll)
app.register(getPoll)
app.register(voteOnPoll)


app.listen({
    host:"0.0.0.0",
    port:3333
}).then(res =>{
  console.log("HTTP server is Running!")
})