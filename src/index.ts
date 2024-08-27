import { Hono, Next } from 'hono'
import { PrismaClient } from '@prisma/client/edge'
import { withAccelerate } from '@prisma/extension-accelerate'
import { env } from 'hono/adapter'
import { z } from 'zod'

const app = new Hono()

const userSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
})

app.use(async (c, next) => {
  if (c.req.header("Authorization")) {
    // Do validation
    await next()
  } else {
    return c.text("You dont have access");
  }
})

app.post('/', async (c) => {
// Zod Validation
const body = userSchema.parse(c.req.json());
const { DATABASE_URL } = env<{ DATABASE_URL: string }>(c)

const prisma = new PrismaClient({
  datasourceUrl: DATABASE_URL,
}).$extends(withAccelerate())

console.log(body)

await prisma.user.create({
  data: {
    name: body.name,
    email: body.email,
    password: body.password,
  }
})

return c.json({ message: 'User created' })
})

export default app