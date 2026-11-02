const express=require("express")
const app=express()
const msql=require("mysql2")

const bcrypt=require("bcrypt") ///for encrypting req.body to be sent to database 

const session=require("express-session") //creates sessions to be used to control user screen time

const PORT=3000

//MIDDLEWARE>>PROGRAMS THAT SIT IN BETWEEN A ROUTER AND THE FRONTEND 

//THE EXPRESS TO VIEW THE PUBLIC FILES 
app.use(express.static("public"))

//allow our server to understand incoming json 

app.use(express.json()) //we can be able to access the information via req.body

////allow us to get data from the forms in html (https)
app.use(express.urlencoded({extended:true}))

app.set("view engine", "ejs")


app.listen(PORT,()=>{
    console.log(`port is listening at ${PORT}`);
    
})

