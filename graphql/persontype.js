const {
  GraphQLObjectType,
  GraphQLID,
  GraphQLString,
  GraphQLNonNull,
  GraphQLInt,
  GraphQLList,
} = require("graphql");

const PlayerType = new GraphQLObjectType({
  name: "Player",
  fields: {
    id: { type: GraphQLID },
    name: { type: GraphQLNonNull(GraphQLString) },
    email: { type: GraphQLNonNull(GraphQLString) },
    age: { type: GraphQLNonNull(GraphQLInt) },
    games_purchased: { type: GraphQLList(GraphQLID) },
    friends: { type: GraphQLList(GraphQLID) },
  },
});

module.exports = PlayerType;
