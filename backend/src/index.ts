import { Hono } from 'hono'
import { PrismaClient } from '@prisma/client/edge'
import { withAccelerate } from '@prisma/extension-accelerate'
import { configDotenv } from 'dotenv'
import { jwt, sign , verify, decode} from 'hono/jwt'
import userRouter from './routes/users'
import blogRouter from './routes/blogs'

const app = new Hono<{
  Variables: {
    userId: string
  },
	Bindings: {
		DATABASE_URL: string
    JWT_SECRET: string
	},
}>();

app.route('/api/v1/user', userRouter);
app.route('/api/v1/blog', blogRouter);

export default app
