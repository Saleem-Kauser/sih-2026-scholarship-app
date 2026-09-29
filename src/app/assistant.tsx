import { useState } from 'react';
import {
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

import { BottomNavBar, ScreenHeader } from '@/components/ui';
import { SpacingTokens as Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { getApplications, getStudentDocuments } from '@/utils/applicationStore';

interface ChatMessage {
  id: string;
  sender: 'user' | 'jago';
  text: string;
  timestamp: string;
}

const QUICK_PROMPTS = [
  'Am I eligible for Post-Matric Scholarship?',
  'What documents do I need?',
  'Why is my domicile cert under manual review?',
  'Check my application status',
];

let messageSequence = 1;

function createMessageId(prefix: string): string {
  const id = `${prefix}-${messageSequence}`;
  messageSequence += 1;
  return id;
}

function getApplicationStatusLabel(status: ReturnType<typeof getApplications>[number]['status']): string {
  switch (status) {
    case 'action_required':
      return 'MANUAL REVIEW REQUIRED';
    case 'sanction_pending':
      return 'SANCTION PENDING';
    case 'sanctioned':
      return 'SANCTIONED';
    case 'disbursed':
      return 'DISBURSED';
    case 'rejected':
      return 'REJECTED';
    default:
      return 'UNDER VERIFICATION';
  }
}

export default function AssistantScreen() {
  const theme = useTheme();

  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-1',
      sender: 'jago',
      text: 'Hello! I am JAGO, your unified scholarship assistant for tribal students. How can I help you today with your applications, eligibility, or document verification?',
      timestamp: 'Just now',
    },
  ]);

  const generateJagoResponse = (userText: string): string => {
    const text = userText.toLowerCase();

    if (text.includes('eligible') || text.includes('eligibility')) {
      return (
        'To be eligible for Tribal Scholarship schemes:\n' +
        '1. You must belong to the Scheduled Tribe (ST) category.\n' +
        '2. For Pre-Matric: Enrolled in Class IX or X.\n' +
        '3. For Post-Matric: Enrolled in recognized post-secondary courses.\n' +
        '4. Income limit: Annual family income within government guidelines (typically ≤ ₹2.5 Lakhs/year).'
      );
    }

    if (text.includes('document') || text.includes('need') || text.includes('require')) {
      const docs = getStudentDocuments();
      const verified = docs.filter((d) => d.status === 'verified').length;
      return (
        `You currently have ${verified} of ${docs.length} documents auto-verified in your JAGO Wallet.\n\n` +
        'Key required documents:\n' +
        '• ST Community Certificate (DigiLocker)\n' +
        '• Income Certificate (e-District)\n' +
        '• Domicile Certificate (e-District)\n' +
        '• Class X / XII Marksheets\n' +
        '• Bank Passbook / Aadhaar Seeded Account'
      );
    }

    if (text.includes('status') || text.includes('pending') || text.includes('application')) {
      const apps = getApplications();
      const latest = apps[0];

      if (latest) {
        return (
          `Your application for ${latest.schemeShortName} (ID: ${latest.id}) is currently ${getApplicationStatusLabel(latest.status)}.\n\n` +
          `Submitted Date: ${latest.appliedDate}\n` +
          `Pending Action: ${latest.pendingAction || 'None'}\n` +
          `Disbursement: ${latest.disbursementStatus || 'Pending'}`
        );
      }

      return 'You have 1 active scholarship application in progress. Use the Status tab to view details.';
    }

    if (text.includes('domicile') || text.includes('manual') || text.includes('review')) {
      return (
        'Your Domicile Certificate is under Manual Review because the automated e-District verification found a slight address spelling variation (82% fuzzy match).\n\n' +
        'Don\'t worry! Automated failure does NOT mean rejection. The District Nodal Officer will verify it manually on the Verifier Dashboard.'
      );
    }

    return (
      `Thank you for your question about "${userText}". JAGO assists tribal students with Pre-Matric, Post-Matric, Top Class, NFST, and NOS scholarship schemes.\n\n` +
      'Feel free to ask about document requirements, status tracking, or eligibility rules!'
    );
  };

  const handleSend = (textToSend?: string) => {
    const query = textToSend || input;
    if (!query.trim()) return;

    const userMsg: ChatMessage = {
      id: createMessageId('usr'),
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const jagoMsg: ChatMessage = {
      id: createMessageId('jago'),
      sender: 'jago',
      text: generateJagoResponse(query),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg, jagoMsg]);
    if (!textToSend) setInput('');
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: theme.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScreenHeader title="JAGO Assistant" subtitle="Unified Scholarship AI Helpdesk" />

      <ScrollView
        style={styles.chatContainer}
        contentContainerStyle={styles.chatContent}
        showsVerticalScrollIndicator={false}
      >
        {messages.map((msg) => (
          <View
            key={msg.id}
            style={[
              styles.messageWrapper,
              msg.sender === 'user' ? styles.userWrapper : styles.jagoWrapper,
            ]}
          >
            {msg.sender === 'jago' && (
              <View style={styles.avatarCircle}>
                <Text style={styles.avatarText}>J</Text>
              </View>
            )}

            <View
              style={[
                styles.messageBubble,
                msg.sender === 'user' ? styles.userBubble : styles.jagoBubble,
              ]}
            >
              <Text
                style={[
                  styles.messageText,
                  msg.sender === 'user' ? styles.userMessageText : styles.jagoMessageText,
                ]}
              >
                {msg.text}
              </Text>
              <Text
                style={[
                  styles.timestampText,
                  msg.sender === 'user' ? { color: '#BFDBFE' } : { color: '#94A3B8' },
                ]}
              >
                {msg.timestamp}
              </Text>
            </View>
          </View>
        ))}

        <View style={styles.quickPromptsSection}>
          <Text style={styles.quickPromptsTitle}>Quick Questions:</Text>
          <View style={styles.chipsContainer}>
            {QUICK_PROMPTS.map((prompt, idx) => (
              <TouchableOpacity
                key={idx}
                style={styles.chipButton}
                onPress={() => handleSend(prompt)}
                activeOpacity={0.7}
              >
                <Text style={styles.chipText}>{prompt}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.textInput}
          placeholder="Ask JAGO about scholarships, status..."
          placeholderTextColor="#94A3B8"
          value={input}
          onChangeText={setInput}
          onSubmitEditing={() => handleSend()}
          returnKeyType="send"
        />
        <TouchableOpacity
          style={styles.sendButton}
          onPress={() => handleSend()}
          activeOpacity={0.7}
        >
          <Text style={styles.sendButtonText}>Send</Text>
        </TouchableOpacity>
      </View>

      <BottomNavBar activeTab="assistant" />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  chatContainer: {
    flex: 1,
  },
  chatContent: {
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.base,
    paddingBottom: Spacing.lg,
  },
  messageWrapper: {
    flexDirection: 'row',
    marginBottom: Spacing.md,
    alignItems: 'flex-end',
  },
  userWrapper: {
    justifyContent: 'flex-end',
  },
  jagoWrapper: {
    justifyContent: 'flex-start',
  },
  avatarCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#1D4ED8',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  avatarText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 14,
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 12,
  },
  jagoBubble: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderBottomLeftRadius: 2,
  },
  userBubble: {
    backgroundColor: '#1D4ED8',
    borderBottomRightRadius: 2,
  },
  messageText: {
    fontSize: 14,
    lineHeight: 20,
  },
  jagoMessageText: {
    color: '#0F172A',
  },
  userMessageText: {
    color: '#FFFFFF',
  },
  timestampText: {
    fontSize: 10,
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  quickPromptsSection: {
    marginTop: Spacing.base,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  quickPromptsTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  chipButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  chipText: {
    fontSize: 12,
    color: '#1D4ED8',
    fontWeight: '500',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.base,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    gap: 8,
  },
  textInput: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    fontSize: 14,
    color: '#0F172A',
  },
  sendButton: {
    backgroundColor: '#1D4ED8',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
  },
  sendButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
});