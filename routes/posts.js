const express = require("express");
const { db } = require("../config/firebase");
const verifyToken = require("../middleware/authMiddleware");
const { Timestamp } = require("firebase-admin/firestore");

const router = express.Router();

// ✅ Middleware to Validate Post Data
const validatePostData = (req, res, next) => {
  const { title, description } = req.body;
  if (!title || !description) {
    return res
      .status(400)
      .json({ error: "Title and description are required" });
  }
  next();
};

// ✅ Add a New Post (Equivalent to /addPost)
router.post("/addPost", validatePostData, async (req, res) => {
  const { title, description } = req.body;

  try {
    const newPost = {
      title,
      description,
      //   likes: [], // Array to store user IDs who liked the post
      timestamp: Timestamp.now(),
    };

    const postRef = await db.collection("posts").add(newPost);
    res.status(201).json({ id: postRef.id, ...newPost });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Failed to create post", details: error.message });
  }
});

// ✅ Get All Posts (Equivalent to /getPost)
router.get("/getPost", async (req, res) => {
  try {
    const postsSnapshot = await db
      .collection("posts")
      .orderBy("timestamp", "desc")
      .get();
    const posts = postsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    res.status(200).json(posts);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Failed to fetch posts", details: error.message });
  }
});

// ✅ Get a Single Post by ID
router.get("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const postRef = db.collection("posts").doc(id);
    const post = await postRef.get();

    if (!post.exists) {
      return res.status(404).json({ error: "Post not found" });
    }

    res.status(200).json({ id: post.id, ...post.data() });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Failed to fetch post", details: error.message });
  }
});

// ✅ Update a Post (Only Owner)
router.put("/updatePost/:id", async (req, res) => {
  const { id } = req.params;
  const { title, description } = req.body;

  try {
    const postRef = db.collection("posts").doc(id);
    const post = await postRef.get();

    if (!post.exists) {
      return res.status(404).json({ error: "Post not found" });
    }

    await postRef.update({ title, description, timestamp: new Date() });

    res.status(200).json({ id, title, description });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Failed to update post", details: error.message });
  }
});

// ✅ Delete a Post (Public)
router.delete("/deletePost/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const postRef = db.collection("posts").doc(id);
    const post = await postRef.get();

    if (!post.exists) {
      return res.status(404).json({ error: "Post not found" });
    }

    await postRef.delete();
    res.status(200).json({ message: "Post deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Failed to delete post", details: error.message });
  }
});

module.exports = router;
