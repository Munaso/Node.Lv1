const express = require("express") // express 사용 선언
const router = express.Router(); //Router 사용 선언

// ◎ 게시글 작성 ◎
const Posts = require("../schemas/posts.js")
router.post("/posts/", async (req, res) => {
  const posts = await Posts.find({});
  //게시글 목록을 배열 형태로 반환

  const { user, password, title, content } = req.body;

  const newPostId = posts[posts.length - 1].postId + 1
  // 작성될 게시글의 newPostId 설정( 마지막에 등록된 게시글의 postId + 1 )
  const postId = posts.length ? newPostId : 1
  // 현재 게시글이 없다면 새 게시글의 postId는 1, 현재 게시글이 있다면 newPostId
  await Posts.create({ postId, user, password, title, content });
  // db 생성 및 저장

  res.status(201).json({ "message": "게시글을 생성하였습니다." })
})

// ◎ 전체 게시글 목록조회 ◎
router.get("/posts", async (req, res) => {
  const posts = await Posts.find({});
  //게시글 목록을 배열 형태로 반환

  const results = posts.map((post) => { // 
    return {
      "postId": post.postId,
      "user": post.user,
      "title": post.title,
      "createdAt": post.createdAt,
    }
  }) // 게시글 하나하나에서 필요 key만 추출해 또다른 배열 생성
    .sort(function (a, b) {
      return b.createdAt - a.createdAt
    }) // 추출한 배열 내림차순 정렬
  res.status(200).json({ "data": results });
});

// ◎ (특정)게시글 상세조회 ◎
router.get("/posts/:_postId", async (req, res) => {
  const posts = await Posts.find({});
  const { _postId } = req.params;

  let result = {};

  let targetPost = posts.find((post) =>
    post.postId === Number(_postId)
  ) // params(게시글번호)로 받아온 postId와 일치하는 게시글을 targetPost에 할당 
  if (targetPost) {  // targetPost가 존재한다면.
    result = {
      "postId": targetPost.postId,
      "user": targetPost.user,
      "title": targetPost.title,
      "content": targetPost.content,
      "createdAt": targetPost.createdAt,
    }
    res.status(200).json({ "data": result }) // result 객체에 targetPost의 값들을 할당
  } else if (isNaN(_postId)) { 
    res.status(400).json({ "message": "데이터 형식이 올바르지 않습니다." })
    // 입력받은 param(게시글번호)이 숫자가 아닐 경우 message 반환
  } 
  else if(targetPost === undefined) {
    res.status(400).json({ "message": "게시글 번호를 확인하시기 바랍니다." })
    // 입력받은 param(게시글번호)과 일치하는 게시글이 없을 경우 message 반환
  }
})

// ◎ 게시글 수정 ◎
router.put("/posts/:_postId", async (req, res) => {
  const posts = await Posts.find({});
  console.log(posts)
  const { _postId } = req.params; // param으로 수정하려는 게시글의 postId를 받아 postId에 할당.
  const { password, title, content } = req.body;

  let targetPost = posts.find((post) =>
    post.postId === Number(_postId) && post.password === password)
    // 전체 게시글중 받아온 postId와 password가 일치하는 게시글이 있다면 targetPost에 할당. 
  if (targetPost && title && content ) 
  // targetPost가 존재하고 title, content를 빈칸없이 전달받았다면,
  {
    await Posts.updateOne({ postId: targetPost.postId },
      { $set: { title: title, content: content } }
    ) 
    res.status(200).json({ message: "게시글을 수정하였습니다." });
  } // 게시글 수정 및 메시지 전달 

  else if( (targetPost) && ( !title || !content) ) {
    res.status(400).json({ message: "데이터 형식이 올바르지 않습니다." });
    // targetPost가 존재하지만 title이나 content가 입력되지 않았다면 해당 메시지 전달
  } else { res.status(404).json({ message: "게시글 조회에 실패하였습니다" });
}  // // postId와 이에 대한 password를 잘못 입력한 경우 해당 메시지 전달
})


//  ◎ 게시글 삭제 ◎
router.delete("/posts/:_postId", async (req, res) => {
  const posts = await Posts.find({});
  const { _postId } = req.params;
  const { password } = req.body;

  let targetPost = posts.find((post) =>
    post.postId === Number(_postId) && post.password === password
  ) // 전체 게시글중 받아온 postId와 password가 일치하는 게시글이 있다면 targetPost에 할당.
  if (targetPost) {
    await Posts.deleteOne({ postId: targetPost.postId, password: password })
    res.json({ message: "게시글을 삭제하였습니다." });
  } // targetPost가 존재한다면 그 targetPost를 삭제
  
  else if( !password || !_postId ) {
    res.status(400).json({ message: "데이터 형식이 올바르지 않습니다." });
    // password나 param이 입력되지 않았다면 해당 메시지 전달
  } else { res.status(404).json({ message: "게시글 조회에 실패하였습니다" });
}  // postId와 이에 대한 password를 잘못 입력한 경우 해당 메시지 전달
})

module.exports = router
