import express from 'express';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
import productRouter from './routes/productRouter.js';
import userRouter from './routes/userRouter.js';
import jwt from "jsonwebtoken";

const app = express();

app.use(bodyParser.json())

app.use(
    (req,res,next)=>{
        const tokenString = req.header("Authorization")
        if(tokenString != null){
            const token = tokenString.replace("Bearer ", "")
            //console.log(token)

            jwt.verify(token, "cbc-batch-five#@2025" ,
                (err,decoded)=>{
                    if(decoded != null){
                        req.user = decoded;
                        console.log(decoded)
                        next()
                    }else{
                        console.log("invalid token")
                        res.status(403).json({
                            message : "Invalid token"
                        })
                    }
                }
            )
        }else{
            next()

        }
        
    }
)

mongoose.connect("mongodb+srv://admin:1234@cluster0.v3gjzcz.mongodb.net/?appName=Cluster0")
.then(()=>{
    console.log("Connected to the database")
}).catch(()=>{
    console.log("Database connection failed")
})

app.use("/products",productRouter)
app.use("/users",userRouter)


app.listen(3000, () => {
    console.log('Server is running on port 3000');
})