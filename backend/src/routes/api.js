import express from 'express';
import { getProfile } from '../controllers/profileController.js';
import { getProjects, getTopSkills, search } from '../controllers/projectController.js';

const router = express.Router();

router.get('/health', (req, res) => {
    res.json({ status: 'ok' });
});

router.get('/profile', getProfile);
router.get('/projects', getProjects);
router.get('/skills/top', getTopSkills);
router.get('/search', search);

export default router;
