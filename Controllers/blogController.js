const blogController = require("express").Router()
const Blog = require("../Schema/Blog.js")
const verifyToken = require('../middleware/auth')
const cloudinary = require("./cloudinary");
const upload = require("./multer");
blogController.get('/getAll', async (req, res) => {
    try {
        // const blogs = await Blog.find({})
        const blogs = await Blog.find({}).populate("userId", '-password')
        return res.status(200).json(blogs)
    } catch (error) {
        return res.status(500).json(error)
    }
})
blogController.post("/create", upload.single("image"),
verifyToken, 
async (req, res) => {
    try {
      const result = await cloudinary.uploader.upload(req.file.path);
      let user = new Blog({
        title: req.body.title,
        desc: req.body.desc,
        category: req.body.category,
        avatar: result.secure_url,
        cloudinary_id: result.public_id,
        userId:req.user.id
      });
      // Save user
      await user.save();
      res.json(user);
    } catch (err) {
      console.log(err);
    }
  });
blogController.get('/find/:id', async (req, res) => {
    try {
        // const blog = await Blog.findById(req.params.id);
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



// blogController.put("/updateBlog/:id", verifyToken, async (req, res) => {
//     try {
//         const blog = await Blog.findById(req.params.id)
//         if (blog.userId.toString() !== req.user.id.toString()) {
//             throw new Error("You can update only your own posts")
//         }

//         const updatedBlog = await Blog
//             .findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true })
//             .populate('userId', '-password')

//         return res.status(200).json(updatedBlog)
//     } catch (error) {
//         return res.status(500).json(error.message)
//     }
// })

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

// blogController.put('/updateBlog/:id',verifyToken, async (req, res) =>{
//   const { id } = req.params;
//   try {
//     const user = await Blog.findByIdAndUpdate(id, req.body, { new: true });
//     res.status(200).json(user);
//   } catch (err) {
//     res.status(400).json(err);
//   }
// })

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

module.exports = blogController