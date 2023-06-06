var prop = "helloworld";
var x = prop || "default";

if (x === "helloworld") {
    console.log("this is the right branch");
}
else {
    console.log("this is the wrong branch");
}