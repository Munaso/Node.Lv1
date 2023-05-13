const express = require("express") // express 사용 선언
const router = express.Router(); //Router 사용 선언
const authMiddleware = require("../middlewares/auth-middleware")
const { Posts, Users, Comments } = require("../models")

// ◎ 댓글 작성 ◎
router.post("/posts/:_postId/comments", authMiddleware, async (req, res) => { 
  try {
    // authMiddleware 에서 userId, nickname 을 body 에서 title, content를 가져온다.
    const { userId } = res.locals.user;
    const { _postId } = req.params;
    const { title, comment } = req.body;
    const targetPost = await Posts.findOne({ where: { postId: _postId } });


    if (typeof comment !== 'string' || comment === "") {
      return res.status(412).json({ 'message': '작성 내용을 확인해 주세요' })
    }
    if (!targetPost) {
      return res.status(412).json({ 'message': '대상 게시글이 없습니다.' })
    }

    const commentResult = await Comments.create({ userId, postId: _postId, title, comment });
    res.status(201).json({ "data": commentResult, "message": "댓글 작성 성공" })

  } catch (error) {
    res.status(400).json({ message: "댓글 등록 실패" });
    console.error(error)
  }
})


// ◎  댓글 조회 ◎
router.get("/posts/:_postId/comments", async (req, res) => {
  const { _postId } = req.params;
  
  const targetPost = await Posts.findOne({ where: { postId: _postId } });
  if (!targetPost) {
    return res.status(412).json({ 'message': '댓글 조회할 게시글이 없습니다.' })
  }

  const comments = await Comments.findAll({
    attributes: ['commentId', 'comment', 'createdAt', 'updatedAt'],
    include: [{
      model: Users,
      attributes: ["userId", "nickname"]
    }],
    where: { postId: _postId },
    order: [['createdAt', 'DESC']],
  })

  const result = comments.map((comment) => {
    return {
      "commentId": comment.commentId,
      "userId": comment.User.userId,
      "nickname": comment.User.nickname,
      "comment": comment.comment,
      "createdAt": comment.createdAt,
      "updatedAt": comment.updatedAt,
    }
  })

  res.status(200).json({ "comments": result });
});



// ◎  댓글 수정 ◎
router.put("/posts/:_postId/comments/:_commentId", authMiddleware, async (req, res) => {
  const { userId } = res.locals.user;
  const { _postId } = req.params;
  const { _commentId } = req.params;
  const { comment } = req.body;

  const targetComment = await Comments.findOne({ where: { postId: _postId, commentId: _commentId } });
  if (!targetComment) {
    return res.status(412).json({ 'message': '수정할 댓글이 존재하지 않습니다.' })
  }
  if (targetComment.userId !== userId) {
    return res.status(412).json({ 'message': '댓글 수정 권한이 존재하지 않습니다.' })
  }
  if (!comment) {
    return res.status(412).json({ 'message': '데이터 형식이 올바르지 않습니다.' })
  }

  // targetComment 가 존재하고 댓글 작성자가 로그인했다면
  if (targetComment && targetComment.userId === userId) {  // 댓글 수정 및 메시지 전달 
    targetComment.comment = comment
    await targetComment.save()
    res.status(200).json({ message: "댓글을 수정하였습니다." });
  }
});


// ◎  댓글 삭제 ◎
router.delete("/posts/:_postId/comments/:_commentId", authMiddleware, async (req, res) => {
  const { userId } = res.locals.user;
  const { _postId } = req.params;
  const { _commentId } = req.params;

  const targetComment = await Comments.findOne({ where: { postId: _postId, commentId: _commentId } });
  if (!targetComment) {
    return res.status(412).json({ 'message': '삭제할 댓글이 존재하지 않습니다.' })
  }
  if (targetComment.userId !== userId) {
    return res.status(412).json({ 'message': '댓글 삭제 권한이 존재하지 않습니다.' })
  }
  // targetComment 가 존재하고 댓글 작성자가 로그인했다면
  if (targetComment && targetComment.userId === userId) {  // 댓글 삭제 및 메시지 전달 
    await Comments.destroy({ where: { postId: _postId, commentId: _commentId, userId: userId } })
    res.status(200).json({ message: "댓글을 삭제하였습니다." });
  }
});

module.exports = router
