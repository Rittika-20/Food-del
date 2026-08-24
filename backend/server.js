import express from "express"
import cors from "cors"
import { connectDB } from "./config/db.js"
import foodRouter from "./routes/foodRoute.js"
import userRouter from "./routes/userRoute.js"
import 'dotenv/config'
import cartRouter from "./routes/cartRoute.js"
import orderRouter from "./routes/orderRoute.js"
import promoRouter from "./routes/promoRoute.js"



// app config
const app = express()
const port = process.env.PORT||4000

//middleware
app.use(express.json())
app.use(cors())

// db connection
connectDB();


// api endpoints
app.use("/api/food",foodRouter)
app.use("/images",express.static('uploads'))
app.use("/api/user",userRouter)
app.use("/api/cart",cartRouter)
app.use("/api/order",orderRouter)
app.use("/api/promo", promoRouter)



app.get("/",(req,res)=>{
    res.send("API Working")
})

app.listen(port,()=>{
    console.log(`Server Started on http://localhost:${port} `)
})

//mongodb+srv://rittika27basak_db_user:<db_password>@cluster0.lqlmust.mongodb.net/?