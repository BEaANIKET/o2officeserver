
import { Router } from "express";
import { login, Logout, post, profile, register, updateProfile } from "../controlers/auth.controllers.js";
import { verifyLogin } from "../middleware/verifyLogin.middleware.js";

const router = new Router();

router.post('/register', register)
router.post('/login', login)
router.post('/logout', verifyLogin, Logout)

router.get('/profile', verifyLogin, profile)
router.post('/updateprofile', verifyLogin, updateProfile)
router.get('/post', verifyLogin, post)

export default router; 