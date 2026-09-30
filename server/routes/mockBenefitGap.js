const express = require('express');
const { classifyBenefitGap, MOCK_LABEL } = require('../services/benefitGapMatcher');

const router = express.Router();

router.get('/summary', (req, res) => {
  const { summary } = classifyBenefitGap();
  res.json({ ...summary, source: 'synthetic-mock-prototype' });
});

router.get('/matches', (req, res) => {
  const { summary, candidates } = classifyBenefitGap();
  res.json({ summary, candidates, source: 'synthetic-mock-prototype', label: MOCK_LABEL });
});

router.get('/matches/:id', (req, res) => {
  const { candidates } = classifyBenefitGap();
  const candidate = candidates.find((record) => record.id === req.params.id);
  if (!candidate) return res.status(404).json({ error: 'Synthetic candidate not found.' });
  return res.json({ candidate, source: 'synthetic-mock-prototype', label: MOCK_LABEL });
});

module.exports = router;
