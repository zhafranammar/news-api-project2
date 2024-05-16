'use strict';

/** @type {import('sequelize-cli').Migration} */

const bcrypt = require('bcrypt');
module.exports = {
  async up(queryInterface, Sequelize) {
    return queryInterface.bulkInsert('Users', [
      {
        username: 'John',
        email: 'john@example.com',
        password: await bcrypt.hash('password123', 10),
        phone: '123456789',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        username: 'Alice',
        email: 'alice@example.com',
        password: await bcrypt.hash('password456', 10),
        phone: '987654321',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        username: 'Bob',
        email: 'bob@example.com',
        password: await bcrypt.hash('password789', 10),
        phone: '555555555',
        createdAt: new Date(),
        updatedAt: new Date(),
      },

      {
        username: 'Admin',
        email: 'admin@admin.com',
        password: await bcrypt.hash('admin', 10),
        phone: '000000000',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    return queryInterface.bulkDelete('Users', null, {});
  }
};
