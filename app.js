const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const _ = require('lodash');

const app = express();


app.set("view engine", "ejs")

app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static("public"))

mongoose.connect('mongodb://127.0.0.1:27017/todolistDB', { useNewUrlParser: true });



const itemSchema = new mongoose.Schema({
    name: String
})
const Item = mongoose.model('todos', itemSchema);

const item1 = new Item({
    name: "Welcome to your todolist!"
});
const item2 = new Item({
    name: "Hi the + button to add a new item."
});
const item3 = new Item({
    name: "<-- hit this to delete an item."
});
// Item.insertMany([item1, item2, item3]).then(function (err) {
//     if (err) {
//         console.log(err);
//     }
//     else {
//         console.log("Dons");
//     }
// })
const itemsSchema = {
    name: String,
};
const defaultItemes = [item1, item2, item3];
const listSchema = {
    name: String,
    items: [itemsSchema]
};

const List = mongoose.model('List', listSchema);

app.get('/', function (req, res) {

    Item.find({}).then(function (foud) {

        res.render('lsit', { ListTitle: "today", newListItems: foud })
    })
        .catch(function (err) {
            console.log(err)
        })
})

app.post('/', function (req, res) {

    const itemname = req.body.newItem;
    const listName = req.body.list;
    const item = new Item({
        name: itemname
    })
    if (listName === 'today') {
        item.save();
        res.redirect('/')
    } else {
        List.findOne({ name: listName }).then(function (foundList) {
            foundList.items.push(item);
            foundList.save();
            res.redirect('/' + listName);
        })
    }
})
app.get('/:customListName', function (req, res) {
    const customListName = _.capitalize(req.params.customListName);

    List.findOne({ name: customListName }).then(function (foundList) {
        if (!foundList) {
            const list = new List({
                name: customListName,
                items: defaultItemes
            });
            list.save()
            res.redirect('/' + customListName);

        } else {
            res.render('lsit', { ListTitle: foundList.name, newListItems: foundList.items });
        }
    }).catch(function (err) {
        console.log(err);
    });
});



app.post('/delete', function (req, res) {
    const checkedItemId = req.body.checkbox;
    const listName = req.body.listName;

    if (listName === 'today') {
        Item.findByIdAndRemove(checkedItemId).then(function (err) {
            if (!err) {
                console.log('successfully deleted checked item.');

            }
            res.redirect('/')
        });
    }
    else {
        List.findOneAndUpdate({ name: listName }, { $pull: { items: { _id: checkedItemId } } })

            .then(function (foundList) {
                if (foundList) {
                    res.redirect('/' + listName);
                }
            });

    }
})



app.get('/about', function (req, res) {
    res.render('about')
})


app.listen(3000, function () {
    console.log("Prot 3000");
});
