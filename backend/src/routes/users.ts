import { Hono } from 'hono'
import { PrismaClient } from '@prisma/client/edge'
import { withAccelerate } from '@prisma/extension-accelerate'
import { jwt, sign , verify, decode} from 'hono/jwt'

const userRouter = new Hono<{
	Bindings: {
		DATABASE_URL: string
    JWT_SECRET: string
	},
}>();


userRouter.post('/signup', async (c) => {
  // Connecting to the prisma client
  const prisma = new PrismaClient({
    datasourceUrl: c.env?.DATABASE_URL
  }).$extends(withAccelerate());

  // Fetching the body
  const body = await c.req.json();

  //Validation for the body
  if(!body.email || !body.password){
    c.status(403);
    return c.json({error: 'Error while sigining in incorrect parameters'})
  }
  try{

    // creating a new user
    const user = await prisma.user.create({
      data:{
        email: body.email,
        password: body.password
        
      }
    })

    //maybe jwt lib doesn't work well with cloud flare workers thats why we used jwt from the hono library
    const jwt = await sign({id: user.id, email: body.email}, c.env.JWT_SECRET)
    return c.json({jwt})
  }
  catch(e){
     c.status(403)
     return c.json({error: 'Error while sigining in!'})
  }
})

userRouter.post('/signin', async (c) => {

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


export default userRouter;
