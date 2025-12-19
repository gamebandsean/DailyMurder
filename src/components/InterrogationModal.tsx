import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { CharacterState } from '../types';
import { useGame } from '../context/GameContext';

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

  // Don't render anything if not visible or no character
  if (!visible || !character) return null;

  return (
    <View style={styles.overlay}>
      <View style={styles.modalContainer}>
        {/* Header with character */}
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

        {/* Conversation */}
        <ScrollView 
          ref={scrollViewRef}
          style={styles.conversationArea}
          contentContainerStyle={styles.conversationContent}
        >
          <View style={styles.systemMessage}>
            <Text style={styles.systemText}>
              Ask about their alibi, what they saw, or what they know about others.
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

        {/* Input */}
        <View style={styles.inputArea}>
          <TextInput
            style={styles.input}
            placeholder="Ask a question..."
            placeholderTextColor="#6B5344"
            value={question}
            onChangeText={setQuestion}
            onSubmitEditing={handleAsk}
            returnKeyType="send"
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
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    padding: 16,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#2C1810',
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#4A3228',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    backgroundColor: '#1A0F0A',
    borderBottomWidth: 1,
    borderBottomColor: '#4A3228',
  },
  characterImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: '#D4A574',
  },
  characterInfo: {
    flex: 1,
    marginLeft: 12,
  },
  characterName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#D4A574',
  },
  characterOccupation: {
    fontSize: 11,
    color: '#8B7355',
    marginTop: 2,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#3D2617',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 16,
    color: '#D4A574',
  },
  conversationArea: {
    flex: 1,
    paddingHorizontal: 14,
  },
  conversationContent: {
    paddingVertical: 14,
  },
  systemMessage: {
    backgroundColor: '#3D2617',
    padding: 10,
    borderRadius: 8,
    marginBottom: 12,
  },
  systemText: {
    fontSize: 11,
    color: '#8B7355',
    fontStyle: 'italic',
    textAlign: 'center',
  },
  messageBubble: {
    maxWidth: '85%',
    padding: 10,
    borderRadius: 12,
    marginBottom: 8,
  },
  questionBubble: {
    alignSelf: 'flex-end',
    backgroundColor: '#8B2323',
    borderBottomRightRadius: 4,
  },
  answerBubble: {
    alignSelf: 'flex-start',
    backgroundColor: '#3D2617',
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 13,
    lineHeight: 18,
  },
  questionText: {
    color: '#FFF',
  },
  answerText: {
    color: '#E8DDD4',
  },
  typingIndicator: {
    color: '#8B7355',
    fontSize: 16,
    letterSpacing: 3,
  },
  inputArea: {
    flexDirection: 'row',
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: '#4A3228',
    backgroundColor: '#1A0F0A',
  },
  input: {
    flex: 1,
    backgroundColor: '#3D2617',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 13,
    color: '#E8DDD4',
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#4A3228',
  },
  sendButton: {
    backgroundColor: '#8B2323',
    paddingHorizontal: 18,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#4A3228',
  },
  sendButtonText: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 12,
    letterSpacing: 1,
  },
});
