const express = require("express") // express 사용 선언
const router = express.Router(); //Router 사용 선언
const authMiddleware = require("../middlewares/auth-middleware")
const { Posts, Users } = require("../models")

// ◎ 게시글 작성 ◎
router.post("/posts/", authMiddleware, async (req, res) => { // 로그인을 확인하는 authMiddleware를 거침.
  try {
    // authMiddleware 에서 userId, nickname 을 body 에서 title, content를 가져온다.
    const { userId, nickname } = res.locals.user;
    const { title, content } = req.body;

    if (typeof title !== 'string' || title === '') {
      return res.status(412).json({ 'message': '제목을 확인해 주세요' })
    }
    if (typeof content !== 'string' || content === "") {
      return res.status(412).json({ 'message': '작성 내용을 확인해 주세요' })
    }
    // posts 테이블에 userId 등 데이터 저장
    const post = await Posts.create({ userId: userId, title, content });
    res.status(201).json({ "data": post })

  } catch (error) {
    res.status(400).json({ message: "게시글 등록 실패" });
    console.error(error)
  }
})

// ◎ 전체 게시글 목록조회 ◎
router.get("/posts", async (req, res) => {
  try {
    //게시글 데이터 전체를 attributes에 명시된 컬럼만 내림차순으로 반환
    const allPosts = await Posts.findAll({
      attributes: ['postId', 'title', 'createdAt'],
      include: [{
        model: Users,
        attributes: ["userId", "nickname"]
      }],
      order: [['createdAt', 'DESC']],
    })

    if (allPosts) {
      // allPosts 값 보기좋게 정리하여 result에 재할당
      result = allPosts.map((post) => {
        return {
          "postId": post.postId,
          "userId": post.User.userId,
          "nickname": post.User.nickname,
          "title": post.title,
          "createdAt": post.createdAt,
        }
      })
      res.status(200).json({ "Posts": result });
    } else if (!allPosts) {
      res.status(400).json({ message: "게시글이 존재하지 않습니다." });
    }
  } catch (error) {
    console.error(error)
    res.status(400).json({ message: "게시글 목록 조회 실패" });
  }
});

// ◎ (특정)게시글 상세조회 ◎
router.get("/posts/:_postId", async (req, res) => {
  try {
    const { _postId } = req.params;
    // params로 전달받은 postId와 일치하는 게시글에서 attributes에 명시된 컬럼만 할당
    const post = await Posts.findOne({
      attributes: ["postId", "title", "content", "createdAt"],
      include: [{
        model: Users,
        attributes: ["userId", "nickname"]
      }],
      where: { postId: _postId }
    });

    if (!post) {
      // 전달받은 postId 와 일치하는 게시글이 없을 경우
      res.status(400).json({ "message": "게시글 번호를 확인하시기 바랍니다." })
      return;
    }
    else if (post) {
      // post 값 보기좋게 정리하여 result 에 재할당
      result = {
        "postId": post.postId,
        "userId": post.User.userId,
        "nickname": post.User.nickname,
        "title": post.title,
        "content": post.content,
        "createdAt": post.createdAt
      }
      res.status(200).json({ "post": result })
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
    let targetPost = await Posts.findOne({ where: { postId: _postId, userId: userId } })

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
    const targetPost = await Posts.findOne({ where: { postId: _postId, userId: userId } });
    if (targetPost) {
      await Posts.destroy({ where: { postId: _postId, userId: userId } })
      res.json({ message: "게시글을 삭제하였습니다." });
    } // 로그인한 유저가 작성하지 않은 게시글이나 부재하는 게시글에 접근하려는 경우
    else if (!targetPost) {
      res.status(404).json({ message: "게시글이 존재하지 않거나 게시글 삭제 권한이 없습니다." });
    }
  } catch (error) { //예상치 못한 에러 대응
    console.error(error);
    res.status(400).json({ message: "게시글 삭제에 실패하였습니다." });
  }
})

module.exports = router

