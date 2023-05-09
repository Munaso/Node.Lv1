const express = require("express");
const router = express.Router();
const { Users } = require("../models")
const jwt = require("jsonwebtoken")

// 로그인 API 
router.post('/login', async(req, res)=>{
    const {nickname, password} = req.body;

    // 닉네임이 일치하는 유저를 찾는다.
    const user = await Users.findOne({ where: { nickname } });

    //  1. 닉네임에 일치하는 유저가 존재하지 않거나
    //  2. 유저를 찾았지만, 유저의 비밀번호와, 입력한 비밀번호가 다를때,
    if(!user || user.password !== password) {
        res.status(400).json({ errorMessage: "닉네임 또는 패스워드를 확인해주세요" })
        return;
    }
    // 상단 if문에 걸리지 않는다면: JWT를 생성하여 클라이언트에 전달
    const token = jwt.sign({userId: user.userId}, "customized_secret-key");

    res.cookie("Authorization", `Bearer ${token}`);
    res.status(200).json({token});
})

module.exports = router