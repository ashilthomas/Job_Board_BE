import express from "express"

import connectDb from "./src/config/db.js"
import userRoute from "./src/routes/userRoute.js"
import cors from "cors"
import cookieParser from "cookie-parser"
import jobRoute from "./src/routes/jobRoute.js"

import path from "path"


const app = express()
const PORT = 4000
const __dirname = path.dirname(new URL(import.meta.url).pathname);

// Now you can use __dirname like you would in CommonJS


app.use('src/uploads', express.static(path.join(__dirname, 'uploads')));

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

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

