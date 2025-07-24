import { useContext } from 'react';
import { DiscussionContext } from '../context/discussionThreadContext';
export const useDiscussionContext = () => {
  const ctx = useContext(DiscussionContext);
  if (!ctx) throw new Error('useDiscussionContext must be inside DiscussionProvider');
  return ctx;
};
