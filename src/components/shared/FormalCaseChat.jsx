
import React, { useEffect, useState } from 'react';

import {
  MessageSquare,
  Users,
  Pin,
  Paperclip,
  Send,
  AtSign,
  Eye,
  FileText,
  File,
  ExternalLink,
  ChevronDown,
  Menu,
  X
} from 'lucide-react';

import { io } from 'socket.io-client';

import { useAuth } from '../../contexts/AuthContext';

import { apiFetch } from '../../utils/api';

const SOCKET_URL = 'http://localhost:5001';

const getRoleStyles = (role) => {
  const normalizedRole = (role || '').toLowerCase();

  switch (normalizedRole) {
    case 'judiciary':
    case 'court':
      return 'bg-purple-100 text-purple-800 border-purple-200';

    case 'police':
      return 'bg-blue-100 text-blue-800 border-blue-200';

    case 'forensics':
    case 'investigating_agency':
    case 'investigating agency':
      return 'bg-teal-100 text-teal-800 border-teal-200';

    case 'complainant':
    case 'citizen':
      return 'bg-amber-100 text-amber-800 border-amber-200';

    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

const getVisibilityStyles = (visibility) => {
  const vis = (visibility || '').toLowerCase();

  if (vis.includes('all')) {
    return 'text-forest bg-forest/10 border-forest/20';
  }

  if (vis.includes('internal')) {
    return 'text-alert bg-alert/10 border-alert/20';
  }

  return 'text-saffron bg-saffron/10 border-saffron/20';
};

const normalizeParticipant = (participant) => {
  if (!participant) return null;

  const user =
    participant.user ||
    participant.userId ||
    participant;

  return {
    id:
      user.id ||
      user._id ||
      participant.id ||
      participant._id,

    name:
      user.name ||
      participant.name ||
      user.email ||
      participant.email ||
      'Authorized User',

    designation:
      user.designation ||
      participant.designation ||
      user.role ||
      participant.role ||
      'Authorized User',

    department:
      user.department ||
      participant.department ||
      '',

    role:
      user.role ||
      participant.role ||
      'Other'
  };
};

const normalizeMessage = (message) => {
  if (!message) return null;

  const sender =
    message.sender ||
    message.senderId ||
    message.user ||
    {};

  const senderRole =
    sender.role ||
    message.senderRole ||
    'Other';

  const senderName =
    sender.name ||
    message.senderName ||
    sender.email ||
    message.senderEmail ||
    'Authorized User';

  const senderDesignation =
    sender.designation ||
    message.senderDesignation ||
    sender.department ||
    message.department ||
    senderRole;

  return {
    id:
      message._id ||
      message.id ||
      `msg-${Date.now()}-${Math.random()}`,

    senderName,

    senderDesignation,

    senderRole,

    senderId:
      sender._id ||
      sender.id ||
      message.senderId,

    timestamp:
      message.createdAt ||
      message.timestamp ||
      new Date().toISOString(),

    subject:
      message.subject ||
      'Formal Case Communication',

    body:
      message.body ||
      message.text ||
      message.message ||
      '',

    visibility:
      message.visibility ||
      'All Participants',

    isPinned:
      Boolean(
        message.isPinned ||
        message.pinned
      ),

    attachments:
      Array.isArray(message.attachments)
        ? message.attachments
        : []
  };
};

const FormalCaseChat = ({
  caseId = 'CASE-0000',
  caseName = 'Untitled Case',
  currentStage = 'Investigation'
}) => {
  const { user } = useAuth();

  const [messages, setMessages] = useState([]);
  const [participants, setParticipants] = useState([]);

  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [composeSubject, setComposeSubject] =
    useState('');

  const [composeBody, setComposeBody] =
    useState('');

  const [visibility, setVisibility] =
    useState('All Participants');

  const [mentionDropdownOpen, setMentionDropdownOpen] =
    useState(false);

  const [loading, setLoading] = useState(true);

  const [sending, setSending] = useState(false);

  const [chatError, setChatError] = useState('');

  useEffect(() => {
    let mounted = true;

    const loadChat = async () => {
      try {
        setLoading(true);
        setChatError('');

        const response = await apiFetch(
          `/chat/case/${caseId}`
        );

        if (!mounted) return;

        const rawMessages = Array.isArray(response)
  ? response
  : response?.messages ||
    response?.data?.messages ||
    response?.data ||
    [];

        const rawParticipants =
          response?.participants ||
          response?.data?.participants ||
          [];

        const normalizedMessages =
          Array.isArray(rawMessages)
            ? rawMessages
                .map(normalizeMessage)
                .filter(Boolean)
            : [];

        const normalizedParticipants =
          Array.isArray(rawParticipants)
            ? rawParticipants
                .map(normalizeParticipant)
                .filter(Boolean)
            : [];

        setMessages(normalizedMessages);
        setParticipants(
          normalizedParticipants
        );
      } catch (error) {
        console.error(
          'Failed to load case chat:',
          error
        );

        if (mounted) {
          setChatError(
            error.message ||
              'Unable to load case communications.'
          );

          setMessages([]);
          setParticipants([]);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    if (caseId) {
      loadChat();
    }

    return () => {
      mounted = false;
    };
  }, [caseId]);

  useEffect(() => {
    if (!caseId) return;

    const token =
      localStorage.getItem('anveshak_token');

    if (!token) return;

    const socket = io(SOCKET_URL, {
      auth: {
        token
      }
    });

    socket.on('connect', () => {
      console.log(
        'Connected to Anveshak case chat'
      );

      socket.emit('joinCase', {
        caseId
      });
    });

    socket.on('connect_error', (error) => {
      console.error(
        'Chat socket connection failed:',
        error.message
      );
    });

    const handleIncomingMessage = (incomingMessage) => {
      const normalized =
        normalizeMessage(
          incomingMessage
        );

      if (!normalized) return;

      setMessages((previous) => {
        const alreadyExists =
          previous.some(
            (message) =>
              message.id ===
              normalized.id
          );

        if (alreadyExists) {
          return previous;
        }

        return [
          ...previous,
          normalized
        ];
      });
    };

    socket.on(
      'receiveMessage',
      handleIncomingMessage
    );

    socket.on(
      'newMessage',
      handleIncomingMessage
    );

    return () => {
      socket.emit('leaveCase', {
        caseId
      });

      socket.off(
        'receiveMessage',
        handleIncomingMessage
      );

      socket.off(
        'newMessage',
        handleIncomingMessage
      );

      socket.disconnect();
    };
  }, [caseId]);

  const groupedParticipants =
    (
      Array.isArray(participants)
        ? participants
        : []
    ).reduce((acc, participant) => {
      const role =
        participant.role ||
        'Other';

      if (!acc[role]) {
        acc[role] = [];
      }

      acc[role].push(participant);

      return acc;
    }, {});

  const handleSendMessage = async (e) => {
    e.preventDefault();

    if (
      !composeBody.trim() ||
      !composeSubject.trim() ||
      sending
    ) {
      return;
    }

    try {
      setSending(true);
      setChatError('');

      const payload = {
        subject:
          composeSubject.trim(),

        body:
          composeBody.trim(),

        text:
          composeBody.trim(),

        visibility
      };

      const response = await apiFetch(
        `/chat/case/${caseId}`,
        {
          method: 'POST',
          body: JSON.stringify(
            payload
          )
        }
      );

      const returnedMessage =
        response?.message ||
        response?.data?.message ||
        response?.data ||
        null;

      if (returnedMessage) {
        const normalized =
          normalizeMessage(
            returnedMessage
          );

        if (normalized) {
          setMessages((previous) => {
            const exists =
              previous.some(
                (message) =>
                  message.id ===
                  normalized.id
              );

            if (exists) {
              return previous;
            }

            return [
              ...previous,
              normalized
            ];
          });
        }
      } else {
        const refreshed =
          await apiFetch(
            `/chat/case/${caseId}`
          );

        const rawMessages =
          refreshed?.messages ||
          refreshed?.data?.messages ||
          refreshed?.data ||
          [];

        if (Array.isArray(rawMessages)) {
          setMessages(
            rawMessages
              .map(normalizeMessage)
              .filter(Boolean)
          );
        }
      }

      setComposeSubject('');
      setComposeBody('');
    } catch (error) {
      console.error(
        'Failed to send case message:',
        error
      );

      setChatError(
        error.message ||
          'Unable to send message.'
      );
    } finally {
      setSending(false);
    }
  };

  const insertMention = (name) => {
    setComposeBody(
      (previous) =>
        `${previous}@${name} `
    );

    setMentionDropdownOpen(false);
  };

  const renderMessageBody = (text) => {
    if (!text) return null;

    const parts = text.split(
      /(@\w+(?: \w+)?)/g
    );

    return parts.map((part, index) => {
      if (part.startsWith('@')) {
        return (
          <span
            key={index}
            className="text-navy font-semibold bg-blue-50 px-1 rounded"
          >
            {part}
          </span>
        );
      }

      return (
        <span key={index}>
          {part}
        </span>
      );
    });
  };

  return (
    <div className="flex flex-col h-full bg-cream border border-charcoal/10 rounded-lg overflow-hidden glass-card shadow-sm">

      {/* SECTION A: Pinned Case Summary Panel */}

      <div className="bg-white border-b border-charcoal/10 p-4 shrink-0 shadow-sm z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">

        <div>
          <div className="flex items-center gap-3 mb-1">

            <h2 className="text-xl font-bold text-navy font-serif">
              {caseId}: {caseName}
            </h2>

            <span className="px-3 py-1 bg-navy/10 text-navy text-xs font-semibold rounded-full uppercase tracking-wider">
              {currentStage}
            </span>

          </div>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-charcoal/70">

            <div className="flex items-center gap-1.5">
              <Users className="w-4 h-4 text-navy" />

              <span>
                {participants.length}{' '}
                Total Participants
              </span>
            </div>

            {Object.entries(
              groupedParticipants
            ).map(
              ([role, list]) => (
                <span
                  key={role}
                  className="flex items-center gap-1"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-charcoal/40"></span>

                  {list.length} {role}
                </span>
              )
            )}

          </div>
        </div>

        <button
          onClick={() =>
            setSidebarOpen(
              !sidebarOpen
            )
          }
          className="md:hidden flex items-center justify-center p-2 rounded-md bg-white border border-charcoal/20 text-navy hover:bg-gray-50"
        >
          {sidebarOpen ? (
            <X className="w-5 h-5" />
          ) : (
            <Menu className="w-5 h-5" />
          )}

          <span className="ml-2 font-medium text-sm">
            Participants
          </span>
        </button>

      </div>

      <div className="flex flex-1 overflow-hidden relative">

        {/* SECTION B: Participant Sidebar */}

        <div
          className={`
            absolute md:static inset-y-0 left-0 z-20 w-72 bg-white border-r border-charcoal/10 overflow-y-auto transition-transform duration-300 ease-in-out shadow-lg md:shadow-none
            ${
              sidebarOpen
                ? 'translate-x-0'
                : '-translate-x-full md:translate-x-0'
            }
          `}
        >

          <div className="p-4 border-b border-charcoal/10 bg-gray-50 sticky top-0">

            <h3 className="font-semibold text-navy flex items-center gap-2">
              <Users className="w-5 h-5" />
              Directory
            </h3>

          </div>

          <div className="p-4 space-y-6">

            {Object.entries(
              groupedParticipants
            ).map(
              ([role, list]) => (
                <div
                  key={role}
                  className="space-y-3"
                >

                  <h4 className="text-xs font-bold text-charcoal uppercase tracking-wider border-b border-charcoal/10 pb-1">
                    {role} ({list.length})
                  </h4>

                  <div className="space-y-3">

                    {list.map(
                      (participant, index) => (
                        <div
                          key={
                            participant.id ||
                            index
                          }
                          className="flex flex-col"
                        >

                          <span className="text-sm font-semibold text-navy">
                            {participant.name}
                          </span>

                          <span className="text-xs text-charcoal/70">
                            {
                              participant.designation
                            }
                          </span>

                          {participant.department && (
                            <span className="text-xs text-charcoal/50">
                              {
                                participant.department
                              }
                            </span>
                          )}

                          <div className="mt-1">

                            <span
                              className={`inline-block px-2 py-0.5 text-[10px] font-bold uppercase rounded border ${getRoleStyles(
                                role
                              )}`}
                            >
                              {role}
                            </span>

                          </div>

                        </div>
                      )
                    )}

                  </div>
                </div>
              )
            )}

            {participants.length === 0 &&
              !loading && (
                <p className="text-xs text-charcoal/50">
                  No participants available for this case.
                </p>
              )}

          </div>
        </div>

        {/* SECTION C: Message Thread */}

        <div className="flex-1 flex flex-col bg-slate-50/50">

          <div className="flex-1 overflow-y-auto p-4 space-y-6">

            {loading ? (
              <div className="flex flex-col items-center justify-center h-full text-charcoal/40">
                <MessageSquare className="w-12 h-12 mb-3 opacity-20" />

                <p>
                  Loading formal communications...
                </p>
              </div>
            ) : chatError &&
              messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-charcoal/40">
                <MessageSquare className="w-12 h-12 mb-3 opacity-20" />

                <p className="text-sm text-center max-w-md">
                  {chatError}
                </p>
              </div>
            ) : messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-charcoal/40">
                <MessageSquare className="w-12 h-12 mb-3 opacity-20" />

                <p>
                  No formal communications recorded yet.
                </p>
              </div>
            ) : (
              messages.map(
                (message, index) => (
                  <div
                    key={message.id}
                    className={`bg-white border border-charcoal/10 rounded-lg shadow-sm overflow-hidden scale-in ${
                      index % 2 === 1
                        ? 'bg-navy/5'
                        : ''
                    }`}
                  >

                    {/* Message Header */}

                    <div className="flex items-start justify-between p-3 border-b border-charcoal/10 bg-white">

                      <div className="flex items-center gap-3">

                        <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center border border-charcoal/10 text-navy font-bold">
                          {(
                            message.senderName ||
                            '?'
                          ).charAt(0)}
                        </div>

                        <div>

                          <div className="flex items-center gap-2 flex-wrap">

                            <span className="font-semibold text-navy">
                              {
                                message.senderName
                              }
                            </span>

                            <span
                              className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded border ${getRoleStyles(
                                message.senderRole
                              )}`}
                            >
                              {
                                message.senderRole
                              }
                            </span>

                            {message.isPinned && (
                              <span className="flex items-center gap-1 px-1.5 py-0.5 bg-saffron/10 text-saffron border border-saffron/20 rounded text-[10px] font-bold uppercase">
                                <Pin className="w-3 h-3" />
                                Pinned
                              </span>
                            )}

                          </div>

                          <div className="text-xs text-charcoal/70">
                            {
                              message.senderDesignation
                            }{' '}
                            •{' '}
                            {new Date(
                              message.timestamp
                            ).toLocaleString(
                              'en-IN'
                            )}
                          </div>

                        </div>

                      </div>
                    </div>

                    {/* Message Content */}

                    <div className="p-4 space-y-3">

                      <h4 className="font-serif font-bold text-lg text-charcoal">
                        {message.subject}
                      </h4>

                      <div className="text-sm text-charcoal whitespace-pre-wrap leading-relaxed">
                        {renderMessageBody(
                          message.body
                        )}
                      </div>

                      {/* Attachments */}

                      {message.attachments &&
                        message.attachments.length >
                          0 && (
                          <div className="mt-4 pt-4 border-t border-charcoal/10">

                            <p className="text-xs font-semibold text-charcoal/60 uppercase tracking-wider mb-2">
                              Attachments
                            </p>

                            <div className="flex flex-wrap gap-3">

                              {message.attachments.map(
                                (
                                  file,
                                  fileIndex
                                ) => (
                                  <div
                                    key={
                                      fileIndex
                                    }
                                    className="flex items-center gap-3 p-2 bg-white border border-charcoal/20 rounded-md shadow-sm min-w-[200px]"
                                  >

                                    <div className="p-2 bg-navy/5 rounded text-navy">
                                      {(
                                        file.type ||
                                        ''
                                      ).includes(
                                        'pdf'
                                      ) ? (
                                        <FileText className="w-5 h-5" />
                                      ) : (
                                        <File className="w-5 h-5" />
                                      )}
                                    </div>

                                    <div className="flex-1 min-w-0">

                                      <p className="text-sm font-medium text-navy truncate">
                                        {
                                          file.filename
                                        }
                                      </p>

                                      <p className="text-xs text-charcoal/60">
                                        {
                                          file.size
                                        }{' '}
                                        •{' '}
                                        {
                                          file.uploadedBy
                                        }
                                      </p>

                                    </div>

                                    <a
                                      href={
                                        file.url ||
                                        '#'
                                      }
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="p-1.5 text-navy hover:bg-navy/10 rounded transition-colors"
                                      title="View File"
                                    >
                                      <ExternalLink className="w-4 h-4" />
                                    </a>

                                  </div>
                                )
                              )}

                            </div>
                          </div>
                        )}

                    </div>

                    {/* Visibility Tag */}

                    <div className="px-4 py-2 bg-gray-50 border-t border-charcoal/10 flex items-center gap-2">

                      <Eye className="w-4 h-4 text-charcoal/50" />

                      <span
                        className={`px-2 py-0.5 text-xs font-semibold border rounded-full ${getVisibilityStyles(
                          message.visibility
                        )}`}
                      >
                        Visible to:{' '}
                        {
                          message.visibility
                        }
                      </span>

                    </div>

                  </div>
                )
              )
            )}

          </div>

          {/* SECTION D: Compose Area */}

          <div className="p-4 bg-white border-t border-charcoal/20 z-10">

            {chatError &&
              messages.length > 0 && (
                <div className="mb-3 px-3 py-2 bg-rose-50 border border-rose-200 rounded-md text-xs text-rose-700">
                  {chatError}
                </div>
              )}

            <form
              onSubmit={
                handleSendMessage
              }
              className="space-y-3"
            >

              <input
                type="text"
                placeholder="Subject (Formal)"
                value={composeSubject}
                onChange={(e) =>
                  setComposeSubject(
                    e.target.value
                  )
                }
                className="w-full px-3 py-2 bg-gray-50 border border-charcoal/20 rounded-md text-sm font-serif focus:outline-none focus:ring-2 focus:ring-navy/50 focus:border-transparent transition-all"
                required
              />

              <div className="relative">

                <textarea
                  placeholder="Draft your formal memo or update here..."
                  value={composeBody}
                  onChange={(e) =>
                    setComposeBody(
                      e.target.value
                    )
                  }
                  className="w-full h-24 px-3 py-2 bg-gray-50 border border-charcoal/20 rounded-md text-sm resize-none focus:outline-none focus:ring-2 focus:ring-navy/50 focus:border-transparent transition-all"
                  required
                />

                {/* Mention Dropdown */}

                {mentionDropdownOpen && (
                  <div className="absolute bottom-full left-0 mb-2 w-64 bg-white border border-charcoal/20 rounded-md shadow-lg overflow-hidden z-30">

                    <div className="p-2 bg-gray-50 border-b border-charcoal/10 text-xs font-semibold text-charcoal">
                      Select Participant to Mention
                    </div>

                    <div className="max-h-48 overflow-y-auto">

                      {participants.map(
                        (
                          participant,
                          index
                        ) => (
                          <button
                            key={
                              participant.id ||
                              index
                            }
                            type="button"
                            onClick={() =>
                              insertMention(
                                participant.name
                              )
                            }
                            className="w-full text-left px-3 py-2 text-sm hover:bg-navy/5 focus:bg-navy/5 transition-colors border-b border-charcoal/5 last:border-0"
                          >
                            <span className="font-semibold text-navy">
                              {
                                participant.name
                              }
                            </span>

                            <span className="block text-xs text-charcoal/70">
                              {
                                participant.designation
                              }
                            </span>
                          </button>
                        )
                      )}

                    </div>
                  </div>
                )}

              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">

                <div className="flex items-center gap-2">

                  <div className="relative">

                    <select
                      value={visibility}
                      onChange={(e) =>
                        setVisibility(
                          e.target.value
                        )
                      }
                      className="appearance-none pl-8 pr-8 py-2 bg-gray-50 border border-charcoal/20 rounded-md text-sm text-navy font-medium focus:outline-none focus:ring-2 focus:ring-navy/50 cursor-pointer"
                    >
                      <option value="All Participants">
                        All Participants
                      </option>

                      <option value="Police & Forensics Only">
                        Police & Forensics Only
                      </option>

                      <option value="Internal — Police Only">
                        Internal — Police Only
                      </option>
                    </select>

                    <Eye className="w-4 h-4 text-charcoal/50 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />

                    <ChevronDown className="w-4 h-4 text-charcoal/50 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />

                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      setMentionDropdownOpen(
                        !mentionDropdownOpen
                      )
                    }
                    className="p-2 text-navy hover:bg-navy/10 rounded-md transition-colors border border-transparent hover:border-charcoal/20"
                    title="Mention Participant"
                  >
                    <AtSign className="w-5 h-5" />
                  </button>

                  <button
                    type="button"
                    className="p-2 text-navy hover:bg-navy/10 rounded-md transition-colors border border-transparent hover:border-charcoal/20"
                    title="Attach File"
                  >
                    <Paperclip className="w-5 h-5" />
                  </button>

                </div>

                <button
                  type="submit"
                  disabled={
                    !composeSubject.trim() ||
                    !composeBody.trim() ||
                    sending
                  }
                  className="flex items-center justify-center gap-2 px-6 py-2 bg-navy text-white text-sm font-semibold rounded-md hover:bg-navy/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
                >
                  <Send className="w-4 h-4" />

                  {sending
                    ? 'Sending...'
                    : 'Submit Entry'}
                </button>

              </div>

            </form>

          </div>

        </div>

      </div>
    </div>
  );
};

export default FormalCaseChat;













