import { Router } from "express";
import { addPost, deletePost, getPosts, updatePost, uploadFile, likePost, dislikePost, getLikes } from "../controlers/post.controllers.js";
import { verifyLogin } from "../middleware/verifyLogin.middleware.js";
import { upload } from "../middleware/multer.middleware.js";

const router = Router();

router.post('/add', verifyLogin, addPost);
router.put('/update', verifyLogin, updatePost);
router.delete('/delete', verifyLogin, deletePost);
router.get('/get', getPosts);

router.post('/upload', verifyLogin, upload.single('file'), uploadFile);

router.post('/like', verifyLogin, likePost);
router.post('/dislike', verifyLogin, dislikePost);
router.get('/getLikes', verifyLogin, getLikes);

export default router;