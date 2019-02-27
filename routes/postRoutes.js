const mongoose = require('mongoose');
const requireLogin = require('../middlewares/requireLogin');
const cleanCache = require('../middlewares/cleanCache');
const Blog = mongoose.model('Blog');
const uuidv1 = require('uuid/v1');

module.exports = app => {
    app.get('/api/blogs/:id', async (req, res) => {
        const blog = await Blog.findOne({
            _user: req.user.id,
            _id: req.params.id
        });

        res.send(blog);
    });

    app.get('/api/posts', async (req, res) => {
        const blogs = await Blog.find();

        res.send(blogs);
    });

    app.post('/api/posts', cleanCache, async (req, res) => {
        const { title, content } = req.body;

        const blog = new Blog({
            title,
            content,
            // _user: uuidv1()
        });

        try {
            await blog.save();
            res.send(blog);
            console.log('done')
        } catch (err) {
            res.send(400, err);
        }
    });

    app.delete("/api/posts/:id", async (req, res, next) => {
        try {
            await Blog.deleteOne({ _id: req.params.id });
            res.status(200).json({ message: "Post deleted!" });
        } catch (err) {
            res.send(400, err);
        }
    });
};
