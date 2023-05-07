const express = require("express") // express 사용 선언
const router = express.Router(); //Router 사용 선언
const authMiddleware = require("../middlewares/auth-middleware")


// ◎ 게시글 작성 ◎
const Posts = require("../schemas/posts.js")
router.post("/posts/", authMiddleware, async (req, res) => {

  try {
    const posts = await Posts.find({});
    const { userId, nickname } = res.locals.user;
    const { title, content } = req.body;

    if (typeof title !== 'string' || title === '') {
      return res.status(412).json({ 'message': '제목을 확인해 주세요' })
    }
    if (typeof content !== 'string' || content === "") {
      return res.status(412).json({ 'message': '작성 내용을 확인해 주세요' })
    }

    const newPostId = posts[posts.length - 1].postId + 1
    // 작성될 게시글의 newPostId 설정( 마지막에 등록된 게시글의 postId + 1 )
    const postId = posts.length ? newPostId : 1
    // 현재 게시글이 없다면 새 게시글의 postId는 1, 현재 게시글이 있다면 newPostId
    await Posts.create({ postId, userId, nickname, title, content });
    // db 생성 및 저장

    res.status(201).json({ "message": "게시글을 생성하였습니다." })

  } catch (error) {
    res.status(400).json({ message: "게시글 등록 실패" });
    console.error(error)
  }
})

// ◎ 전체 게시글 목록조회 ◎
router.get("/posts", async (req, res) => {
  //게시글 목록을 배열 형태로 내림차순으로 반환
  const posts = await Posts.find({}).sort({ createdAt: -1 })

  const results = posts.map(post => {
    return {
      "postId": post.postId,
      "title": post.title,
      "nickname": post.nickname,
      "content": post.content,
      "createdAt": post.createdAt,
    }
  })
  res.status(200).json({ "posts": results });
});

// ◎ (특정)게시글 상세조회 ◎
router.get("/posts/:_postId", async (req, res) => {
  try {
    const { _postId } = req.params;
    // params로 전달받은 postId와 일치하는 게시글 조회
    const [post] = await Posts.find({ postId: _postId });

    let result = {};
    if (post) {
      result = {
        "postId": post.postId,
        "title": post.title,
        "nickname": post.nickname,
        "content": post.content,
        "createdAt": post.createdAt,
      }
      res.status(200).json({ "post": result })
    } else if (!post) {
      // 전달받은 postId 와 일치하는 게시글이 없을 경우
      res.status(400).json({ "message": "게시글 번호를 확인하시기 바랍니다." })
      return;
    }
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: "게시글 상세조회에 실패하였습니다." });
  }
})

// ◎ 게시글 수정 ◎
router.put("/posts/:_postId", authMiddleware, async (req, res) => {
  try {
    const { userId } = res.locals.user;
    const { _postId } = req.params; // param으로 수정하려는 게시글의 postId를 받아 postId에 할당.
    const { title, content } = req.body;


    // 전체 게시글중 받아온 postId와 로그인한 userId가 일치하는 게시글이 있다면 targetPost에 할당. 
    // 해당 userId를 가진 사용자가 작성한 게시글만 조회하게 됨.
    let targetPost = await Posts.findOne({ postId: _postId, userId: userId })

    // targetPost가 존재하고 title, content를 빈칸없이 전달받았다면,
    if (targetPost && title && content) {  // 게시글 수정 및 메시지 전달 
      targetPost.title = title
      targetPost.content = content
      await targetPost.save()
      res.status(200).json({ message: "게시글을 수정하였습니다." });
    }

    // title이나 content가 입력되지 않았다면 해당 메시지 전달
    else if (!title || !content) {
      res.status(400).json({ message: "데이터 형식이 올바르지 않습니다." });
    }  // 로그인한 유저가 작성하지 않은 게시글이나 부재하는 게시글에 접근하려는 경우
    else if (!targetPost) {
      res.status(404).json({ message: "게시글 수정 권한이 없거나 게시글이 존재하지 않습니다." });
    }
  } catch (error) {  // 예상치 못한 에러대응
    console.error(error);
    res.status(400).json({ message: "게시글 수정에 실패하였습니다." });
  }
})


//  ◎ 게시글 삭제 ◎
router.delete("/posts/:_postId", authMiddleware, async (req, res) => {
  try {
    const { _postId } = req.params;
    const { userId } = res.locals.user;
    // 전체 게시글중 받아온 postId와 로그인한 userId가 일치하는 게시글이 있다면 targetPost에 할당. 
    // 해당 userId를 가진 사용자가 작성한 게시글만 조회하게 됨.
    const [targetPost] = await Posts.find({ postId: _postId, userId: userId });
    if (targetPost) {
      await Posts.deleteOne({ postId: _postId, userId: userId })
      res.json({ message: "게시글을 삭제하였습니다." });
    } // 로그인한 유저가 작성하지 않은 게시글이나 부재하는 게시글에 접근하려는 경우
    else if (!targetPost) {
      res.status(404).json({ message: "게시글이 존재하지 않거나 게시글 수정 권한이 없습니다." });
    }
  } catch (error) { //예상치 못한 에러 대응
    console.error(error);
    res.status(400).json({ message: "게시글 삭제에 실패하였습니다." });
  }
})

module.exports = router

