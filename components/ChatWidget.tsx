import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send, User as UserIcon, ChevronRight, Bell } from 'lucide-react';
import { User, ChatMessage } from '../types';
import { getDoctors, getPatients, getUserById, getPatientsForDoctor } from '../services/userService';
import { getMessages, sendMessage, markAsRead, getUnreadCount, getUnreadMessages } from '../services/chatService';

interface ChatWidgetProps {
  currentUser: User;
}

interface NotificationToast {
  id: string;
  senderId: string;
  senderName: string;
  text: string;
}

const ChatWidget: React.FC<ChatWidgetProps> = ({ currentUser }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeChatUser, setActiveChatUser] = useState<User | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [contactList, setContactList] = useState<User[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Notification State
  const [notification, setNotification] = useState<NotificationToast | null>(null);
  const notifiedMessageIds = useRef<Set<string>>(new Set());
  const isFirstLoad = useRef(true);

  // Load contacts based on role and assignment
  useEffect(() => {
    if (currentUser.role === 'Patient') {
      // If patient, only show the assigned doctor
      if (currentUser.assignedDoctorId) {
        const assignedDoc = getUserById(currentUser.assignedDoctorId);
        setContactList(assignedDoc ? [assignedDoc] : []);
      } else {
        setContactList([]); // No doctor assigned
      }
    } else if (currentUser.role === 'Doctor') {
      // If doctor, show only patients assigned to them
      setContactList(getPatientsForDoctor(currentUser.id));
    } else {
      // Admin
      // Admins can chat with other staff (Doctors/Admins)
      // BUT should only chat with Patients if they are explicitly assigned to them
      const colleagues = getDoctors().filter(u => u.id !== currentUser.id);
      const myPatients = getPatientsForDoctor(currentUser.id);
      setContactList([...colleagues, ...myPatients]);
    }
    
    // Initial polling setup for notifications and unread count
    const checkUnread = () => {
        const count = getUnreadCount(currentUser.id);
        setUnreadCount(count);

        const unreadMsgs = getUnreadMessages(currentUser.id);
        
        // Handle first load to avoid spamming notifications for existing unread messages
        if (isFirstLoad.current) {
            unreadMsgs.forEach(msg => notifiedMessageIds.current.add(msg.id));
            isFirstLoad.current = false;
            return;
        }

        unreadMsgs.forEach(msg => {
            if (!notifiedMessageIds.current.has(msg.id)) {
                notifiedMessageIds.current.add(msg.id);

                // Check if we need to show a notification
                // Don't show if chat is open AND we are looking at this specific conversation
                const isChattingWithSender = isOpen && activeChatUser?.id === msg.senderId;

                if (!isChattingWithSender) {
                    const sender = getUserById(msg.senderId);
                    // Only show notification if the sender is in the allowed contact list
                    // Use a fresh check of current contacts logic or assume contactList is up to date (it updates on mount/role change)
                    // For safety, we can allow notifications but maybe not open chat if restricted? 
                    // Better to just show it if valid user.
                    if (sender) {
                        setNotification({
                            id: msg.id,
                            senderId: sender.id,
                            senderName: sender.name,
                            text: msg.text
                        });
                        
                        // Play a soft sound if possible
                        try {
                            const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
                            const oscillator = audioCtx.createOscillator();
                            const gainNode = audioCtx.createGain();
                            oscillator.connect(gainNode);
                            gainNode.connect(audioCtx.destination);
                            oscillator.type = 'sine';
                            oscillator.frequency.setValueAtTime(500, audioCtx.currentTime);
                            gainNode.gain.setValueAtTime(0.05, audioCtx.currentTime);
                            gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.3);
                            oscillator.start();
                            oscillator.stop(audioCtx.currentTime + 0.3);
                        } catch (e) {
                            // Audio context might be blocked or not supported, ignore
                        }

                        // Hide after 5 seconds
                        setTimeout(() => {
                            setNotification(prev => prev?.id === msg.id ? null : prev);
                        }, 5000);
                    }
                }
            }
        });
    };

    checkUnread();
    const interval = setInterval(checkUnread, 3000); // Check every 3s

    return () => clearInterval(interval);
  }, [currentUser, isOpen, activeChatUser]);

  // Poll for messages when chat is open
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;

    if (isOpen && activeChatUser) {
      const fetchMessages = () => {
        const msgs = getMessages(currentUser.id, activeChatUser.id);
        setMessages(msgs);
        markAsRead(activeChatUser.id, currentUser.id);
        
        // Also update global unread count immediately for better UI response
        setUnreadCount(getUnreadCount(currentUser.id));
      };

      fetchMessages();
      interval = setInterval(fetchMessages, 2000); // Poll every 2s for "real-time" feel
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isOpen, activeChatUser, currentUser.id]);

  // Scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeChatUser) return;

    sendMessage(currentUser.id, activeChatUser.id, newMessage);
    setNewMessage('');
    // Refresh immediately
    setMessages(getMessages(currentUser.id, activeChatUser.id));
  };

  const handleCloseChat = () => {
    setActiveChatUser(null);
    setIsOpen(false);
  };

  const handleNotificationClick = () => {
    if (notification) {
        // Ensure we can find the sender in our allowed contacts or fetch them if they are valid
        // Ideally we restrict opening chats to allowed contacts only.
        const sender = getUserById(notification.senderId);
        
        if (sender) {
            // Check if allowed
            const isAllowed = contactList.some(c => c.id === sender.id) || 
                              (currentUser.role === 'Admin' && sender.role !== 'Patient') || // Admins can chat with staff even if not in contact list initially loaded
                              (currentUser.role === 'Doctor' && sender.role === 'Patient' && sender.assignedDoctorId === currentUser.id);

            // Update: Simple check against loaded contact list is safest based on requirements
            const isInContacts = contactList.some(c => c.id === sender.id);
            
            // If contact list hasn't loaded or updated yet, this might be tricky, but usually it's fast.
            // We'll trust the contact list logic from useEffect.
            if (isInContacts) {
                setActiveChatUser(sender);
                setIsOpen(true);
                setNotification(null);
            } else {
                // If not in contacts (e.g. unassigned patient trying to msg admin), maybe just clear notification?
                setNotification(null);
            }
        }
    }
  };

  if (!currentUser) return null;

  return (
    <div className="fixed bottom-6 left-6 z-[100] font-sans flex flex-col items-start gap-4">
      
      {/* Notification Toast */}
      {notification && !isOpen && (
        <div 
            onClick={handleNotificationClick}
            className="mb-2 bg-white border-r-4 border-teal-500 shadow-xl rounded-lg p-4 w-72 cursor-pointer animate-fade-in-up hover:bg-slate-50 transition-all transform hover:scale-102 flex items-start gap-3"
            style={{ direction: 'rtl' }}
        >
            <div className="bg-teal-100 p-2 rounded-full text-teal-600 shrink-0">
                <Bell size={18} />
            </div>
            <div className="flex-grow">
                <div className="flex justify-between items-start mb-1">
                    <h4 className="font-bold text-slate-800 text-sm">{notification.senderName}</h4>
                    <span className="text-[10px] text-teal-600 font-bold bg-teal-50 px-2 py-0.5 rounded-full">رسالة جديدة</span>
                </div>
                <p className="text-slate-600 text-xs line-clamp-2">{notification.text}</p>
            </div>
        </div>
      )}

      <div className="relative">
        {/* Chat Button */}
        {!isOpen && (
            <button
            onClick={() => setIsOpen(true)}
            className="bg-teal-600 hover:bg-teal-700 text-white p-4 rounded-full shadow-lg transition-all transform hover:scale-105 relative"
            >
            <MessageCircle size={28} />
            {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-white animate-bounce">
                {unreadCount}
                </span>
            )}
            </button>
        )}

        {/* Chat Window */}
        {isOpen && (
            <div className="bg-white w-[350px] h-[500px] rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-fade-in-up">
            
            {/* Header */}
            <div className="bg-teal-600 p-4 flex items-center justify-between text-white shrink-0">
                <div className="flex items-center gap-2">
                {activeChatUser && (
                    <button onClick={() => setActiveChatUser(null)} className="hover:bg-teal-700 p-1 rounded-full">
                    <ChevronRight size={20} />
                    </button>
                )}
                <h3 className="font-bold">
                    {activeChatUser ? activeChatUser.name : (currentUser.role === 'Patient' ? 'طبيبي المعالج' : 'المحادثات')}
                </h3>
                </div>
                <button onClick={handleCloseChat} className="hover:bg-teal-700 p-1 rounded-full">
                <X size={20} />
                </button>
            </div>

            {/* Body */}
            <div className="flex-grow overflow-y-auto custom-scrollbar bg-slate-50">
                {!activeChatUser ? (
                // Contact List
                <div className="p-2 space-y-1">
                    {contactList.map(contact => {
                       const unreadCountForContact = getUnreadMessages(currentUser.id).filter(m => m.senderId === contact.id).length;
                       return (
                        <div 
                            key={contact.id}
                            onClick={() => setActiveChatUser(contact)}
                            className="flex items-center gap-3 p-3 bg-white hover:bg-teal-50 rounded-xl cursor-pointer border border-slate-100 transition-colors relative"
                        >
                            <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center text-teal-700 font-bold relative">
                            {contact.name.charAt(0)}
                            {unreadCountForContact > 0 && (
                                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white"></span>
                            )}
                            </div>
                            <div>
                            <p className="font-bold text-slate-800 text-sm">{contact.name}</p>
                            <p className="text-xs text-slate-500">{contact.role === 'Doctor' ? 'طبيب' : 'مريض'}</p>
                            </div>
                            {unreadCountForContact > 0 && (
                                <div className="mr-auto bg-teal-100 text-teal-700 text-xs font-bold px-2 py-1 rounded-full">
                                    {unreadCountForContact}
                                </div>
                            )}
                        </div>
                    )})}
                    {contactList.length === 0 && (
                    <div className="text-center text-slate-400 mt-10 p-4">
                        {currentUser.role === 'Patient' ? (
                        <p>لم يتم تعيين طبيب معالج لحسابك بعد. يرجى التواصل مع الإدارة.</p>
                        ) : currentUser.role === 'Doctor' ? (
                        <p>لا يوجد مرضى مرتبطين بحسابك حالياً.</p>
                        ) : (
                        <p>لا توجد جهات اتصال متاحة.</p>
                        )}
                    </div>
                    )}
                </div>
                ) : (
                // Messages View
                <div className="p-4 space-y-4">
                    {messages.length === 0 ? (
                        <div className="text-center text-slate-400 mt-10 text-sm">
                            ابدأ المحادثة مع {activeChatUser.name}
                        </div>
                    ) : (
                        messages.map((msg) => (
                        <div 
                            key={msg.id} 
                            className={`flex ${msg.senderId === currentUser.id ? 'justify-end' : 'justify-start'}`}
                        >
                            <div 
                            className={`max-w-[80%] p-3 rounded-2xl text-sm ${
                                msg.senderId === currentUser.id 
                                ? 'bg-teal-600 text-white rounded-br-none' 
                                : 'bg-white text-slate-800 border border-slate-200 rounded-bl-none shadow-sm'
                            }`}
                            >
                            {msg.text}
                            <div className={`text-[10px] mt-1 opacity-70 ${msg.senderId === currentUser.id ? 'text-teal-100' : 'text-slate-400'}`}>
                                {new Date(msg.timestamp).toLocaleTimeString('ar-EG', { hour: '2-digit', minute:'2-digit' })}
                            </div>
                            </div>
                        </div>
                        ))
                    )}
                    <div ref={messagesEndRef} />
                </div>
                )}
            </div>

            {/* Footer (Input) */}
            {activeChatUser && (
                <div className="p-3 bg-white border-t border-slate-100 shrink-0">
                <form onSubmit={handleSendMessage} className="flex gap-2">
                    <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="اكتب رسالتك..."
                    className="flex-grow px-4 py-2 bg-slate-50 border border-slate-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                    <button 
                    type="submit"
                    disabled={!newMessage.trim()}
                    className="p-2 bg-teal-600 text-white rounded-full hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                    <Send size={18} />
                    </button>
                </form>
                </div>
            )}
            </div>
        )}
      </div>
    </div>
  );
};

export default ChatWidget;