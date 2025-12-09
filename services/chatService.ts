import { ChatMessage } from '../types';

const CHAT_KEY = 'mediscan_chats';

export const getMessages = (userId1: string, userId2: string): ChatMessage[] => {
  const allMessages = getAllMessages();
  return allMessages.filter(msg => 
    (msg.senderId === userId1 && msg.receiverId === userId2) ||
    (msg.senderId === userId2 && msg.receiverId === userId1)
  ).sort((a, b) => a.timestamp - b.timestamp);
};

export const getAllMessages = (): ChatMessage[] => {
  const stored = localStorage.getItem(CHAT_KEY);
  return stored ? JSON.parse(stored) : [];
};

export const sendMessage = (senderId: string, receiverId: string, text: string): ChatMessage => {
  const allMessages = getAllMessages();
  const newMessage: ChatMessage = {
    id: crypto.randomUUID(),
    senderId,
    receiverId,
    text,
    timestamp: Date.now(),
    read: false
  };
  
  allMessages.push(newMessage);
  localStorage.setItem(CHAT_KEY, JSON.stringify(allMessages));
  return newMessage;
};

export const markAsRead = (senderId: string, receiverId: string) => {
  const allMessages = getAllMessages();
  let changed = false;
  
  const updatedMessages = allMessages.map(msg => {
    if (msg.senderId === senderId && msg.receiverId === receiverId && !msg.read) {
      changed = true;
      return { ...msg, read: true };
    }
    return msg;
  });

  if (changed) {
    localStorage.setItem(CHAT_KEY, JSON.stringify(updatedMessages));
  }
};

export const getUnreadCount = (userId: string): number => {
  const allMessages = getAllMessages();
  return allMessages.filter(msg => msg.receiverId === userId && !msg.read).length;
};

export const getUnreadMessages = (userId: string): ChatMessage[] => {
  const allMessages = getAllMessages();
  return allMessages.filter(msg => msg.receiverId === userId && !msg.read);
};
