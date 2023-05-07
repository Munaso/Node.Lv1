const express = require("express");
const router = express.Router();
const User = require("../schemas/users.js")
// const authMiddleware = require("../middlewares/auth-middleware.js")


//  ◎ 회원가입 API ◎
router.post('/signup', async (req, res) => {
    const { nickname, password, confirm } = req.body;
    try {
        // nickname이 실제로 DB에 존재하는지 확인.
        const existsUsers = await User.findOne({ nickname });
        if (existsUsers) {
            res.status(412).json({ errorMessage: "중복된 닉네임입니다." });
            return;
        }
        // nickname 형식 확인.
        const nickCheck = /^[0-9a-zA-Z]{3,20}$/
        if (!nickCheck.test(nickname)) {
            res.status(412).json({ errorMessage: "닉네임의 형식이 올바르지 않습니다." });
            return;
        }
        // 패스워드와 패스워드 확인 일치여부 확인
        if (password !== confirm) {
            res.status(412).json({ errorMessage: "패스워드가 일치하지 않습니다." });
            return;
        }
        // 패스워드 형식 확인
        const pwCheck = /^[0-9a-zA-Z]{4,20}$/
        if (!pwCheck.test(password)) {
            res.status(412).json({ errorMessage: "패스워드 형식이 올바르지 않습니다." });
            return;
        }
        // 패스워드가 닉네임 포함하는지 여부 확인
        if (password.includes(nickname)) {
            res.status(412).json({ errorMessage: "패스워드에 닉네임이 포함되어 있습니다." });
            return;
        }

        const user = new User({ nickname, password });
        await user.save();  // DB에 저장한다.
        return res.status(201).json({message: "회원가입 성공"});
    }
    catch (error) {
        // 예상치 못한 에러 대응
        return res.status(400).json({ message: "요청이 올바르지 않습니다." })
    }
})


module.exports = router