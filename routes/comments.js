const express = require("express") // express 사용 선언
const router = express.Router(); //Router 사용 선언
const authMiddleware = require("../middlewares/auth-middleware")

const Posts = require("../schemas/posts.js")
const Comments = require("../schemas/comments.js")

// ◎  댓글 작성  ◎
router.post("/posts/:_postId/comments/", authMiddleware, async (req, res) => {
  try {
    // 로그인 여부 확인하는 미들웨어를 통과했을 시 userId, postId, content 전달받음.
    const comments = await Comments.find({});
    const { userId } = res.locals.user;
    const { _postId } = req.params;
    const { content } = req.body;
    // 전달받은 postId에 해당되는 게시글이 있는지 확인
    const [post] = await Posts.find({ postId: _postId });
    // commentId 생성: 기존 댓글들중 마지막 댓글의 commentId + 1 할당
    // 기존 댓글이 아예 없을 경우 1 할당
    const newcommentId = comments.length === 0 ? 1 : comments[comments.length - 1].commentId + 1

    //content 가 입력되고 params로 전달받은 postId를 가진 게시글이 존재한다면.
    if (content && post) {
      await Comments.create({ commentId: newcommentId, postId: _postId, userId: userId, content });
      res.status(201).json({ "message": "댓글을 생성하였습니다." })
      return
    } else if (content === "") {
      res.status(400).send("댓글 내용을 입력해주세요")
    } else {
      res.status(400).send("데이터 형식이 올바르지 않습니다.")
    }
  } catch (error) {
    res.status(400).json({ message: "댓글 작성에 실패하였습니다." });
    console.error(error)
  }
})

// ◎ 댓글 목록조회 ◎
router.get("/posts/:_postId/comments", async (req, res) => {

  try {
    const { _postId } = req.params;
    // params로 전달받은 postId에 대한 댓글만 찾아 내림차순으로 배열에 할당
    const comments = await Comments.find({ postId: _postId }).sort({ createdAt: -1 });

    // 해당 댓글객체들에서 필요 키만 추출해 새로 배열에 넣음
    let result = comments.map((comment) => {
      return {
        "commentId": comment.commentId,
        "postId": comment.postId,
        "userId": comment.userId,
        "content": comment.content,
        "createdAt": comment.createdAt,
        "updatedAt": comment.updatedAt
      }
    })
    if (comments.length) { res.status(200).json({ comments: result }) }
    else { res.status(200).json({ message: "데이터 형식이 올바르지 않습니다." }) }

  } catch (error) {
    res.status(400).json({ message: "댓글 조회에 실패하였습니다." });
    console.error(error)
  }
});

// ◎ 댓글 수정 ◎
router.put("/posts/:_postId/comments/:_commentId", authMiddleware, async (req, res) => {
  try {
    const { userId } = res.locals.user;
    const { _postId } = req.params;
    const { _commentId } = req.params;
    const { content } = req.body;

    // 전달받은 postId, commentId, userId와 일치하는 댓글 조회: 즉 로그인한 사용자가 작성한 댓글인지 여부확인
    const [comment] = await Comments.find({ postId: _postId, commentId: _commentId, userId: userId });
    // 그러한 댓글이 있다면 수정
    if (comment && content) {
      await Comments.updateOne({ commentId: _commentId },
        { $set: { content: content } }
      )
      res.status(200).json({ message: "댓글을 수정하였습니다." });
    } // twoIdMatch 가 true이고 targetComment가 존재하고, 내용입력을 했을 때 댓글을 수정함.
    else if (content === "") {
      res.status(400).json({ message: "댓글 내용을 입력해주세요" });
    } else if (!comment) {
      res.status(404).json({ message: "수정 권한이 없거나 댓글이 존재하지 않습니다." });
    } else { res.status(400).json({ message: "데이터 형식이 올바르지 않습니다." }); }

  } catch (error) {
    res.status(400).json({ message: "댓글 수정에 실패하였습니다." });
    console.error(error)
  }
})

// ◎ 댓글 삭제 ◎
router.delete("/posts/:_postId/comments/:_commentId", authMiddleware, async (req, res) => {
  try {
    const comments = await Comments.find({});
    const { userId } = res.locals.user;
    const { _postId } = req.params;
    const { _commentId } = req.params;

    // 전달받은 postId, commentId, userId와 일치하는 댓글 조회: 즉 로그인한 사용자가 작성한 댓글인지 여부확인
    const [comment] = await Comments.find({ postId: _postId, commentId: _commentId, userId: userId });

    // 그러한 댓글이 있다면 삭제
    if (comment) {
      await Comments.deleteOne({ commentId: _commentId })
      res.status(200).json({ message: "댓글을 삭제하였습니다." });
    } else if (!comment) {
      res.status(404).json({ message: "삭제 권한이 없거나 댓글이 존재하지 않습니다." });
    }
  } catch (error) {
    res.status(400).json({ message: "댓글 삭제에 실패하였습니다." });
    console.error(error)
  }
})

module.exports = router
