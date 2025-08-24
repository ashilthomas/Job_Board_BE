import express from "express"
import "dotenv/config";
import connectDb from "./src/config/db.js"
import userRoute from "./src/routes/userRoute.js"
import cors from "cors"
import cookieParser from "cookie-parser"
import jobRoute from "./src/routes/jobRoute.js"
import { fileURLToPath } from "url";
import path from "path"
import applicationRoute from "./src/routes/applicationRoute.js"

const app = express()


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);




app.use("/uploads", express.static(path.join(__dirname, "src/uploads")));






app.use(express.json())
app.use(cookieParser())
app.use(
    cors({
      credentials: true,
      origin: true, 
    })
  )
connectDb()

app.use('/api/v1/auth',userRoute)
app.use('/api/v1',jobRoute)
app.use('/api/v1/application',applicationRoute)

app.listen(process.env.PORT, () => {
    console.log(`Server is running on http://localhost:${process.env.PORT}`);
});

