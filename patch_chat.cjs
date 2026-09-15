const fs = require('fs');
let code = fs.readFileSync('src/components/shared/FormalCaseChat.jsx', 'utf8');

// Replace mock messages with state
const mockMsgTarget = `const [messages, setMessages] = useState([
    { id: 1, sender: 'Insp. R. Sharma', role: 'Investigating Officer', content: 'Initial scene secured. Forensic team dispatched.', timestamp: '10:30 AM', isMe: true },
    { id: 2, sender: 'Dr. Gupta', role: 'Forensic Lead', content: 'Team arrived. ETA for preliminary report is 4 hours.', timestamp: '10:45 AM', isMe: false },
    { id: 3, sender: 'SHO K. Singh', role: 'Station House Officer', content: 'Ensure all evidence is cryptographically signed before upload.', timestamp: '11:00 AM', isMe: false },
  ]);`;

const newMsgState = `const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  React.useEffect(() => {
    const fetchChat = async () => {
      try {
        const token = localStorage.getItem('anveshak_token');
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
        const res = await fetch(\`\${API_URL}/chat/case/\${caseId}\`, {
          headers: { Authorization: \`Bearer \${token}\` }
        });
        const data = await res.json();
        if(res.ok) {
           const mapped = data.messages.map(m => ({
             id: m._id,
             sender: m.senderId?.name || 'Unknown',
             role: m.senderId?.role || 'Officer',
             content: m.content,
             timestamp: new Date(m.timestamp).toLocaleTimeString(),
             isMe: false // simplified
           }));
           setMessages(mapped);
        }
      } catch(e) { console.error(e); } finally { setIsLoading(false); }
    };
    fetchChat();
  }, [caseId]);`;

code = code.replace(mockMsgTarget, newMsgState);

// Replace handleSendMessage
const handleSendTarget = `const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const newMsgObj = {
      id: messages.length + 1,
      sender: 'Insp. R. Sharma',
      role: 'Investigating Officer',
      content: newMessage,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isMe: true
    };

    setMessages([...messages, newMsgObj]);
    setNewMessage('');
  };`;

const newHandleSend = `const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      const token = localStorage.getItem('anveshak_token');
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
      const res = await fetch(\`\${API_URL}/chat/case/\${caseId}\`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: \`Bearer \${token}\` },
        body: JSON.stringify({ content: newMessage })
      });
      const data = await res.json();
      if(res.ok) {
        const newMsgObj = {
          id: data.message._id,
          sender: 'Me',
          role: 'Officer',
          content: newMessage,
          timestamp: new Date().toLocaleTimeString(),
          isMe: true
        };
        setMessages([...messages, newMsgObj]);
        setNewMessage('');
      }
    } catch(err) {
      console.error(err);
    }
  };`;

code = code.replace(handleSendTarget, newHandleSend);
fs.writeFileSync('src/components/shared/FormalCaseChat.jsx', code);
