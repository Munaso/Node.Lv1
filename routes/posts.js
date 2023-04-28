const express = require("express") // express 사용 선언
const router = express.Router(); //Router 사용 선언

// 게시글 작성
const Posts = require("../schemas/posts.js")
router.post("/posts/", async (req, res) => {
  const { user, password, title, content } = req.body;
  const createdPosts = await Posts.create({ user, password, title, content });
  res.status(201).json({ "message": "게시글을 생성하였습니다." })
})

// 전체 게시글 목록조회
router.get("/posts", async ( req, res) => {
  const posts = await Posts.find({});

  const results = posts.map((post) => {
    return {
      "postId": post._id,
      "user": post.user,
      "title": post.title,
      "createdAt": post.createdAt,
    }
  })
  res.status(200).json({ "data": results});
});

// (특정)게시글 상세조회
router.get("/posts/:postId", async (req, res) => {
  const posts = await Posts.find({});
  const { postId } = req.params;

  let result = {};
  for (const post of posts) {
    if (postId === post._id.valueOf()) {
      result = {
        "postId": post._id.valueOf(),
        "user": post.user,
        "title": post.title,
        "content": post.content,
        "createdAt": post.createdAt,
      }
    }
  }
  res.status(200).json({ "data": result })
})

// 게시글 수정
router.put("/posts/:postsId", async (req, res) => {
  const posts = await Posts.find({});
  console.log(posts)
  const { postsId } = req.params;
  const { password, title, content } = req.body;

  let targetPost = posts.find((post) =>
    post._id.valueOf() === postsId && post.password === password
  )
  if (targetPost) {
    await Posts.updateOne({ _id: targetPost._id },
      { $set: { title: title, content: content } }
    )
    res.status(200).json({ message: "게시글을 수정하였습니다." });
  } else {
    res.status(400).send("패스워드와 수정내용을 확인해주세요");
  }
})


// 게시글 삭제  
router.delete("/posts/:postsId", async (req, res) => {
  const posts = await Posts.find({});
  const { postsId } = req.params;
  const { password } = req.body;

  let targetPost = posts.find((post) =>
    post._id.valueOf() === postsId && post.password === password
  )
  if (targetPost) {
    await Posts.deleteOne({ _id: targetPost._id, password: password })
    res.json({ message: "게시글을 삭제하였습니다." });
  } else {
    res.status(400).send("패스워드를 확인해주세요");
  }  
})

module.exports = router
