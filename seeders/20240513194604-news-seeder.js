'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    function generateRandomNews(n) {
      const articles = [];
      for (let i = 0; i < n; i++) {
        const article = {
          title: `New ${i + 1}`,
          slug: `article-${i + 1}`,
          content: `Content of New ${i + 1}`,
          publicationDate: new Date(),
          userId: Math.floor(Math.random() * 4) + 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        articles.push(article);
      }
      return articles;
    }

    const randomNews = generateRandomNews(10);
    await queryInterface.bulkInsert('News', randomNews);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('News', null, {});
  }
};
