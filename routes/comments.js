const express = require("express") // express 사용 선언
const router = express.Router(); //Router 사용 선언


const Posts = require("../schemas/posts.js")
const Comments = require("../schemas/comments.js")

// 댓글 작성
router.post("/posts/:postId/comments/", async (req, res) => {
  const { postId } = req.params;
  const { user, password, content } = req.body;
  if (content && password) {  
    await Comments.create({ postId: postId, user: user, password: password, content: content });
    res.status(200).json({ "message": "댓글을 생성하였습니다." })
  } else if(!content) {
    res.status(400).send( "댓글 내용을 입력해주세요" )
  } else if(!password) {
    res.status(400).send( "비밀번호를 입력해주세요" )
  }  
})

// 댓글 목록조회
router.get("/posts/:postId/comments", async (req, res) => {
  const comments = await Comments.find({});

  const { postId } = req.params;
  const results = comments.map((comment) => {

    if (comment.postId === postId) {
      return {
        "commentId": comment._id.valueOf(),
        "user": comment.user,
        "content": comment.content,
        "createdAt": comment.createdAt,
      }
    }
  }).filter((elem) => { return elem !== undefined })

  console.log(results)


  res.json({
    data: results,
  });
});

// 댓글 수정
router.put("/posts/:postId/comments/:commentId", async (req, res) => {
  const comments = await Comments.find({});

  const { commentId } = req.params;
  const { password, content } = req.body;

  let targetComment = comments.find((comment) =>
    comment._id.valueOf() === commentId && comment.password === password && req.body.content !== ""
  )

  if (targetComment) {
    await Comments.updateOne({ _id: targetComment._id },
      { $set: { content: req.body.content } }
    )
    res.status(200).json({ message: "댓글을 수정하였습니다." });

  } else if (!content) {
    res.status(400).send("댓글 내용을 입력해주세요");
  } else {
    res.status(400).send("비밀번호를 확인해주세요");
  }
}
)

// 댓글 삭제
router.delete("/posts/:postId/comments/:commentId", async (req, res) => {
  const comments = await Comments.find({});

  const { commentId } = req.params;
  const { password } = req.body;

  let targetComment = comments.find((comment) =>
    comment._id.valueOf() === commentId && comment.password === password
  ) // 모든 댓글 중에서 삭제할 댓글 지정 : 입력받은 commentId와 password를 db와 대조함.  

  if (targetComment) {
    await Comments.deleteOne({ _id: targetComment._id },
      { $set: { content: req.body.content } }
    ) // 조건에 맞는 댓글이 있다면 삭제 진행
    res.status(200).json({ message: "댓글을 삭제하였습니다." });

  } else {
    res.status(400).send("비밀번호를 확인해주세요");
  }
}
)

module.exports = router
