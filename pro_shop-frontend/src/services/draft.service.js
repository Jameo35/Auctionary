const STORAGE_KEY = 'draft_auctions';

function getDrafts() {
  const drafts = localStorage.getItem(STORAGE_KEY);
  return drafts ? JSON.parse(drafts) : [];
}

function saveDraft(draft) {
  const drafts = getDrafts();
  const draftIndex = drafts.findIndex(d => d.id === draft.id);
  if (draftIndex !== -1) {
    drafts[draftIndex] = draft;
  } else {
    drafts.push(draft);
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(drafts));
}

function getDraftById(id) {
  const drafts = getDrafts();
  return drafts.find(d => d.id === id);
}

function deleteDraft(id) {
  let drafts = getDrafts();
  drafts = drafts.filter(d => d.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(drafts));
}

export const draftService = {
  getDrafts,
  saveDraft,
  getDraftById,
  deleteDraft
};