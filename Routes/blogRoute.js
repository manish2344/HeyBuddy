const blogController = require("express").Router()
const Blog = require("../Schema/Blog.js")
const verifyToken = require('../middleware/auth.js')
const tagSchema = require("../Schema/tagschema.js");
const { v4: uuid } = require("uuid");
blogController.get('/getAll', async (req, res) => {
    try {
        
        const blogs = await Blog.find({}).populate("userId", '-password')
        return res.status(200).json(blogs)
    } catch (error) {
        return res.status(500).json(error)
    }
})
blogController.post("/create", 
verifyToken, 
async (req, res) => {
    const { tags } = req.body;

    const tag = await tags.map((e) => {
      return {
        name: e.trim(),
      };
    });
    try {
         let user = new Blog({
        title: req.body.title,
        desc: req.body.desc,
        category: req.body.category,
        userId:req.user.id,
        tags: tags.map(e => e.replace(/\s+/g, ''))
      });
      
      await user.save();
      await tagSchema.insertMany(tag, { ordered: false });
      res.json(user);
    } catch (err) {
      console.log(err);
    }
  });

  blogController.get("/tags",  async (req, res) => {
    try {
      const count = await Blog.aggregate([
        { $project: { tags: 1 } },
        { $unwind: "$tags" },
        { $group: { _id: "$tags", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]);
      res.json({ tag: count });
    } catch (error) {
      res.json({ error: error.message });
    }
  })

  blogController.get("/searchTags", async (req, res) => {
    try {
      const { search } = req.query;
      const data = await Blog.aggregate([
        { $project: { tags: 1 } },
        { $unwind: "$tags" },
        { $group: { _id: "$tags", count: { $sum: 1 } } },
        { $match: { _id: { $regex: search, $options: "i" } } },
        { $sort: { count: -1 } },
      ]);
      res.json({ tag: data });
    } catch (error) {
      res.json({ error: error.message });
    }
  })
 
  blogController.post("/comment/:id", async (req, res) => {
  
    try {
      const comment = {
        comment: req.body.comment,
        userId: req.body.user.id,
        userName: req.body.name,
        createdAt: Date.now(),
        commentId: uuid(),
      };
      await Blog.updateOne(
        { _id: req.params.id },
        { $push: { replies: comment } }
      );

      const data = await Blog.findOne({ _id: req.params.id });
      res.json({ data: data });
    } catch (error) {
      res.json({ error: error.message });
    }
  })
  blogController.post("/comment/delete/:id", async (req, res) => {
    try {
      await Blog.updateOne(
        { _id: req.params.id },
        {
          $pull: {
            replies: { commentId: req.body.commentId, userId: req.body.user.id },
          },
        }
      );

      const data = await Blog.findOne({ _id: req.params.id });
      res.json({ data: data });
    } catch (error) {
      res.json({ error: error.message });
    }
  })



blogController.get('/find/:id', async (req, res) => {
    try {
          const blog = await Blog.findById(req.params.id).populate("userId", '-password')
        blog.views += 1
        await blog.save()
        return res.status(200).json(blog)
    } catch (error) {
        return res.status(500).json(error)
    }
})

blogController.get('/featured', async (req, res) => {
    try {
        const blogs = await Blog.find({ featured: true }).populate("userId", '-password').limit(3)
        return res.status(200).json(blogs)
    } catch (error) {
        return res.status(500).json(error)
    }
})

blogController.post('/', 
// verifyToken,
 async (req, res) => {
    try {
        const blog = await Blog.create({ ...req.body, userId: req.user.id })
        return res.status(201).json(blog)
    } catch (error) {
        return res.status(500).json(error.message)
    }
})

blogController.put('/likeBlog/:id', verifyToken, async (req, res) => {
    try {
        const blog = await Blog.findById(req.params.id)
        if(blog.likes.includes(req.user.id)){
            blog.likes = blog.likes.filter((userId) => userId !== req.user.id)
            await blog.save()

            return res.status(200).json({msg: 'Successfully unliked the blog'})
        } else {
            blog.likes.push(req.user.id)
            await blog.save()

            return res.status(200).json({msg: "Successfully liked the blog"})
        }

    } catch (error) {
        return res.status(500).json(error)
    }
})

blogController.put("/updateBlog/:id", verifyToken, async (req, res) => {
    try {
        const blog = await Blog.findById(req.params.id)
        if (blog.userId.toString() !== req.user.id.toString()) {
            throw new Error("You can update only your own posts")
        }

        const updatedBlog = await Blog
            .findByIdAndUpdate(req.params.id, req.body , { new: true })
            .populate('userId', '-password')

        return res.status(200).json(updatedBlog)
    } catch (error) {
        return res.status(500).json(error.message)
    }
})



blogController.delete('/deleteBlog/:id', verifyToken, async(req, res) => {
    try {
        const blog = await Blog.findById(req.params.id)
        if(blog.userId.toString() !== req.user.id.toString()){
            throw new Error("You can delete only your own posts")
        }
        
        await Blog.findByIdAndDelete(req.params.id)

        return res.status(200).json({msg: "Successfully deleted the blog"})
    } catch (error) {
        return res.status(500).json(error)
    }
})


blogController.delete("/tags/:id", async (req, res) => {
    try {
      const data = await Blog
        .find({ tags: req.params.id })
        .sort({ answer: -1 });
      res.json({ data: data });
    } catch (error) {
      res.json({ error: error.message });
    }
  })

  blogController.delete("/tags/f/:id",async (req, res) => {
    try {
      const data = await Blog
        .find({ tags: req.params.id })
        .sort({ upVote: -1 });
      res.json({ data: data });
    } catch (error) {
      res.json({ error: error.message });
    }
  })

  blogController.delete("/tags/i/:id", async (req, res) => {
    try {
      const data = await Blog
        .find({ tags: req.params.id })
        .sort({ answer: -1 });
      res.json({ data: data });
    } catch (error) {
      res.json({ error: error.message });
    }
  })


module.exports = blogController