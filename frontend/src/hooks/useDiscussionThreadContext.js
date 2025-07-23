import { useContext } from "react";
import { DiscussionContext } from "../context/discussionThreadContext";
export const useDiscussionContext = () => {
  const context = useContext(DiscussionContext);
  if (!context) throw new Error('useDiscussionContext must be used within a DiscussionProvider');
  return context;
};
