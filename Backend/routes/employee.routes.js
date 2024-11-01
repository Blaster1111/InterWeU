import express from 'express';
import { registerEmployee, loginEmployee, editEmployee, deleteEmployee } from '../controllers/employee.controllers.js';
const router = express.Router();

router.post('/register', registerEmployee);
router.post('/login', loginEmployee);
router.put('/:id',  editEmployee);
router.delete('/:id',  deleteEmployee);

export default router;