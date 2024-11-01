import express from 'express';
import { createOrganization, getOrganizations, getOrganization, editOrganization, deleteOrganization } from '../controllers/organization.controller.js';

const router = express.Router();

router.post('/', createOrganization);
router.get('/', getOrganizations);
router.get('/:id', getOrganization);
router.put('/:id', editOrganization);
router.delete('/:id', deleteOrganization);

export default router;