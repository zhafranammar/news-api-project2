const newController = require('../../controller/newController');
const { New, User } = require('../../models');
const slugify = require('slugify');

// Mocking models
jest.mock('../../models');
describe('News Controller', () => {
  describe('getAllNews', () => {
    it('should retrieve all news successfully', async () => {
      const mockNews = [{ id: 1, title: 'News 1' }, { id: 2, title: 'News 2' }];
      New.findAll.mockResolvedValue(mockNews);

      const req = {};
      const res = {
        status: jest.fn(() => res),
        json: jest.fn(),
      };

      await newController.getAllNews(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        code: 200,
        data: mockNews,
        message: 'News retrieved successfully',
      });
    });

    it('should handle error when retrieving news', async () => {
      const mockError = new Error('Database error');
      New.findAll.mockRejectedValue(mockError);

      const req = {};
      const res = {
        status: jest.fn(() => res),
        json: jest.fn(),
      };

      await newController.getAllNews(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        code: 500,
        data: null,
        message: 'Internal server error',
      });
    });
  });

  describe('getNewById', () => {
    it('should retrieve a specific news successfully', async () => {
      const mockNews = {
        id: 1,
        title: 'New 1',
        slug: 'article-1',
        publicationDate: '2024-05-16T16:46:46.894Z',
        content: 'Content of New 1',
        userId: 2,
        createdAt: '2024-05-16T16:46:46.894Z',
        updatedAt: '2024-05-16T16:46:46.894Z',
      };

      const mockAuthor = {
        id: 2,
        username: 'Alice',
        password: '$2b$10$E4FgxjblJ5lwOp2oIvATouWMECoKrx4YxGPb84t8nYxEpmNT8MO1W',
        email: 'alice@example.com',
        phone: '987654321',
        createdAt: '2024-05-16T16:46:46.755Z',
        updatedAt: '2024-05-16T16:46:46.755Z',
      };

      New.findByPk = jest.fn().mockResolvedValue(mockNews);
      User.findByPk = jest.fn().mockResolvedValue(mockAuthor);

      const req = { params: { id: 1 } };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      await newController.getNewById(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        code: 200,
        data: {
          news: expect.objectContaining({
            id: 1,
            title: 'New 1',
            slug: 'article-1',
            publicationDate: '2024-05-16T16:46:46.894Z',
            content: 'Content of New 1',
            userId: 2,
            createdAt: '2024-05-16T16:46:46.894Z',
            updatedAt: '2024-05-16T16:46:46.894Z',
          }),
          author: expect.objectContaining({
            id: 2,
            username: 'Alice',
            password: expect.any(String),
            email: 'alice@example.com',
            phone: '987654321',
            createdAt: '2024-05-16T16:46:46.755Z',
            updatedAt: '2024-05-16T16:46:46.755Z',
          }),
        },
        message: 'News retrieved successfully',
      });
    });


    it('should handle error when news is not found', async () => {
      New.findByPk.mockResolvedValue(null);

      const req = { params: { id: 1 } };
      const res = {
        status: jest.fn(() => res),
        json: jest.fn(),
      };

      await newController.getNewById(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        code: 404,
        data: null,
        message: 'News not found',
      });
    });

    it('should handle error when retrieving news', async () => {
      const mockError = new Error('Database error');
      New.findByPk.mockRejectedValue(mockError);

      const req = { params: { id: 1 } };
      const res = {
        status: jest.fn(() => res),
        json: jest.fn(),
      };

      await newController.getNewById(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        code: 500,
        data: null,
        message: 'Internal server error',
      });
    });
  });

  describe('newController.createNew', () => {
    it('should create a new news successfully', async () => {
      const mockNews = {
        id: 1,
        title: 'New 1',
        userId: 1,
        content: 'Content of New 1',
        slug: 'new-1',
        publicationDate: '2024-05-16T16:46:46.894Z',
        createdAt: '2024-05-16T16:46:46.894Z',
        updatedAt: '2024-05-16T16:46:46.894Z',
      };

      New.create = jest.fn().mockResolvedValue(mockNews);

      const req = {
        body: {
          title: 'New 1',
          userId: 1,
          content: 'Content of New 1',
        },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      await newController.createNew(req, res);

      expect(New.create).toHaveBeenCalledWith(expect.objectContaining({
        title: 'New 1',
        userId: 1,
        content: 'Content of New 1',
        slug: 'new-1',
        publicationDate: expect.any(Date),
      }));

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        code: 201,
        data: mockNews,
        message: 'News created successfully',
      });
    });

    it('should return 400 if title, userId, or content is missing', async () => {
      const req = {
        body: {
          title: 'New 1',
          userId: 1,
        },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      await newController.createNew(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        code: 400,
        data: null,
        message: 'Title, userId, and content are required',
      });
    });

    it('should return 500 if an error occurs during creation', async () => {
      New.create = jest.fn().mockRejectedValue(new Error('Internal server error'));

      const req = {
        body: {
          title: 'New 1',
          userId: 1,
          content: 'Content of New 1',
        },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      await newController.createNew(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        code: 500,
        data: null,
        message: 'Internal server error',
      });
    });
  });

  describe('newController.updateNew', () => {
    it('should update the news successfully', async () => {
      const mockNews = {
        id: 1,
        title: 'Old Title',
        content: 'Old Content',
        userId: 1,
        update: jest.fn().mockResolvedValue(),
      };
      const updatedNews = {
        id: 1,
        title: 'New Title',
        content: 'New Content',
        userId: 1,
        createdAt: '2024-05-16T16:46:46.894Z',
        updatedAt: '2024-05-16T16:46:46.894Z',
      };

      New.findByPk = jest.fn()
        .mockResolvedValueOnce(mockNews) // For initial find
        .mockResolvedValueOnce(updatedNews); // For find after update

      const req = {
        params: { id: 1 },
        body: { title: 'New Title', content: 'New Content' },
        user: { userId: 1 },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      await newController.updateNew(req, res);

      expect(New.findByPk).toHaveBeenCalledWith(1);
      expect(mockNews.update).toHaveBeenCalledWith({
        title: 'New Title',
        content: 'New Content',
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        code: 200,
        data: updatedNews,
        message: 'News updated successfully',
      });
    });

    it('should return 404 if the news is not found', async () => {
      New.findByPk = jest.fn().mockResolvedValue(null);

      const req = {
        params: { id: 1 },
        body: { title: 'New Title', content: 'New Content' },
        user: { userId: 1 },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      await newController.updateNew(req, res);

      expect(New.findByPk).toHaveBeenCalledWith(1);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        code: 404,
        data: null,
        message: 'News not found',
      });
    });

    it('should return 403 if the user is not authorized to update the news', async () => {
      const mockNews = {
        id: 1,
        title: 'Old Title',
        content: 'Old Content',
        userId: 2,
        update: jest.fn(),
      };

      New.findByPk = jest.fn().mockResolvedValue(mockNews);

      const req = {
        params: { id: 1 },
        body: { title: 'New Title', content: 'New Content' },
        user: { userId: 1 },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      await newController.updateNew(req, res);

      expect(New.findByPk).toHaveBeenCalledWith(1);
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        code: 403,
        data: null,
        message: 'You are not authorized to update this news',
      });
    });

    it('should return 500 if an error occurs during the update', async () => {
      const mockNews = {
        id: 1,
        title: 'Old Title',
        content: 'Old Content',
        userId: 1,
        update: jest.fn().mockRejectedValue(new Error('Internal server error')),
      };

      New.findByPk = jest.fn().mockResolvedValue(mockNews);

      const req = {
        params: { id: 1 },
        body: { title: 'New Title', content: 'New Content' },
        user: { userId: 1 },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      await newController.updateNew(req, res);

      expect(New.findByPk).toHaveBeenCalledWith(1);
      expect(mockNews.update).toHaveBeenCalledWith({
        title: 'New Title',
        content: 'New Content',
      });
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        code: 500,
        data: null,
        message: 'Internal server error',
      });
    });
  });

  describe('newController.deleteNew', () => {
    it('should delete the news successfully', async () => {
      const mockNews = {
        id: 1,
        userId: 1,
        destroy: jest.fn().mockResolvedValue(),
      };

      New.findByPk = jest.fn().mockResolvedValue(mockNews);

      const req = {
        params: { id: 1 },
        user: { userId: 1 },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      await newController.deleteNew(req, res);

      expect(New.findByPk).toHaveBeenCalledWith(1);
      expect(mockNews.destroy).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        code: 200,
        data: null,
        message: 'News deleted successfully',
      });
    });

    it('should return 404 if the news is not found', async () => {
      New.findByPk = jest.fn().mockResolvedValue(null);

      const req = {
        params: { id: 1 },
        user: { userId: 1 },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      await newController.deleteNew(req, res);

      expect(New.findByPk).toHaveBeenCalledWith(1);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        code: 404,
        data: null,
        message: 'News not found',
      });
    });

    it('should return 403 if the user is not authorized to delete the news', async () => {
      const mockNews = {
        id: 1,
        userId: 2,
        destroy: jest.fn(),
      };

      New.findByPk = jest.fn().mockResolvedValue(mockNews);

      const req = {
        params: { id: 1 },
        user: { userId: 1 },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      await newController.deleteNew(req, res);

      expect(New.findByPk).toHaveBeenCalledWith(1);
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        code: 403,
        data: null,
        message: 'You are not authorized to delete this news',
      });
    });

    it('should return 500 if an error occurs during deletion', async () => {
      const mockNews = {
        id: 1,
        userId: 1,
        destroy: jest.fn().mockRejectedValue(new Error('Internal server error')),
      };

      New.findByPk = jest.fn().mockResolvedValue(mockNews);

      const req = {
        params: { id: 1 },
        user: { userId: 1 },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      await newController.deleteNew(req, res);

      expect(New.findByPk).toHaveBeenCalledWith(1);
      expect(mockNews.destroy).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        code: 500,
        data: null,
        message: 'Internal server error',
      });
    });
  });

  describe('newController.getNewsByAuthor', () => {
    it('should retrieve news by author successfully', async () => {
      const mockNews = [
        { id: 1, title: 'News 1', userId: 1, content: 'Content of News 1' },
        { id: 2, title: 'News 2', userId: 1, content: 'Content of News 2' },
      ];

      New.findAll = jest.fn().mockResolvedValue(mockNews);

      const req = {
        user: { userId: 1 },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      await newController.getNewsByAuthor(req, res);

      expect(New.findAll).toHaveBeenCalledWith({ where: { userId: 1 } });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        code: 200,
        data: mockNews,
        message: 'News retrieved successfully',
      });
    });

    it('should return 500 if an error occurs', async () => {
      New.findAll = jest.fn().mockRejectedValue(new Error('Internal server error'));

      const req = {
        user: { userId: 1 },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      await newController.getNewsByAuthor(req, res);

      expect(New.findAll).toHaveBeenCalledWith({ where: { userId: 1 } });
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        code: 500,
        data: req.user,
        message: 'Internal server error',
      });
    });
  });
});
