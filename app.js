const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");
const app = express();
const port = 3000;
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

mongoose.set('strictQuery', false);
mongoose.connect("mongodb://127.0.0.1:27017/todolistDB", { useNewUrlParser: true });

//creating schema for collection means defining structure to follow for document
const itemSchema = {
   name: String
};

//creating model and binding schema to model means creating collection and defining schema means structure for document
const Item = mongoose.model("Item", itemSchema);

const item1 = new Item({
   name: "welcome to your todolist"
});

const item2 = new Item({
   name: "Hit the plus button to add a new item"
});

const item3 = new Item({
   name: "click checkbox to delete item"
});


const defaultItems = [item1, item2, item3];

const listSchema = {
   name: String,
   items: [itemSchema]
}
const List = mongoose.model("List", listSchema);

//item schema related
app.get("/", (req, res) => {
   Item.find({}, (err, foundItems) => {
      if (foundItems.length === 0) {
         Item.insertMany(defaultItems, (err) => {
            if (err) {
               console.log(err)
            } else {
               console.log("default items saved in db");
            }
         });
         res.redirect("/");
      } else {
         res.render("list", { listTitle: "Today", newListItems: foundItems });
      }
   });
});

app.post("/", (req, res) => {
   const itemName = req.body.newItem;
   const listName = req.body.list;
   const item = new Item({
      name: itemName
   });
   if(listName === "Today"){
      item.save();
      res.redirect("/");
   }else{
      List.findOne({name: listName},(err, foundList)=>{
         foundList.items.push(item);
         foundList.save();
         res.redirect("/" + listName);
      });
   }

});

// list schema related
app.get("/:customListName", (req, res) => {
   const customListName = _.capitalize(req.params.customListName);
   List.findOne({name:customListName},(err,foundList)=>{
      if (!err) {
         if(!foundList){
            // create a new list 
            const list = new List({
               name: customListName,
               items: defaultItems
            });
            list.save();
            res.redirect("/"+ customListName);
         }else{
            // show an existing list
            res.render("list", { listTitle: foundList.name, newListItems: foundList.items });
         }
      }
   });

});


app.post("/delete",(req, res)=>{
   const checkedItemId = req.body.checkbox;
   const listName = req.body.listName;

   if (listName === "Today") {
      Item.findByIdAndDelete({_id:checkedItemId},(err)=>{
         if(err){
            console.log(err)
         }else{
            console.log("deleted item successfully")
            res.redirect("/");
         }
      });
   }else{
      List.findOneAndUpdate({name:listName},{$pull:{items:{_id:checkedItemId}}}, (err, foundList)=>{
         if(!err){
            res.redirect("/"+listName);
         }
      })
   }
})



app.get("/about", (req, res) => {
   res.render("about")
});

app.listen(port, () => { console.log(`express app listening on port ${port}`) });