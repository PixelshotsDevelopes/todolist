const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const mongoose = require("mongoose");
const _ = require("lodash");
const port = 3001;
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

mongoose.set('strictQuery', false);
mongoose.connect("mongodb://127.0.0.1:27017/todolistDB2", { useNewUrlParser: true });

//creating schema for collection means defining structure to follow for document
const itemSchema = new mongoose.Schema({
   name: String
});

//creating model and binding schema to model means creating collection and defining schema means structure for document
const Item = mongoose.model("Item", itemSchema);

const item1 = new Item({
   name: "Welcome to do list 2"
});
const item2 = new Item({
   name: "you can add items"
});
const item3 = new Item({
   name: "You can also delete items"
});

const OpeningItems = [item1, item2, item3];

const listSchema = {
   name: String,
   items: [itemSchema]
}

const List = mongoose.model("List", listSchema);

app.get("/", (req, res) => {
   Item.find({}, (err, founditems) => {
      if (founditems.length === 0) {
         Item.insertMany(OpeningItems, (err) => {
            if (!err) {
               console.log("Opening items saved to db");
            }
            res.redirect("/");
         })
      } else {
         res.render("list2", { listTitle: "WELCOME", listitems: founditems });
      }
   })
});

app.post("/", (req, res)=>{
   const newItem = req.body.newItem;
   const listName = req.body.list;
   const item = new Item({
      name: newItem
   });
   if(listName === "WELCOME"){
      item.save();
      res.redirect("/");
   }else{
      List.findOne({name:listName},(err,foundList)=>{
         foundList.items.push(item);
         foundList.save();
         res.redirect("/"+listName);
      })
   }
})

app.post("/delete", (req, res) => {
   const checkboxdeleteid = req.body.checkboxdeleteid;
   const listName= req.body.listName;
   if(listName === "WELCOME"){
      Item.findByIdAndDelete({_id:checkboxdeleteid}, (err) => {
         if (!err) {
            console.log("Item deleted successfully")
            res.redirect("/");
         }
      });
   }else{
      List.findOneAndUpdate({name:listName},{$pull:{items:{_id:checkboxdeleteid}}},(err, foundList)=>{
         if(!err){
            res.redirect("/"+listName);
         }
      })
   }
});

app.get("/:customListName", (req, res) => {
   const customListName = _.capitalize(req.params.customListName);
   List.findOne({ name: customListName }, (err, foundList) => {
      if (err) {
         console.log(err)
      } else {
         if (foundList) {
            // console.log(foundList.items);
            res.render("list2", { listTitle: foundList.name, listitems: foundList.items })
         } else {
            const list = new List({
               name: customListName,
               items: OpeningItems
            });
            list.save();
            res.redirect("/"+customListName);
         }
      }
   })
});

app.listen(port, () => { console.log(`express app listening on port ${port}`) });