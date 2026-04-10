import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { Navbar } from '../components/Navbar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { MessageSquare, Send, User, Mail, Phone, MapPin } from 'lucide-react';
import { toast } from 'sonner';

export function Messages() {
  const { user } = useAuth();
  const { messages, sendMessage, users, markConversationRead } = useData();
  const [selectedContact, setSelectedContact] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');

  const myMessages = useMemo(
    () => messages.filter((message) => message.senderId === user?.id || message.receiverId === user?.id),
    [messages, user?.id]
  );

  const contacts = useMemo(() => {
    const contactIds = Array.from(
      new Set(myMessages.map((message) => (message.senderId === user?.id ? message.receiverId : message.senderId)))
    );

    return contactIds
      .map((id) => {
        const contact = users.find((entry) => entry.id === id);
        const contactMessages = myMessages.filter(
          (message) =>
            (message.senderId === user?.id && message.receiverId === id) ||
            (message.senderId === id && message.receiverId === user?.id)
        );
        const orderedMessages = [...contactMessages].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
        const lastMessage = orderedMessages[0];

        return {
          id,
          contact,
          lastMessage,
          unreadCount: contactMessages.filter(
            (message) => message.senderId === id && message.receiverId === user?.id && !message.isRead
          ).length,
        };
      })
      .sort((a, b) => (b.lastMessage?.timestamp.getTime() ?? 0) - (a.lastMessage?.timestamp.getTime() ?? 0));
  }, [myMessages, user?.id, users]);

  useEffect(() => {
    if (!selectedContact && contacts.length > 0) {
      setSelectedContact(contacts[0].id);
    }
  }, [contacts, selectedContact]);

  useEffect(() => {
    if (!user?.id || !selectedContact) {
      return;
    }

    markConversationRead(user.id, selectedContact);
  }, [markConversationRead, selectedContact, user?.id]);

  const conversationMessages = selectedContact
    ? myMessages
        .filter(
          (message) =>
            (message.senderId === user?.id && message.receiverId === selectedContact) ||
            (message.senderId === selectedContact && message.receiverId === user?.id)
        )
        .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime())
    : [];

  const selectedContactInfo = users.find((entry) => entry.id === selectedContact);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();

    if (!newMessage.trim() || !selectedContact || !user) {
      return;
    }

    const contact = users.find((entry) => entry.id === selectedContact);
    if (!contact) {
      return;
    }

    sendMessage({
      senderId: user.id,
      senderName: user.name,
      receiverId: selectedContact,
      receiverName: contact.name,
      message: newMessage.trim(),
    });

    setNewMessage('');
    toast.success('Message sent.');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Messages</h1>
          <p className="mt-1 text-gray-600">See who sent each message, share contacts, and keep conversations organized.</p>
        </div>

        <div className="grid h-[calc(100vh-250px)] grid-cols-1 gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>Conversations</CardTitle>
              <CardDescription>Your recent chats with farmers and companies</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {contacts.length === 0 ? (
                <div className="px-4 py-12 text-center text-gray-500">
                  <MessageSquare className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                  <p>No conversations yet.</p>
                </div>
              ) : (
                <div className="divide-y">
                  {contacts.map(({ id, contact, lastMessage, unreadCount }) => (
                    <button
                      key={id}
                      onClick={() => setSelectedContact(id)}
                      className={`w-full p-4 text-left transition-colors hover:bg-gray-50 ${
                        selectedContact === id ? 'bg-blue-50' : ''
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
                          <User className="h-5 w-5 text-green-600" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <h3 className="truncate font-semibold">{contact?.companyName || contact?.name || 'Unknown User'}</h3>
                            {unreadCount > 0 && (
                              <span className="rounded-full bg-blue-600 px-2 py-1 text-xs text-white">{unreadCount}</span>
                            )}
                          </div>
                          <p className="text-xs capitalize text-gray-500">{contact?.role || 'user'}</p>
                          <p className="truncate text-sm text-gray-600">
                            {lastMessage?.senderName}: {lastMessage?.message}
                          </p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="flex flex-col lg:col-span-2">
            {selectedContact && selectedContactInfo ? (
              <>
                <CardHeader className="border-b">
                  <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
                        <User className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <CardTitle>{selectedContactInfo.companyName || selectedContactInfo.name}</CardTitle>
                        <CardDescription className="capitalize">
                          {selectedContactInfo.role} in {selectedContactInfo.location}
                        </CardDescription>
                      </div>
                    </div>

                    <div className="grid gap-2 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        <span>{selectedContactInfo.email}</span>
                      </div>
                      {selectedContactInfo.phone && (
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4" />
                          <span>{selectedContactInfo.phone}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        <span>{selectedContactInfo.location}</span>
                      </div>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="flex-1 space-y-4 overflow-y-auto p-4">
                  {conversationMessages.length === 0 ? (
                    <div className="py-12 text-center text-gray-500">
                      <p>No messages yet. Start the conversation.</p>
                    </div>
                  ) : (
                    conversationMessages.map((message) => {
                      const isSent = message.senderId === user?.id;
                      return (
                        <div key={message.id} className={`flex ${isSent ? 'justify-end' : 'justify-start'}`}>
                          <div
                            className={`max-w-[80%] rounded-lg px-4 py-3 ${
                              isSent ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-900'
                            }`}
                          >
                            <p className={`mb-1 text-xs font-semibold ${isSent ? 'text-blue-100' : 'text-gray-500'}`}>
                              {message.senderName}
                            </p>
                            <p>{message.message}</p>
                            <p className={`mt-2 text-xs ${isSent ? 'text-blue-100' : 'text-gray-500'}`}>
                              {message.timestamp.toLocaleString([], {
                                day: '2-digit',
                                month: 'short',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </p>
                          </div>
                        </div>
                      );
                    })
                  )}
                </CardContent>

                <div className="border-t p-4">
                  <form onSubmit={handleSendMessage} className="flex gap-2">
                    <Input
                      placeholder={`Message ${selectedContactInfo.companyName || selectedContactInfo.name}`}
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      className="flex-1"
                    />
                    <Button type="submit" disabled={!newMessage.trim()}>
                      <Send className="h-4 w-4" />
                    </Button>
                  </form>
                </div>
              </>
            ) : (
              <CardContent className="flex h-full items-center justify-center text-gray-500">
                <div className="text-center">
                  <MessageSquare className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                  <p>Select a conversation to start messaging.</p>
                </div>
              </CardContent>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
