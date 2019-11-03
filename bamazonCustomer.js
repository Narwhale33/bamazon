var mysql = require("mysql");
var inquirer = require("inquirer");
require ("dotenv").config();
var pass = require("./pass.js");
var Table = require("cli-table2");

var connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: Object.values(pass.mysql)[0],
    database: "bamazon_db"
});

connection.connect(function(err) {
    if (err) throw err;
    console.log("\n        ~~ Welcome to Bamazon! ~~\n")
    displayItems();
});

function endSession() {
    connection.end();
};

function displayItems() {
    var query = "SELECT * FROM products";
    connection.query(query, function(err, fullResponse) {
        var table = new Table ({
            head: ["ID", "Item Name", "Price ($)", "Stock"],
            style: {head: ["cyan"]}
        });
        for (i=0; i < fullResponse.length; i++) {
            table.push(
                [fullResponse[i].item_id, fullResponse[i].product_name, {hAlign:"right", content: fullResponse[i].price.toFixed(2)}, {hAlign:"right", content: fullResponse[i].stock_quantity}]
            );
        };
        console.log(table.toString());
        promptUser(fullResponse);
    });
};

function promptUser(fullResponse) {
    inquirer.prompt ({
        name: "id",
        type: "prompt",
        message: "Please enter the ID of the product you would like to purchase: \n\n"
    }).then(function(product) {
        var productID = parseInt(product.id);
        var exists = false;
        for (i = 0; i < fullResponse.length; i++) {
            if (fullResponse[i].item_id === productID) {
                exists = true;
            };
        };
        if (exists) {
            var query = "SELECT item_id, product_name, price, stock_quantity FROM products WHERE ?";
            connection.query(query, {item_id: productID}, function(err, item) {
                console.log("You've chosen " + item[0].product_name + ".");
                if (productID === item[0].item_id) {
                    inquirer.prompt ({
                        name: "quantity",
                        type: "prompt",
                        message: "How many would you like?"
                    }).then(function(choice) {
                        var desiredQuantity = parseInt(choice.quantity);
                        console.log("You chose " + desiredQuantity + " " + item[0].product_name + "(s) at $" + item[0].price.toFixed(2) + " each.");
                        if (item[0].stock_quantity >= desiredQuantity) {
                            updateQuantity(productID, item[0].stock_quantity, desiredQuantity, item[0].price);
                        }
                        else {
                            console.log("\nInsufficient quantity!");
                            tryAgain();
                        };
                    });
                };
            });
        }
        else {
            console.log("That item doesn't exist in the database.")
            tryAgain();
        };
    });
};

function tryAgain() {
    inquirer.prompt ({
        type: "confirm",
        name: "tryAgain",
        message: "Would you like to try again?",
        default: true
    }).then(function(user) {
        if (user.tryAgain) {
            displayItems();
        }
        else {
            endSession();
        };
    });
}

function updateQuantity(item, quantity, purchased, price) {
    connection.query("UPDATE products SET ? WHERE ?",
    [
        {
            stock_quantity: (quantity - purchased)
        },
        {
            item_id: item
        }
    ], function(err) {
        if (err) throw err;
        console.log("Your total is $" + (price * purchased).toFixed(2) + ".");
        endSession();
    });
};