const express = require("express") // express 사용 선언
const router = express.Router(); //Router 사용 선언


const Posts = require("../schemas/posts.js")
const Comments = require("../schemas/comments.js")

// ◎  댓글 작성  ◎
router.post("/posts/:_postId/comments/", async (req, res) => {
  const comments = await Comments.find({});
  const posts = await Posts.find({});

  const { _postId } = req.params;
  const { user, password, content } = req.body;

  const postIdCorrect = posts.some((post) => post.postId === Number(_postId))
  // 실제 존재하는 게시글의 postId를 param에 입력했다면 true 할당

  // const newCommentId = comments[comments.length - 1].commentId + 1
  // // 작성될 게시글의 newCommentId 설정( 마지막에 등록된 댓글의 commentId + 1 )
  // const commentId = comments.length ? newCommentId : 1

  if (user && password && content && postIdCorrect) {
    // user, password, content 가 입력되고 postIdCorrect 가 true라면.
    await Comments.create({ postId: _postId, commentId:1, user, password, content });
    res.status(201).json({ "message": "댓글을 생성하였습니다." })
  } else if (content === "") {
    res.status(400).send("댓글 내용을 입력해주세요")
  } else {
    res.status(400).send("데이터 형식이 올바르지 않습니다.")
  }
})

// ◎ 댓글 목록조회 ◎
router.get("/posts/:_postId/comments", async (req, res) => {
  const comments = await Comments.find({});

  const { _postId } = req.params;
  const results = comments.map((comment) => {

    if (comment.postId === Number(_postId)) {
      return {
        "commentId": comment.commentId,
        "user": comment.user,
        "content": comment.content,
        "createdAt": comment.createdAt,
      }
    }
  }) // 전체 댓글 중 param 입력한 postId에 해당되는 댓글만 result 배열에 할당 
    .filter((elem) => { return elem !== undefined })
    // param 입력한 postId에 해당 안되는 comment 들은 result에서 제거
    .sort(function (a, b) {
      return b.createdAt - a.createdAt
    }) // 내림차순 정렬

  res.json({
    data: results,
  }); // 댓글목록 리턴
});

// ◎ 댓글 수정 ◎
router.put("/posts/:_postId/comments/:_commentId", async (req, res) => {
  const comments = await Comments.find({});
  const posts = await Posts.find({});

  const { _postId } = req.params;
  const { _commentId } = req.params;
  const { password, content } = req.body;

  const twoIdMatch = comments.filter((comment) => {
    return comment.postId === Number(_postId)
  })
    .some((comment) => comment.commentId === Number(_commentId))
  // param 입력받은 postId와 commentId 조합이 실제 데이터베이스에 존재할 때 twoIdMatch에 true를 할당함.

  let targetComment = comments.find((comment) =>
    comment.commentId === Number(_commentId) && comment.password === password)
  // 전체 댓글중 전달받은 _commentId 와 password 가 일치하는 댓글을 targetComment에 할당함.
  if (twoIdMatch && targetComment && content) {
    await Comments.updateOne({ _id: targetComment._id },
      { $set: { content: content } }
    )
    res.status(200).json({ message: "댓글을 수정하였습니다." });
  } // twoIdMatch 가 true이고 targetComment가 존재하고, 내용입력을 했을 때 댓글을 수정함.
  else if (content === "") {
    res.status(400).json({ message: "댓글 내용을 입력해주세요" });
  } else if (!targetComment) {
    res.status(404).json({ message: "댓글 조회에 실패하였습니다." });
  } else { res.status(400).json({ message: "데이터 형식이 올바르지 않습니다." }); }
}
)

// ◎ 댓글 삭제 ◎
router.delete("/posts/:_postId/comments/:_commentId", async (req, res) => {
  const comments = await Comments.find({});

  const { _postId } = req.params;
  const { _commentId } = req.params;
  const { password } = req.body;

  const twoIdMatch = comments.filter((comment) => {
    return comment.postId === Number(_postId)
  })
    .some((comment) => comment.commentId === Number(_commentId))
  // param 입력받은 postId와 commentId 조합이 실제 데이터베이스에 존재할 때 twoIdMatch에 true를 할당함.

  let targetComment = comments.find((comment) =>
    comment.commentId === Number(_commentId) && comment.password === password
  ) // 모든 댓글 중에서 삭제할 댓글 지정 : 입력받은 commentId와 password를 db와 대조함.  

  if (targetComment && twoIdMatch) {
    await Comments.deleteOne({ commentId: targetComment.commentId })
    // 조건에 맞는 댓글이 있다면 삭제 진행
    res.status(200).json({ message: "댓글을 삭제하였습니다." });
  } else if (!password) {
    res.status(400).json({ message: "데이터 형식이 올바르지 않습니다." });
  } else {
    res.status(404).json({ message: "댓글 조회에 실패하였습니다." });
  }
}
)

module.exports = router
