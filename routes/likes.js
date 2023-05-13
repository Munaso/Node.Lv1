const express = require("express") // express 사용 선언
const router = express.Router(); //Router 사용 선언
const authMiddleware = require("../middlewares/auth-middleware")
const { Posts, Users, Comments, Likes } = require("../models")

// ◎ 좋아요 수행 ◎
router.put("/posts/:_postId/like", authMiddleware, async (req, res) => { // 로그인을 확인하는 authMiddleware를 거침.
    try {
        // authMiddleware 에서 userId, nickname 을 body 에서 title, content를 가져온다.
        const { userId } = res.locals.user;

        // 좋아요를 수행하려는 게시글의 postId를 params로 받아옴.
        const { _postId } = req.params;
        // 그 게시글이 존재한다면 targetPost에 할당.
        const targetPost = await Posts.findOne({ where: { postId: _postId } });
        // targetPost가 없다면.
        if (!targetPost) {
            return res.status(412).json({ 'message': '게시글이 존재하지 않습니다.' })
        }

        // 좋아요를 수행하려는 게시글에 로그인한 해당 유저가 이미 좋아요 한적이 있는지 확인 
        const isExistingLike = await Likes.findOne({ where: { userId: userId, postId: _postId } });
        if (!isExistingLike) {
            await Likes.create({ userId, postId: _postId });
            return res.status(200).json({ message: "게시글의 좋아요를 등록하였습니다." })
        } else if (isExistingLike) {
            await Likes.destroy({ where: { userId: userId, postId: _postId } })
            return res.status(200).json({ message: "게시글의 좋아요를 취소하였습니다." });
        }
    } catch (error) { // 예상치 못한 오류 대응
        res.status(400).json({ message: "게시글 좋아요에 실패하였습니다." });
        console.error(error)
    }
})


// ◎ 유저가 좋아요를 수행한 게시글들 조회 ◎
router.get("/posts/like/mylike", authMiddleware, async (req, res) => {
    try {

        const { userId } = res.locals.user;
        // 좋아요 테이블의 모든 데이터를 배열에 할당
        const allLikes = await Likes.findAll({})
        // 로그인한 유저가 좋아요를 한 모든 게시글들이 모인 '배열'을 반환
        const likes = await Likes.findAll({
            atrributes: [],
            include: {
                model: Posts,
                attributes: ["postId", "userId", "title", "createdAt", "updatedAt"],
                include: {
                    model: Users,
                    attributes: ["nickname"]
                }
            },
            where: { userId: userId }
        });
        // 그 '배열'이 존재한다면
        if (likes) {
            // 해당 배열 내 게시글 정보를 map()으로 보기쉽게 정리
            const result = likes.map((myLike) => {
                return {
                    "postId": myLike.Post.postId,
                    "userId": myLike.Post.userId,
                    "nickname": myLike.Post.User.nickname,
                    "title": myLike.Post.title,
                    "createdAt": myLike.Post.createdAt,
                    "updatedAt": myLike.Post.updatedAt,
                    // map()이 현재 정리하고 있는 게시글이 몇 개의 좋아요를 받았는지 확인.
                    // 전체 좋아요 데이터중 내가 좋아요를 누른 mylike 게시글이 몇 개 있는지 확인.
                    "likes": allLikes.filter((like) => {
                        return like.postId === myLike.Post.postId
                    }).length
                }
            })
            res.status(200).json({ "likedPosts": result })
        } else if (!likes) {
            // 전달받은 postId 와 일치하는 게시글이 없을 경우
            res.status(400).json({ "message": " 좋아요한 게시글 조회에 실패하였습니다." })
            return;
        }
    } catch (error) {
        console.error(error);
        res.status(400).json({ message: "좋아요한 게시글 조회에 실패하였습니다." });
    }
})




module.exports = router
