const {
  GraphQLObjectType,
  GraphQLID,
  GraphQLString,
  GraphQLNonNull,
  GraphQLInt,
  GraphQLList,
} = require("graphql");

const GameType = new GraphQLObjectType({
  name: "Game",
  fields: {
    id: { type: GraphQLID },
    name: { type: GraphQLNonNull(GraphQLString) },
    description: { type: GraphQLNonNull(GraphQLString) },
    min_age: { type: GraphQLInt },
    prequels: { type: GraphQLList(GraphQLID) },
    tags: { type: GraphQLList(GraphQLString) },
  },
});

module.exports = GameType;
