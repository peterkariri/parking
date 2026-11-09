const express=require("express")
const mysql=require("mysql2/promise")
const app=express();

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
        maxAge:1000 * 60 * 60 //1 hOUR IN MILLLLISECOND 
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

app.use((req,res,next)=>{ //allows the user to be availabel on every view file
    res.locals.user=req.session.user
    next() //termination of a process once it has been completed and go to the next 
})

//testing if my database is connected 
//to test if the connection is active we use the getConnection method/function 
async function connectionTest(){
try {
     let connection= await db.getConnection();  //trigger to see if my db is ative 

    console.log("database connected successfully");
    connection.release()// gives the connectin back to pool


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
 //sign up to get the sign up page 
app.get("/signup",(req,res)=>{
    res.render("signup")
})
//send user infomratin to the database(req.body) and also countercheck if user {using control strucutures}
// is registered //validation (password//strength of password )
//email validity //has the user ever logged in 
//hash the password before storing it 
app.post("/signup",(req,res)=>{
    let{fullname,email,phone,password,confirm_password} =req.body //allow me to get this information from the user via https(post)
    //CHECKING FOR NULL VALUES >>EMPTY VALUES 
    if(!fullname || !email || !password){ ///form validation
      return res.render("signup",{error:"Please fill  in all the required fields"})
    }
    if(password.length<8){
              return res.render("signup",{error:"password is not strong"})

    }
    //validate the two passwords(the pasword and the confrim password )

    if(password!==confirm_password){
                     return res.render("signup",{error:"password does not match"})

    }
    //we interact with the database  //this hanldes duplicates and email validatin
    try {
        let[rows]= db.query("SELECT id FROM users WHERE email= ? ",[email])
        if(rows.length >0){
                        return res.render("signup",{error:" Email already in use register a new email "})

        }
        //hash th epassword for storage 

        const hashedPassword=bcrypt.hash(password,10) //makes sure the password ben sent to database is not in strings

        //push to database 

        db.query(
            "INSERT INTO users (fullname,email,phone,password) VALUES(?,?,?,?)",[fullname,email,phone,password]
        )
        res.redirect("/login")


    } catch (error) {
             return res.render("signup",{error:" Somethong went wrong try signing up again "})

    }
    console.log(req.body);
    
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

