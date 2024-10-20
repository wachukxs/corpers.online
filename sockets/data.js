const { Sequelize, Model, DataTypes } = require("sequelize");

const sequelize = new Sequelize({
  dialect: "sqlite",
  storage: "./sockets/online.corpers.db.sqlite",
});

// promise so it's not blocking, only select queries will be async/await

class UserOnline extends Model {}
UserOnline.init(
  {
    namespace: {
      type: DataTypes.STRING,
      unique: 'compositeIndex',
    },
    state_code: {
      type: DataTypes.STRING,
      unique: 'compositeIndex',
    },
    corp_member_id: {
      type: DataTypes.INTEGER,
      unique: 'compositeIndex',
      // allowNull: false,
    },
  },
  { sequelize, modelName: 'UserOnline', timestamps: false },
);
// force so that it clears on every restart, it'll repopulate.
UserOnline.sync({ force: true })

sequelize
  .authenticate({ raw: true })
  .then((e) => {
    console.log("made sqlite db connection");
  })
  .catch((err) => {
    console.error("oopsy sqlite db error", err);
  });

exports.cacheDatabase = sequelize;
exports.UserOnline = UserOnline
