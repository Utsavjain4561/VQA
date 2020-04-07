var express = require("express");
    app = express();

// app.use("view engine","ejs");

app.get("/",(req,res)=>{
    var spawn = require("child_process").spawn;
        pythonProcess = spawn('python',['./test.py',"test/test2.jpg","Who is in the picture?"]);
    pythonProcess.stdout.on("data",(data=>{
        res.send(data.toString());
    }));
    
});

app.listen(3001,"localhost",()=>{
    console.log("App started");
})



