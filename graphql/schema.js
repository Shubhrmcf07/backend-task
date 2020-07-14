const {
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLList,
  GraphQLString,
  GraphQLNonNull,
  GraphQLInt,
  GraphQLID,
  GraphQLInterfaceType,
} = require("graphql");
const PlayerType = require("./persontype");
const GameType = require("./gametype");
const player = require("../models/players");
const game = require("../models/games");
const games = require("../models/games");
const players = require("../models/players");

const Schema = new GraphQLSchema({
  query: new GraphQLObjectType({
    name: "Query",
    fields: {
      searchPlayer: {
        type: GraphQLList(PlayerType),
        args: {
          keyword: { type: GraphQLString },
        },

        resolve(parentValue, args) {
          return player
            .find({ name: { $regex: `.*${args.keyword}*.` } })
            .exec();
        },
      },

      searchGame: {
        type: GraphQLList(GameType),
        args: {
          keyword: { type: GraphQLString },
        },

        resolve(parentValue, args) {
          return game.find({ name: { $regex: `.*${args.keyword}*.` } }).exec();
        },
      },

      recommendedFriends: {
        type: GraphQLList(PlayerType),
        args: {
          player1ID: { type: GraphQLID },
        },
        async resolve(parentValue, args) {
          var play = [];

          const p1 = await player.findOne({ _id: args.player1ID });

          for (let i = 0; i < p1.friends.length; i++) {
            const friend = await player.findOne({ _id: p1.friends[i] });

            for (let j = 0; j < friend.friends.length; j++) {
              p = String(p1._id);
              q = String(friend.friends[j]);

              if (p != q && !p1.friends.includes(friend.friends[j])) {
                const mf = await player.findOne({ _id: friend.friends[j] });

                play.push(mf);
              }
            }
          }

          return play;
        },
      },

      recommendedGames: {
        type: GraphQLList(GameType),
        args: {
          player1ID: { type: GraphQLID },
        },
        async resolve(parentValue, args) {
          var gams = [];

          const gameArr = await game.find({});
          const p1 = await player.findById(args.player1ID);
          for (let k = 0; k < p1.games_purchased.length; k++) {
            const gam = await game.findOne({ _id: p1.games_purchased[k] });
            for (let i = 0; i < gameArr.length; i++) {
              for (let j = 0; j < gam.tags.length; j++) {
                if (
                  gameArr[i].tags.includes(gam.tags[j]) &&
                  String(gam._id) != String(gameArr[i]._id)
                ) {
                  const mg = gameArr[i];
                  gams.push(mg);
                }
              }
            }
          }

          for (let i = 0; i < p1.friends.length; i++) {
            const friend = await player.findOne({ _id: p1.friends[i] });
            for (let j = 0; j < friend.games_purchased.length; j++) {
              if (!p1.games_purchased.includes(friend.games_purchased[j])) {
                const mf = await game.findOne({
                  _id: friend.games_purchased[j],
                });

                gams.push(mf);
              }
            }
          }
          return gams;
        },
      },
    },
  }),

  mutation: new GraphQLObjectType({
    name: "mutation",
    fields: {
      addPlayer: {
        type: PlayerType,
        args: {
          name: { type: GraphQLNonNull(GraphQLString) },
          email: { type: GraphQLNonNull(GraphQLString) },
          age: { type: GraphQLNonNull(GraphQLInt) },
          games_purchased: { type: GraphQLList(GraphQLID) },
        },

        resolve(parentValue, args) {
          return new player(args).save();
        },
      },

      addGame: {
        type: GameType,
        args: {
          name: { type: GraphQLNonNull(GraphQLString) },
          description: { type: GraphQLNonNull(GraphQLString) },
          min_age: { type: GraphQLInt },
          prequels: { type: GraphQLList(GraphQLID) },
          tags: { type: GraphQLList(GraphQLString) },
        },

        resolve(parentValue, args) {
          return new game(args).save();
        },
      },

      purchaseGame: {
        type: GraphQLString,
        args: {
          gameID: { type: GraphQLNonNull(GraphQLString) },
          playerID: { type: GraphQLNonNull(GraphQLString) },
        },

        async resolve(parentValue, args) {
          const gamer = await game.findOne({ _id: args.gameID });
          const user = await player.findOne({ _id: args.playerID }).exec();
          if (gamer.min_age > user.age) {
            return "You Cannot Purchase This Game Yet";
          }

          await player.findOneAndUpdate(
            { _id: args.playerID },
            { $push: { games_purchased: args.gameID } }
          );

          return "Purchase Successful";
        },
      },

      gameCompleted: {
        type: GraphQLString,
        args: {
          player1ID: { type: GraphQLID },
          gameID: { type: GraphQLID },
        },

        async resolve(parentValue, args) {
          await player.findByIdAndUpdate(args.player1ID, {
            $push: { games_completed: args.gameID },
          });

          return "Update Successful";
        },
      },

      addFriend: {
        type: GraphQLString,
        args: {
          player1ID: { type: GraphQLNonNull(GraphQLString) },
          player2ID: { type: GraphQLNonNull(GraphQLString) },
        },

        async resolve(parentValue, args) {
          await player.findOneAndUpdate(
            { _id: args.player1ID },
            { $push: { friends: args.player2ID } }
          );

          await player.findOneAndUpdate(
            { _id: args.player2ID },
            { $push: { friends: args.player1ID } }
          );

          return "Successfully Added";
        },
      },

      addGamePrequels: {
        type: GraphQLString,
        args: {
          gameID: { type: GraphQLID },
          prequels: { type: GraphQLList(GraphQLID) },
        },

        async resolve(parentValue, args) {
          await game.findOneAndUpdate(
            { _id: args.gameID },
            {
              $push: {
                prequels: {
                  $each: args.prequels,
                },
              },
            }
          );

          return "Successfully Added!";
        },
      },

      sendMultiplayerRequest: {
        type: GraphQLString,
        args: {
          player1ID: { type: GraphQLNonNull(GraphQLID) },
          gameID: { type: GraphQLNonNull(GraphQLID) },
          player2ID: { type: GraphQLNonNull(GraphQLID) },
        },
        async resolve(parentValue, args) {
          const p1 = await player.findOne({ _id: args.player1ID });
          const p2 = await player.findOne({ _id: args.player2ID });
          const g1 = await game.findOne({ _id: args.gameID });

          if (!p2.games_purchased.includes(g1)) {
            return "Player 2 has not purchased this game.";
          }

          let check = (arr1, arr2) => {
            arr1.every((v) => arr2.includes(v));
          };

          const eligible = check(g1.prequels, p2.games_completed);
          if (!eligible) {
            return "Player 2 has not completed all the prequels for the game.";
          }

          let common = (arr1, arr2) => {
            arr1.some((v) => arr2.includes(v));

            const commonFriends = common(p1.friends, p2.friends);

            if (!commonFriends) {
              return "You Do Not Have Any Friends In Common";
            }

            return "Request Sent Successfully!";
          };
        },
      },
    },
  }),
});

module.exports = Schema;
