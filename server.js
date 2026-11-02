const express=require("express")
const app=express()
const mysql=require("mysql2")

const bcrypt=require("bcrypt") ///for encrypting req.body to be sent to database 

const session=require("express-session") //creates sessions to be used to control user screen time

const PORT=3000

//MIDDLEWARE>>PROGRAMS THAT SIT IN BETWEEN A ROUTER AND THE FRONTEND 
//AUTHENTICATION MIDLEWARE >>CHECK IF USER ID IS OR HAS EVER LOGGED IN THE SUYSTEM AND IF SO THEY CAN LOG IN OR IF NOT THEY ARE REDIE=RECTED ,EITHER TO LOG IN OR DASHBOARD 

function isAuthenticated(req,res,next){
    if(!req.session.user){ //if you are logged in or have ever logged in 
       return res.redirect("/login")
    }
  //if successful you continue to the next process
    next();
}
//tis middleware is used over various protected routes (//admin dashbaoards,profile sections ,messages ,roles)>>
//THE EXPRESS TO VIEW THE PUBLIC FILES 
app.use(express.static("public"))

//allow our server to understand incoming json 

app.use(express.json()) //we can be able to access the information via req.body

////allow us to get data from the forms in html (https)
app.use(express.urlencoded({extended:true}))

app.set("view engine", "ejs")
//session handler 
app.use(session({
    secret:"we change in production ", //signs the id for protection (integrity)
    resave:false, //avoids saving an unchanged session uncessarily 
    saveUninitialized:false,

    //cookie 
    cookie:{
        httpOnly:true,
        maxAge:1000 * 60 * 60 //1 OUR IN MILLLLISECOND 
    }
}))




//connecting our backed to a databse 
const db=mysql.createPool({
    //DATABASE SETTINGS
    host:"localhost",
    user:"root",
    password:"",
    database:"parkease_db",

    //POOL SETTINGS 
    
    waitForConnections:true, //checks if the connectionis established where if not it retriggers another pool 
    connectionLimit:10,//ten connections can be created for this 
 
})

//testing if my database is connected 
//to test if the connection is active we use the getConnection method/function 
async function connectionTest(){
try {
     let connection= await db.getConnection();  //trigger to see if my db is ative 

    console.log("database connected successfully");


} catch (error) {
    console.log("database connection failed",error.message);
    
}
   
}
connectionTest();

//routing 

app.get("/",(req,res)=>{
    if(req.session.user){
        return res.redirect("/dashboard")
    }
    res.redirect("/login")
})
app.get("/login",(req,res)=>{
    res.render("login")
})

app.get("/signup",(req,res)=>{
    res.render("signup")
})

app.get("/dashboard",(req,res)=>{
    
    res.render("dashboard")
})
app.get("/profile",(req,res)=>{
    res.render("profile")
})

app.get("/parking",(req,res)=>{
    res.render("parking-details")
})
app.listen(PORT,()=>{
    console.log(`port is listening at ${PORT}`);
    
})

