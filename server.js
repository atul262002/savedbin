const express=require("express")
const app=express();
require('dotenv').config();
let alert = require('alert'); 
app.use(express.static('public'))
// this line means all the static files are in this public folder , which can be serve publically in all 

app.set("view engine" , "ejs");
const PORT=process.env.PORT || 1090
app.use(express.urlencoded({extended:true}))

const db=require("./mongoose/connection")
db.on("error",(error)=>{
    console.error("database connection error "+ error)
})

db.once("open",()=>{
    console.log("mongoDb connected successfully ")
})

const savedbin =require("./model/schema")

app.get("/",(req,res)=>{
    let instruction =`Welcome to SavedBin 
A place where you can paste your code snippet and share them with your colleague for modification or reviewing 
To start working , click on the New button on top right corner then paste your code , save and share with the URL link `

      res.render("first_view" ,{instruction , language:"plaintext"})
})


app.get("/new",(req,res)=>{
    res.render("newfile")
})
app.post("/save", async (req, res) => {
    const value = req.body.value;
    if (!value || typeof value !== "string") {
      // res.displayMessage("write something");
      alert("please write something")
      // window.alert("please write somethig")
      return res.status(400).render("newfile", {
        message: "Invalid code snippet provided.",
      });
    }
    try {
    //   Save the code snippet to the database
      const document = await savedbin.create({ value });
  
    //   Redirect to the new URL with the document ID
      res.redirect(`/${document.id}`);
    
    } catch (error) {
      console.error("Error saving code snippet:", error);
      // Render an error page with an appropriate error message
      res.status(500).render("newfile", {
        value: value,
        message: "An error occurred while saving the code snippet.",
      });
    }
  });
  

app.get("/:id", async(req,res)=>{
   const id=req.params.id
   try{
    const document = await savedbin.findById(id)
    res.render("first_view" ,{instruction: document.value,id })
   }catch (e){
    res.redirect("/new")
   }
})


app.get("/:id/duplicate",async(req, res)=>{
    const id=req.params.id
    try{
     const document = await savedbin.findById(id)
     res.render("newfile" ,{value: document.value })
    }catch (e){
     res.redirect(`/${id}`)
    }
})

app.listen(PORT , ()=>{
    console.log(`port started at http://localhost:${PORT}`)
})