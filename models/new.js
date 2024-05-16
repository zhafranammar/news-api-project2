'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class New extends Model {
    static associate(models) {
      New.belongsTo(models.User, { foreignKey: 'userId' });
    }
  }
  New.init({
    title: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        notNull: { msg: 'Title cannot be null' }
      }
    },
    slug: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        notNull: { msg: 'Slug cannot be null' }
      }
    },
    publicationDate: DataTypes.DATE,
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        notNull: { msg: 'Content cannot be null' }
      }
    },
    userId: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'New',
  });
  return New;
};