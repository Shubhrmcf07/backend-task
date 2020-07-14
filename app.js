const {
  GraphQLID,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLString,
  GraphQLInt,
} = require("graphql");
const express = require("express");
const mongoose = require("mongoose");
const expressGraphQL = require("express-graphql").graphqlHTTP;
const player = require("./models/players");
const game = require("./models/games");
const schema = require("./graphql/schema");
const Schema = require("./graphql/schema");
require("dotenv").config();
require("url-search-params-polyfill");
const app = express();
mongoose.connect(
  `mongodb+srv://${process.env.user}:${process.env.password}@cluster0.8hk8i.mongodb.net/task?retryWrites=true&w=majority`,
  {
    useUnifiedTopology: true,
    useFindAndModify: false,
    useNewUrlParser: true,
  }
);

app.use(express.static("./doc/schema/"));

app.get("/", (req, res) => {
  return res.sendFile("./query.doc.html");
});

app.use(
  "/graphql",
  expressGraphQL({
    schema: Schema,
    graphiql: true,
  })
);

app.listen(4000, () => console.log("Server Running"));
