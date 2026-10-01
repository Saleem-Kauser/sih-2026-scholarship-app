import { useRouter } from 'expo-router';
import { useEffect, useState, useSyncExternalStore } from 'react';
import {
    ActivityIndicator,
    Keyboard,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

import { BottomNavBar, ScreenHeader } from '@/components/ui';
import { SpacingTokens as Spacing } from '@/constants/theme';
import { scholarshipSchemes } from '@/data/scholarships';
import { useTheme } from '@/hooks/use-theme';
import { translations, type JagoLanguage } from '@/i18n';
import { JagoChatError, sendJagoMessage } from '@/services/jago/jagoChatAdapter';
import type { AdminChatContext, StudentChatContext } from '@/types/jagoChat';
import { getApplications, getStudentDocuments } from '@/utils/applicationStore';
import { getQuickPromptsForRole } from '@/utils/jagoQuickPrompts';
import { getRole, subscribeRole } from '@/utils/roleStore';

interface ChatMessage {
  id: string;
  sender: 'user' | 'jago';
  text: string;
  timestamp: string;
}

let messageSequence = 1;
const CHAT_SESSION_ID = `jago-mobile-${Date.now().toString(36)}`;

function createMessageId(prefix: string): string {
  const id = `${prefix}-${messageSequence}`;
  messageSequence += 1;
  return id;
}

function getLocalizedStatus(status: string, language: JagoLanguage): string {
  const labels: Record<JagoLanguage, Record<string, string>> = {
    en: { submitted: 'Submitted', under_verification: 'Under verification', action_required: 'Manual review required', sanction_pending: 'Sanction pending', sanctioned: 'Sanctioned', disbursed: 'Disbursed', rejected: 'Rejected', verified: 'Verified', manual_review: 'Manual review', pending: 'Pending', failed: 'Failed' },
    ta: { submitted: 'சமர்ப்பிக்கப்பட்டது', under_verification: 'சரிபார்ப்பில் உள்ளது', action_required: 'கைமுறை மதிப்பாய்வு தேவை', sanction_pending: 'ஒப்புதல் நிலுவையில்', sanctioned: 'ஒப்புதல் வழங்கப்பட்டது', disbursed: 'வழங்கப்பட்டது', rejected: 'நிராகரிக்கப்பட்டது', verified: 'சரிபார்க்கப்பட்டது', manual_review: 'கைமுறை மதிப்பாய்வு', pending: 'நிலுவையில்', failed: 'தோல்வியடைந்தது' },
    hi: { submitted: 'जमा किया गया', under_verification: 'सत्यापन जारी', action_required: 'मैन्युअल समीक्षा आवश्यक', sanction_pending: 'स्वीकृति लंबित', sanctioned: 'स्वीकृत', disbursed: 'वितरित', rejected: 'अस्वीकृत', verified: 'सत्यापित', manual_review: 'मैन्युअल समीक्षा', pending: 'लंबित', failed: 'विफल' },
  };
  return labels[language][status] || status.replaceAll('_', ' ');
}

function createStudentContext(): StudentChatContext {
  const application = getApplications()[0];
  return {
    application: application ? {
      schemeId: application.schemeId,
      schemeName: application.schemeName,
      schemeShortName: application.schemeShortName,
      status: application.status,
      appliedDate: application.appliedDate,
      pendingAction: application.pendingAction,
      documents: application.documents.map(({ name, type, status, source, manualReviewReason }) => ({ name, type, status, source, manualReviewReason })),
    } : undefined,
    scholarships: scholarshipSchemes.map(({ id, name, shortName, description, portal, requiredDocuments }) => ({ id, name, shortName, description, portal, requiredDocuments })),
  };
}

function createAdminContext(): AdminChatContext {
  const applications = getApplications();
  const applicationCounts = applications.reduce<Record<string, number>>((counts, application) => {
    counts[application.status] = (counts[application.status] || 0) + 1;
    return counts;
  }, {});
  const schemes = Object.values(applications.reduce<Record<string, { name: string; count: number; underVerification: number }>>((counts, application) => {
    const entry = counts[application.schemeShortName] || { name: application.schemeShortName, count: 0, underVerification: 0 };
    entry.count += 1;
    if (application.status === 'under_verification') entry.underVerification += 1;
    counts[application.schemeShortName] = entry;
    return counts;
  }, {}));
  const documents = applications.flatMap((application) => application.documents);
  return {
    applicationCounts,
    schemes,
    verificationSummary: {
      pending: documents.filter((document) => document.status === 'pending').length,
      manualReview: documents.filter((document) => document.status === 'manual_review').length,
      verified: documents.filter((document) => document.status === 'verified').length,
    },
  };
}

function createLocalFallback(message: string, role: 'student' | 'admin', language: JagoLanguage): string {
  const strings = translations[language];
  const normalized = message.toLowerCase();
  if (role === 'admin') {
    if (normalized.includes('coverage') || normalized.includes('gap') || normalized.includes('unreached')) {
      return `${strings.prototypeUnavailable} ${strings.syntheticNotice}`;
    }
    const applications = getApplications();
    if (normalized.includes('application') || normalized.includes('verification')) {
      const counts = applications.reduce<Record<string, number>>((result, application) => {
        result[application.status] = (result[application.status] || 0) + 1;
        return result;
      }, {});
      const summary = Object.entries(counts).map(([status, count]) => `${getLocalizedStatus(status, language)}: ${count}`).join(' • ');
      return applications.length > 0 ? `${strings.applications}: ${applications.length}. ${summary}` : strings.noApplication;
    }
    return strings.unknownQuestion;
  }

  if (normalized.includes('status') || normalized.includes('application') || normalized.includes('நிலை') || normalized.includes('स्थिति')) {
    const application = getApplications()[0];
    if (!application) return strings.noApplication;
    const detail = application.pendingAction ? ` ${application.pendingAction}` : '';
    return `${strings.applicationStatus}: ${application.schemeShortName} — ${getLocalizedStatus(application.status, language)}.${detail}`;
  }
  if (normalized.includes('document') || normalized.includes('ஆவண') || normalized.includes('दस्तावेज़')) {
    const documents = getStudentDocuments();
    if (documents.length === 0) return strings.noDocuments;
    return documents.map((document) => `${document.name}: ${getLocalizedStatus(document.status, language)}`).join('\n');
  }
  if (normalized.includes('review') || normalized.includes('manual') || normalized.includes('மதிப்பாய்வு') || normalized.includes('समीक्षा')) {
    const document = getStudentDocuments().find((item) => item.status === 'manual_review');
    return document
      ? `${document.name}: ${getLocalizedStatus(document.status, language)}. ${document.manualReviewReason || ''} ${strings.reviewNotRejection}`.trim()
      : strings.prototypeUnavailable;
  }
  if (normalized.includes('scholarship') || normalized.includes('உதவித்தொகை') || normalized.includes('छात्रवृत्ति')) {
    const scheme = scholarshipSchemes.find((item) => normalized.includes(item.id) || normalized.includes(item.shortName.toLowerCase()));
    return scheme ? `${scheme.name}. ${scheme.description} ${scheme.documentGuidance || ''}`.trim() : strings.unknownQuestion;
  }
  return strings.unknownQuestion;
}

export default function AssistantScreen() {
  const router = useRouter();
  const theme = useTheme();
  const role = useSyncExternalStore(subscribeRole, getRole, getRole);

  const [input, setInput] = useState('');
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [language, setLanguage] = useState<JagoLanguage>('en');
  const [sending, setSending] = useState(false);
  const [assistantMode, setAssistantMode] = useState<'local' | 'ai'>('local');
  const strings = translations[language];
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-1',
      sender: 'jago',
      text: 'Hello! I am JAGO. I can help with information available in this prototype.',
      timestamp: 'Just now',
    },
  ]);
  const quickPrompts = getQuickPromptsForRole(role, language);

  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';
    const showSubscription = Keyboard.addListener(showEvent, () => setKeyboardVisible(true));
    const hideSubscription = Keyboard.addListener(hideEvent, () => setKeyboardVisible(false));
    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  const handleSend = async (textToSend?: string) => {
    const query = textToSend || input;
    if (!query.trim() || sending) return;
    const trimmedQuery = query.trim();

    const userMsg: ChatMessage = {
      id: createMessageId('usr'),
      sender: 'user',
      text: trimmedQuery,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInput('');
    setSending(true);

    let responseText: string;
    try {
      const chatResponse = await sendJagoMessage({
        message: trimmedQuery,
        role,
        language,
        sessionId: CHAT_SESSION_ID,
        ...(role === 'student' ? { studentContext: createStudentContext() } : { adminContext: createAdminContext() }),
      });
      responseText = chatResponse.answer;
      setAssistantMode('ai');
    } catch (error) {
      setAssistantMode('local');
      if (error instanceof JagoChatError && (error.status === 429 || error.code === 'RATE_LIMITED' || error.code === 'SESSION_LIMITED')) {
        responseText = `${strings.limited}\n\n${createLocalFallback(trimmedQuery, role, language)}`;
      } else {
        responseText = `${strings.fallback}\n\n${createLocalFallback(trimmedQuery, role, language)}`;
      }
    } finally {
      setSending(false);
    }

    setMessages((prev) => [...prev, {
      id: createMessageId('jago'),
      sender: 'jago',
      text: responseText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }]);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <ScreenHeader
        title="JAGO Assistant"
        subtitle={role === 'admin' ? strings.adminProfile : strings.studentProfile}
        rightContent={(
          <Pressable onPress={() => router.replace('/role-select')} style={styles.roleSwitchAction}>
            <Text style={styles.roleSwitchText}>{strings.switchRole}</Text>
          </Pressable>
        )}
      />

      <View style={styles.assistantToolbar}>
        <View style={styles.assistantStatusRow}>
          <Text style={[styles.assistantStatus, assistantMode === 'ai' ? styles.aiStatus : styles.localStatus]}>
            {assistantMode === 'ai' ? strings.aiReady : strings.aiLocal}
          </Text>
          {sending && <ActivityIndicator size="small" color="#1D4ED8" />}
        </View>
        <View style={styles.languageRow}>
          <Text style={styles.languageLabel}>{strings.language}</Text>
          {(['en', 'ta', 'hi'] as const).map((option) => (
            <Pressable
              key={option}
              onPress={() => setLanguage(option)}
              style={[styles.languageOption, language === option && styles.languageOptionActive]}
              accessibilityRole="button"
              accessibilityState={{ selected: language === option }}
            >
              <Text style={[styles.languageOptionText, language === option && styles.languageOptionTextActive]}>
                {option.toUpperCase()}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      <KeyboardAvoidingView
        style={styles.chatArea}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          style={styles.chatContainer}
          contentContainerStyle={styles.chatContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
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
                {msg.id === 'msg-1' ? strings.hello : msg.text}
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
          <Text style={styles.quickPromptsTitle}>{strings.quickQuestions}</Text>
          <View style={styles.chipsContainer}>
            {quickPrompts.map((prompt, idx) => (
              <TouchableOpacity
                key={`${role}-${language}-${idx}`}
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
          placeholder={strings.assistantPlaceholder}
          placeholderTextColor="#94A3B8"
          value={input}
          onChangeText={setInput}
          onSubmitEditing={() => handleSend()}
          returnKeyType="send"
          />
          <TouchableOpacity
          style={styles.sendButton}
          onPress={() => handleSend()}
          disabled={sending}
          activeOpacity={0.7}
          >
            <Text style={styles.sendButtonText}>{sending ? '…' : strings.send}</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      {!keyboardVisible && <BottomNavBar activeTab="assistant" />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  chatContainer: {
    flex: 1,
  },
  chatArea: {
    flex: 1,
  },
  assistantToolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    paddingHorizontal: Spacing.base,
    paddingVertical: 8,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  roleSwitchAction: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#BFDBFE',
    backgroundColor: '#EFF6FF',
    maxWidth: 104,
  },
  roleSwitchText: {
    color: '#1D4ED8',
    fontSize: 11,
    fontWeight: '700',
    textAlign: 'center',
  },
  assistantStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  assistantStatus: {
    fontSize: 11,
    fontWeight: '700',
  },
  aiStatus: {
    color: '#15803D',
  },
  localStatus: {
    color: '#64748B',
  },
  languageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  languageLabel: {
    color: '#64748B',
    fontSize: 11,
    marginRight: 2,
  },
  languageOption: {
    minWidth: 30,
    minHeight: 30,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    backgroundColor: '#FFFFFF',
  },
  languageOptionActive: {
    backgroundColor: '#EFF6FF',
    borderColor: '#1D4ED8',
  },
  languageOptionText: {
    color: '#475569',
    fontSize: 10,
    fontWeight: '600',
  },
  languageOptionTextActive: {
    color: '#1D4ED8',
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