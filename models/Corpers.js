const { DataTypes } = require('sequelize');
const sequelize = require('./db').sequelize

// email, firstname, middlename, password, lastname, statecode, batch, servicestate, stream
// servicestate, lga, city_town, region_street, stream, accomodation_location, type_of_ppa, travel_from_state, travel_from_city
const User = sequelize.define('Corper', {
    // Model attributes are defined here
    firstName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    lastName: {
      type: DataTypes.STRING
      // allowNull defaults to true
    }
  }, {
    // Other model options go here
});