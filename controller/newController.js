const { User, New } = require('../models');
const slugify = require('slugify');

const newController = {
  getAllNews: async (req, res) => {
    try {
      const news = await New.findAll();
      res.status(200).json({
        code: 200,
        data: news,
        message: 'News retrieved successfully'
      });
    } catch (err) {
      res.status(500).json({
        code: 500,
        data: null,
        message: 'Internal server error'
      });
    }
  },

  getNewById: async (req, res) => {
    try {
      const news = await New.findByPk(req.params.id);
      if (!news) {
        return res.status(404).json({
          code: 404,
          data: null,
          message: 'News not found'
        });
      }
      const author = await User.findByPk(news.userId);
      res.status(200).json({
        code: 200,
        data: { news, author },
        message: 'News retrieved successfully'
      });
    } catch (err) {
      res.status(500).json({
        code: 500,
        data: null,
        message: 'Internal server error'
      });
    }
  },

  createNew: async (req, res) => {
    try {
      const { title, userId, content } = req.body;
      if (!title || !userId || !content) {
        return res.status(400).json({
          code: 400,
          data: null,
          message: 'Title, userId, and content are required'
        });
      }

      const news = await New.create({
        title,
        userId,
        content,
        slug: slugify(title, { lower: true, strict: true }),
        publicationDate: new Date(),
      });

      res.status(201).json({
        code: 201,
        data: news,
        message: 'News created successfully'
      });
    } catch (err) {
      res.status(500).json({
        code: 500,
        data: null,
        message: 'Internal server error'
      });
    }
  },

  updateNew: async (req, res) => {
    try {
      const { id } = req.params;
      const { title, content } = req.body;

      // Temukan berita yang akan diperbarui
      const news = await New.findByPk(id);
      if (!news) {
        return res.status(404).json({
          code: 404,
          data: null,
          message: 'News not found'
        });
      }

      // Periksa apakah pengguna yang memperbarui berita adalah pembuat berita yang sesuai
      if (news.userId !== req.user.userId) {
        return res.status(403).json({
          code: 403,
          data: null,
          message: 'You are not authorized to update this news'
        });
      }

      // Lakukan pembaruan berita
      await news.update({ title, content });

      // Ambil berita yang diperbarui setelah pembaruan
      const updatedNews = await New.findByPk(id);

      res.status(200).json({
        code: 200,
        data: updatedNews,
        message: 'News updated successfully'
      });
    } catch (err) {
      res.status(500).json({
        code: 500,
        data: null,
        message: 'Internal server error'
      });
    }
  },

  deleteNew: async (req, res) => {
    try {
      const { id } = req.params;
      const news = await New.findByPk(id);

      // Periksa apakah berita ditemukan
      if (!news) {
        return res.status(404).json({
          code: 404,
          data: null,
          message: 'News not found'
        });
      }

      // Periksa apakah pengguna yang sedang mencoba menghapus berita adalah pembuat berita
      if (news.userId !== req.user.userId) {
        return res.status(403).json({
          code: 403,
          data: null,
          message: 'You are not authorized to delete this news'
        });
      }

      // Lakukan penghapusan berita jika semua validasi berhasil
      await news.destroy();

      res.status(200).json({
        code: 200,
        data: null,
        message: 'News deleted successfully'
      });
    } catch (err) {
      res.status(500).json({
        code: 500,
        data: null,
        message: 'Internal server error'
      });
    }
  },
  getNewsByAuthor: async (req, res) => {
    console.log(req.user)
    try {
      const news = await New.findAll({ where: { userId: req.user.userId } });
      res.status(200).json({
        code: 200,
        data: news,
        message: 'News retrieved successfully'
      });
    } catch (err) {
      res.status(500).json({
        code: 500,
        data: req.user,
        message: 'Internal server error'
      });
    }
  },
};

module.exports = newController;
