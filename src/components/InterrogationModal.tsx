import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  Modal,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
} from 'react-native';
import { CharacterState } from '../types';
import { useGame } from '../context/GameContext';

const { width, height } = Dimensions.get('window');

interface Props {
  visible: boolean;
  character: CharacterState | null;
  onClose: () => void;
}

export default function InterrogationModal({ visible, character, onClose }: Props) {
  const [question, setQuestion] = useState('');
  const [conversation, setConversation] = useState<{ type: 'q' | 'a'; text: string }[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const { askQuestion } = useGame();

  const handleAsk = async () => {
    if (!question.trim() || !character) return;
    
    const q = question.trim();
    setQuestion('');
    setConversation(prev => [...prev, { type: 'q', text: q }]);
    setIsTyping(true);
    
    // Simulate thinking delay
    await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000));
    
    const answer = askQuestion(character.suspect.id, q);
    setIsTyping(false);
    setConversation(prev => [...prev, { type: 'a', text: answer }]);
    
    // Scroll to bottom
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const handleClose = () => {
    setConversation([]);
    setQuestion('');
    setIsTyping(false);
    onClose();
  };

  if (!character) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView 
        style={styles.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.modalContainer}>
          {/* Header with character info */}
          <View style={styles.header}>
            <Image
              source={character.suspect.image}
              style={styles.characterImage}
              resizeMode="cover"
            />
            <View style={styles.characterInfo}>
              <Text style={styles.characterName}>{character.suspect.name}</Text>
              <Text style={styles.characterOccupation}>{character.suspect.occupation}</Text>
            </View>
            <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Conversation area */}
          <ScrollView 
            ref={scrollViewRef}
            style={styles.conversationArea}
            contentContainerStyle={styles.conversationContent}
          >
            {/* Initial prompt */}
            <View style={styles.systemMessage}>
              <Text style={styles.systemText}>
                You are interrogating {character.suspect.name}. Ask anything about the crime, 
                the victim, their whereabouts, or other suspects.
              </Text>
            </View>

            {conversation.map((msg, index) => (
              <View
                key={index}
                style={[
                  styles.messageBubble,
                  msg.type === 'q' ? styles.questionBubble : styles.answerBubble,
                ]}
              >
                <Text style={[
                  styles.messageText,
                  msg.type === 'q' ? styles.questionText : styles.answerText,
                ]}>
                  {msg.text}
                </Text>
              </View>
            ))}

            {isTyping && (
              <View style={[styles.messageBubble, styles.answerBubble]}>
                <Text style={styles.typingIndicator}>• • •</Text>
              </View>
            )}
          </ScrollView>

          {/* Input area */}
          <View style={styles.inputArea}>
            <TextInput
              style={styles.input}
              placeholder="Ask a question..."
              placeholderTextColor="#6B5344"
              value={question}
              onChangeText={setQuestion}
              onSubmitEditing={handleAsk}
              returnKeyType="send"
              multiline={false}
            />
            <TouchableOpacity 
              style={[styles.sendButton, !question.trim() && styles.sendButtonDisabled]}
              onPress={handleAsk}
              disabled={!question.trim() || isTyping}
            >
              <Text style={styles.sendButtonText}>ASK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#2C1810',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    height: height * 0.85,
    borderTopWidth: 2,
    borderLeftWidth: 2,
    borderRightWidth: 2,
    borderColor: '#4A3228',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#4A3228',
    backgroundColor: '#1A0F0A',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  characterImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: '#D4A574',
  },
  characterInfo: {
    flex: 1,
    marginLeft: 12,
  },
  characterName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#D4A574',
  },
  characterOccupation: {
    fontSize: 14,
    color: '#8B7355',
    marginTop: 2,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#3D2617',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 18,
    color: '#D4A574',
  },
  conversationArea: {
    flex: 1,
    paddingHorizontal: 16,
  },
  conversationContent: {
    paddingVertical: 16,
  },
  systemMessage: {
    backgroundColor: '#3D2617',
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
  },
  systemText: {
    fontSize: 13,
    color: '#8B7355',
    fontStyle: 'italic',
    textAlign: 'center',
    lineHeight: 18,
  },
  messageBubble: {
    maxWidth: '85%',
    padding: 12,
    borderRadius: 16,
    marginBottom: 8,
  },
  questionBubble: {
    alignSelf: 'flex-end',
    backgroundColor: '#8B2323',
    borderBottomRightRadius: 4,
  },
  answerBubble: {
    alignSelf: 'flex-start',
    backgroundColor: '#4A3228',
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 22,
  },
  questionText: {
    color: '#FFF',
  },
  answerText: {
    color: '#E8DDD4',
  },
  typingIndicator: {
    color: '#8B7355',
    fontSize: 20,
    letterSpacing: 4,
  },
  inputArea: {
    flexDirection: 'row',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#4A3228',
    backgroundColor: '#1A0F0A',
  },
  input: {
    flex: 1,
    backgroundColor: '#3D2617',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    color: '#E8DDD4',
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#4A3228',
  },
  sendButton: {
    backgroundColor: '#8B2323',
    paddingHorizontal: 20,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#4A3228',
  },
  sendButtonText: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 14,
    letterSpacing: 1,
  },
});

