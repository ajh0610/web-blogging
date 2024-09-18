import { Hono } from 'hono'
import { PrismaClient } from '@prisma/client/edge'
import { withAccelerate } from '@prisma/extension-accelerate'
import { configDotenv } from 'dotenv'
import { jwt, sign } from 'hono/jwt'

const app = new Hono<{
	Bindings: {
		DATABASE_URL: string
    JWT_SECRET: string
	}
}>();

app.post('/api/v1/user/signup', async (c) => {
  const prisma = new PrismaClient({
    datasourceUrl: c.env?.DATABASE_URL
  }).$extends(withAccelerate());
  const body = await c.req.json();
  if(!body.email || !body.password){
    c.status(403);
    return c.json({error: 'Error while sigining in incorrect parameters'})
  }
  try{
    const user = await prisma.user.create({
      data:{
        email: body.email,
        password: body.password
        
      }
    })
    const jwt = await sign({id: user.id, email: body.email}, c.env.JWT_SECRET)
    return c.json({jwt})
  }
  catch(e){
     c.status(403)
     return c.json({error: 'Error while sigining in!'})
  }
})

app.post('/api/v1/user/signin', async (c) => {

  const prisma = new PrismaClient({
    datasourceUrl: c.env?.DATABASE_URL
  }).$extends(withAccelerate());
  const body = await c.req.json();

  if(!body.email || !body.password){
    c.status(403);
    return c.json({error: 'Error while sigining in incorrect parameters'})
  }

  try{
    const user = await prisma.user.findUnique({
      where:{
        email: body.email
      }
    })

    if(!user){
      c.status(403);
      return c.json({error: "User doesn't exsist!"});
    }

    if(user?.password!==body.password){
      c.status(403);
      return c.json({error: "Password is not correct!"});
    }

    const jwt = await sign({id: user.id, email: body.email}, c.env.JWT_SECRET)

    return c.json({jwt})
  }
  catch(e){
     c.status(403)
     return c.json({error: 'Error while sigining in!'})
  }
  
})

app.post('/api/v1/blog', (c) => {
  
  return c.text('posting blog!')
})

app.put('/api/v1/blog', (c) => {
  return c.text('Editing a blog hono!')
})

app.get('/api/v1/blog/:id', (c) => {
  const id = c.req.param('id')
  return c.text('hello hono!')
})

app.get('/api/v1/blog/bulk', (c) => {
  return c.text('bulk get!')
})


export default app
