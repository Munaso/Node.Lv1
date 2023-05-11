const express = require("express") // express 사용 선언
const router = express.Router(); //Router 사용 선언
const authMiddleware = require("../middlewares/auth-middleware")
const { Posts, Users, Comments } = require("../models")

// ◎ 댓글 작성 ◎
router.post("/posts/:_postId/comments", authMiddleware, async (req, res) => { // 로그인을 확인하는 authMiddleware를 거침.
    try {
      // authMiddleware 에서 userId, nickname 을 body 에서 title, content를 가져온다.
      const { userId } = res.locals.user;
      const { _postId } = req.params;
      const { title, comment } = req.body;

      if (typeof comment !== 'string' || comment === "") {
        return res.status(412).json({ 'message': '작성 내용을 확인해 주세요' })
      }
      // posts 테이블에 userId, nickname 등 데이터 저장
      const commentResult = await Comments.create({ userId, postId: _postId, title, comment });
      res.status(201).json({ "data": commentResult, "message":"댓글 작성 성공" })
  
    } catch (error) {
      res.status(400).json({ message: "댓글 등록 실패" });
      console.error(error)
    }
  })


module.exports = router
