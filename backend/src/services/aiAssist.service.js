const aiService = require('./ai.service');
const aiUsageLogModel = require('../models/aiUsageLog.model');
const personModel = require('../models/person.model');
const memoryModel = require('../models/personMemory.model');
const relationshipService = require('./relationship.service');
const ApiError = require('../utils/ApiError');

const MAX_MEMORY_LENGTH = 10000;

function formatRelationList(list, label) {
  if (!list || list.length === 0) return '';
  const names = list.map((r) => `${r.person.first_name}${r.person.last_name ? ' ' + r.person.last_name : ''}`).join(', ');
  return `${label}: ${names}\n`;
}

// 15.2 / 15.4 - gathers only facts already ON RECORD (dates, relationships,
// existing memory titles) - the AI is explicitly told not to invent anything
async function generateBiography(familyId, personId, userId) {
  const person = await personModel.findById(personId);
  if (!person || person.family_id !== familyId) throw ApiError.notFound('Person not found', 'PERSON_NOT_FOUND');

  const relationships = await relationshipService.getPersonRelationships(familyId, personId);
  const memories = await memoryModel.listByPerson(personId, { includeAdminOnly: false, includeHidden: false });

  const facts = [
    `Name: ${person.first_name}${person.middle_name ? ' ' + person.middle_name : ''}${person.last_name ? ' ' + person.last_name : ''}`,
    person.gender && person.gender !== 'unknown' ? `Gender: ${person.gender}` : '',
    person.birth_date ? `Born: ${person.birth_date}${person.birth_place ? ' in ' + person.birth_place : ''}` : '',
    !person.is_living && person.death_date ? `Died: ${person.death_date}${person.death_place ? ' in ' + person.death_place : ''}` : '',
    formatRelationList(relationships.parents, 'Parents'),
    formatRelationList(relationships.spouses, 'Spouse(s)'),
    formatRelationList(relationships.children, 'Children'),
    formatRelationList(relationships.siblings, 'Siblings'),
    memories.length ? `Recorded family memories about them: ${memories.slice(0, 5).map((m) => m.title).join('; ')}` : '',
  ].filter(Boolean).join('\n');

  if (facts.split('\n').length <= 1) {
    throw ApiError.badRequest('There is not enough recorded information about this person yet to generate a biography. Add some dates or relationships first.', 'INSUFFICIENT_DATA');
  }

  const systemPrompt =
    'You write short, warm, factual family-history biography drafts. ' +
    'ONLY use the facts given to you - never invent dates, places, achievements, or personality traits that were not provided. ' +
    'If information is sparse, write a brief, honest paragraph rather than padding it with invented detail. ' +
    'Write 2-4 short paragraphs, third person, plain text, no headers or markdown.';

  const draft = await aiService.callClaude(systemPrompt, `Known facts about this person:\n${facts}`, { maxTokens: 500 });

  await aiUsageLogModel.logUsage(userId, familyId, 'biography_generation');

  return { draft, disclaimer: 'This draft was AI-generated from recorded facts. Please review and edit before saving - it is a starting point, not a verified account.' };
}

// 15.3 / 15.4
async function summarizeMemory(familyId, memoryId, userId) {
  const memory = await memoryModel.findById(memoryId);
  if (!memory || memory.family_id !== familyId) throw ApiError.notFound('Memory not found', 'MEMORY_NOT_FOUND');

  if (!memory.content || memory.content.trim().length < 20) {
    throw ApiError.badRequest('This memory is too short to summarize meaningfully.', 'INSUFFICIENT_DATA');
  }
  if (memory.content.length > MAX_MEMORY_LENGTH) {
    throw ApiError.badRequest('This memory exceeds the length limit for summarization.', 'CONTENT_TOO_LONG');
  }

  const systemPrompt =
    'You summarize personal family memories in 1-3 sentences. ' +
    'Preserve the emotional tone and key details. Do not add anything not present in the original text. Plain text only.';

  const summary = await aiService.callClaude(systemPrompt, `Memory titled "${memory.title}":\n\n${memory.content}`, { maxTokens: 150 });

  await aiUsageLogModel.logUsage(userId, familyId, 'memory_summarization');

  return { summary };
}

module.exports = { generateBiography, summarizeMemory };