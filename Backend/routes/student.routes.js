import express from 'express';
import { registerStudent, loginStudent, getStudent, editStudent } from '../controllers/student.controllers.js';

const router = express.Router();

router.post('/', registerStudent);
router.post('/login', loginStudent);
router.get('/',  getStudent);
router.put('/',  editStudent);

export default router;