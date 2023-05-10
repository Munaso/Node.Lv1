const express = require("express");
const router = express.Router();
const { Users } = require("../models")

// const User = require("../schemas/users.js")


//  ◎ 회원가입 API ◎
router.post('/signup', async (req, res) => {
    const { nickname, password, confirm } = req.body;
    // try { // 닉네임으로 중복가입 여부 확인
        const isExistUser = await Users.findOne({
            where: { nickname: nickname }
        });

        if (isExistUser) { // 이미 해당 닉네임으로 가입했다면,
            res.status(412).json({ errorMessage: "중복된 닉네임입니다." });
            return;
        }
        // 닉네임 형식확인: 알파벳 대소문자, 숫자, 3~20자
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
        // 패스워드 형식 확인 알파벳 대소문자, 숫자, 4~20자
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
        await Users.create({ nickname, password })
        return res.status(201).json({ message: "회원가입 성공" });
    // }
    // catch (error) {
    //     // 예상치 못한 에러 대응
    //     return res.status(400).json({ message: "요청이 올바르지 않습니다." })
    // }
})

// ◎ 사용자 전체조회 API ◎
router.get("/users/", async (req, res) => {

    // user 테이블에 있는 모든 데이터를 갖고오되, attributes에 명시된 컬럼만 user 에 할당.
    const user = await Users.findAll({
        attributes: ['userId', 'nickname', 'createdAt', 'updatedAt']
    });
    return res.status(200).json({ data: user })
})

module.exports = router