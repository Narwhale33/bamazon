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
    console.log("\n         Manager View\n")
    homePage();
});

function endSession() {
    connection.end();
};

function homePage() {
    inquirer.prompt({
        type: "list",
        name: "choice",
        message: "Please choose an option",
        choices: ["View Products for Sale", "View Low Inventory", "Add to Inventory", "Add New Product", "Exit"]
    }).then(function(user) {
        switch(user.choice) {
            case "View Products for Sale":
                getAllItems();
                break;
            case "View Low Inventory":
                getLowInventory();
                break;
            case "Add to Inventory":
                viewInventory();
                break;
            case "Add New Product":
                addNewProduct();
                break;
            case "Exit":
                endSession();
                break;
        };
    });
};

function getAllItems() {
    var query = "SELECT * FROM products";
    displayItems(query);
}

function getLowInventory() {
    var query = "SELECT * FROM products WHERE stock_quantity < 5";
    displayItems(query);
}

function displayItems(query) {
    connection.query(query, function(err, fullResponse) {
        if (fullResponse.length === 0) {
            console.log("There are no items matching your search.");
        }
        else {
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
        };
        homePage();
    });
};

function viewInventory() {
    var query = "SELECT * FROM products";
    connection.query(query, function(err, fullResponse) {
        if (fullResponse.length === 0) {
            console.log("There are no items matching your search.");
        }
        else {
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
            addToInventory(fullResponse);
        };
    });
};

function addToInventory(fullResponse) {
    inquirer.prompt({
        type: "input",
        name: "id",
        message: "\nEnter the Item ID of the item you would like to add stock to.\n"
    }).then(function(product) {
        var productID = parseInt(product.id);
        var exists = false;
        for (i=0; i < fullResponse.length; i++) {
            if (fullResponse[i].item_id === productID) {
                exists = true;
            };
        };
        if (exists) {
            var query = "SELECT item_id, product_name, stock_quantity FROM products WHERE ?";
            connection.query(query, {item_id: productID}, function(err, item) {
                console.log("You've chosen " + item[0].item_id + ", which is " + item[0].product_name + ".");
                inquirer.prompt({
                    type: "input",
                    name: "addedAmount",
                    message: "Enter the number of stock you would like to add."
                }).then(function(product) {
                    var addedStock = parseInt(product.addedAmount);
                    if (isNaN(addedStock)) {
                        console.log("You must enter a number.");
                        endSession();
                    }
                    else {
                        connection.query("UPDATE products SET ? WHERE ?", [
                            {
                                stock_quantity: (addedStock + item[0].stock_quantity)
                            },
                            {
                                item_id: item[0].item_id
                            }
                        ], function(err) {
                            if (err) throw err;
                            console.log ("You've added " + addedStock + " " + item[0].product_name + "(s) to the inventory, for a total of " + (addedStock + item[0].stock_quantity) + " " + item[0].product_name + "(s).");
                            endSession();
                        });
                    };
                });
            });
        }
        else {
            console.log("That item does not exist in the database.");
            endSession();
        }
    });
};

function addNewProduct() {
    inquirer.prompt([
        {
            type: "input",
            name: "name",
            message: "What is the name of the product you are adding?"
        },
        {
            type: "input",
            name: "department",
            message: "To what department does this product belong?"  
        },
        {
            type: "input",
            name: "price",
            message: "What is the price?"
        },
        {
            type: "input",
            name: "stock",
            message: "How many are in stock?"
        }
    ]).then(function(newProduct) {
        var newProductPrice = parseInt(newProduct.price);
        var newProductStock = parseInt(newProduct.stock);

        if (isNaN(newProductPrice)) {
            console.log("\nThe price must be a number.");
            endSession();
        }
        else if (isNaN(newProductStock)) {
            console.log("\nThe stock quantity must be a number");
            endSession();
        }
        else {
            connection.query("INSERT INTO products SET ?", {
                product_name: newProduct.name,
                department_name: newProduct.department,
                price: newProduct.price,
                stock_quantity: newProduct.stock
            }, function(err) {
                if (err) throw err;
                console.log("\nYou've added " + newProductStock + " " + newProduct.name + "(s) at $" + newProductPrice.toFixed(2) + " each.")
                endSession();
            });
        };
    });
};