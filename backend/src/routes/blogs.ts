import { Hono } from 'hono'
import { PrismaClient } from '@prisma/client/edge'
import { withAccelerate } from '@prisma/extension-accelerate'
import { configDotenv } from 'dotenv'
import { jwt, sign , verify, decode} from 'hono/jwt'

const blogRouter = new Hono<{
  Variables: {
    userId: string
  },
	Bindings: {
		DATABASE_URL: string
    JWT_SECRET: string
	},
}>();

//Middleware

blogRouter.use('/*', async (c, next)=>{

  const jwt = c.req.header('Authorization');
  if(!jwt){
    c.status(401);
    return c.json({error: 'Unauthorized entry!'});
  }
  const token = jwt.split(' ')[1];
  const decodedJWT = await verify(token, c.env.JWT_SECRET);

  if(!decodedJWT){
    c.status(403);
    return c.json({error: 'Unauthorized entry!'})
  }
  c.set('userId', String(decodedJWT.id))
  await next();
})


blogRouter.post('/', async (c) => {

    const prisma = new PrismaClient({
        datasourceUrl: c.env?.DATABASE_URL
    }).$extends(withAccelerate());
    const body = await c.req.json();
    try{
        const post = await prisma.post.create({
            data:{
                title: body.title,
                content: body.content,
                published: true,
                authorId: c.get('userId')
            }
        })
        c.status(201);
        return c.json({mssg: "Post created succesfully", postId: post.id});
    }
    catch(e){
        c.status(401);
        return c.json({error: "Error while creating the post"})
    }
})

blogRouter.put('/', (c) => {
  return c.text('Editing a blog hono!')
})

blogRouter.get('/:id', (c) => {
  const id = c.req.param('id')
  return c.text('hello hono!')
})

blogRouter.get('/bulk', (c) => {
  return c.text('bulk get!')
})


export default blogRouter;