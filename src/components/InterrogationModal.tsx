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
import { CharacterState, CharacterEvidence } from '../types';
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
  const { askQuestion, gameState, getQuestionsRemaining, canAskQuestions } = useGame();

  const handleAsk = async () => {
    if (!question.trim() || !character || !canAskQuestions()) return;
    
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

  // Get evidence for this character
  const evidence: CharacterEvidence = gameState.characterEvidence.get(character.suspect.id) || {
    nameRevealed: false,
    relationshipRevealed: false,
    itemRevealed: false,
    motiveRevealed: false,
    motiveText: null,
    meansRevealed: false,
    meansText: null,
    opportunityRevealed: false,
    opportunityText: null,
  };

  const hoursRemaining = getQuestionsRemaining();

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
          <View style={styles.hoursLeft}>
            <Text style={styles.hoursText}>{hoursRemaining}h</Text>
          </View>
          <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
        </View>

        {/* Fact Sheet */}
        <View style={styles.factSheet}>
          <Text style={styles.factSheetTitle}>📋 SUSPECT PROFILE</Text>
          <View style={styles.factGrid}>
            <View style={styles.factItem}>
              <Text style={styles.factLabel}>NAME</Text>
              <Text style={styles.factValue}>
                {evidence.nameRevealed ? character.suspect.name : '???'}
              </Text>
            </View>
            <View style={styles.factItem}>
              <Text style={styles.factLabel}>RELATIONSHIP</Text>
              <Text style={styles.factValue}>
                {evidence.relationshipRevealed ? character.relationshipToVictim : '???'}
              </Text>
            </View>
            <View style={styles.factItem}>
              <Text style={styles.factLabel}>ITEM</Text>
              <Text style={styles.factValue}>
                {evidence.itemRevealed ? `${character.item.emoji} ${character.item.name}` : '???'}
              </Text>
            </View>
          </View>
        </View>

        {/* Conversation */}
        <ScrollView 
          ref={scrollViewRef}
          style={styles.conversationArea}
          contentContainerStyle={styles.conversationContent}
        >
          <View style={styles.systemMessage}>
            <Text style={styles.systemText}>
              Ask about their alibi, motive, what they're carrying, or what they know about others.
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

        {/* Evidence Boxes - MOTIVE, MEANS, OPPORTUNITY */}
        <View style={styles.evidenceSection}>
          <View style={[styles.evidenceBox, evidence.motiveRevealed && styles.evidenceBoxFilled]}>
            <Text style={styles.evidenceLabel}>MOTIVE</Text>
            <Text style={styles.evidenceValue} numberOfLines={2}>
              {evidence.motiveRevealed ? evidence.motiveText : '—'}
            </Text>
          </View>
          <View style={[styles.evidenceBox, evidence.meansRevealed && styles.evidenceBoxFilled]}>
            <Text style={styles.evidenceLabel}>MEANS</Text>
            <Text style={styles.evidenceValue} numberOfLines={2}>
              {evidence.meansRevealed ? evidence.meansText : '—'}
            </Text>
          </View>
          <View style={[styles.evidenceBox, evidence.opportunityRevealed && styles.evidenceBoxFilled]}>
            <Text style={styles.evidenceLabel}>OPPORTUNITY</Text>
            <Text style={styles.evidenceValue} numberOfLines={2}>
              {evidence.opportunityRevealed ? evidence.opportunityText : '—'}
            </Text>
          </View>
        </View>

        {/* Check if all three are revealed (potential killer) */}
        {evidence.motiveRevealed && evidence.meansRevealed && evidence.opportunityRevealed && (
          <View style={styles.suspectAlert}>
            <Text style={styles.suspectAlertText}>
              ⚠️ ALL THREE ELEMENTS CONFIRMED - PRIME SUSPECT ⚠️
            </Text>
          </View>
        )}

        {/* Input */}
        <View style={styles.inputArea}>
          <TextInput
            style={styles.input}
            placeholder={canAskQuestions() ? "Ask a question..." : "No time remaining..."}
            placeholderTextColor="#6B5344"
            value={question}
            onChangeText={setQuestion}
            onSubmitEditing={handleAsk}
            returnKeyType="send"
            editable={canAskQuestions()}
          />
          <TouchableOpacity 
            style={[styles.sendButton, (!question.trim() || !canAskQuestions()) && styles.sendButtonDisabled]}
            onPress={handleAsk}
            disabled={!question.trim() || isTyping || !canAskQuestions()}
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
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
    padding: 20,
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
    padding: 16,
    backgroundColor: '#1A0F0A',
    borderBottomWidth: 2,
    borderBottomColor: '#4A3228',
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
    fontSize: 20,
    fontWeight: '700',
    color: '#D4A574',
  },
  characterOccupation: {
    fontSize: 12,
    color: '#8B7355',
    marginTop: 2,
  },
  hoursLeft: {
    backgroundColor: '#3D2617',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    marginRight: 10,
  },
  hoursText: {
    color: '#D4AF37',
    fontSize: 14,
    fontWeight: 'bold',
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
  factSheet: {
    backgroundColor: '#1A0F0A',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#4A3228',
  },
  factSheetTitle: {
    color: '#D4AF37',
    fontSize: 11,
    fontWeight: 'bold',
    letterSpacing: 1,
    marginBottom: 8,
  },
  factGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  factItem: {
    flex: 1,
    marginHorizontal: 4,
  },
  factLabel: {
    color: '#8B7355',
    fontSize: 9,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  factValue: {
    color: '#F5E6D3',
    fontSize: 11,
    marginTop: 2,
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
    borderRadius: 8,
    marginBottom: 16,
  },
  systemText: {
    fontSize: 12,
    color: '#8B7355',
    fontStyle: 'italic',
    textAlign: 'center',
  },
  messageBubble: {
    maxWidth: '85%',
    padding: 12,
    borderRadius: 12,
    marginBottom: 10,
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
    fontSize: 14,
    lineHeight: 20,
  },
  questionText: {
    color: '#FFF',
  },
  answerText: {
    color: '#E8DDD4',
  },
  typingIndicator: {
    color: '#8B7355',
    fontSize: 18,
    letterSpacing: 4,
  },
  evidenceSection: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: '#1A0F0A',
    borderTopWidth: 1,
    borderTopColor: '#4A3228',
  },
  evidenceBox: {
    flex: 1,
    backgroundColor: '#2C1810',
    borderRadius: 6,
    padding: 10,
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: '#4A3228',
    minHeight: 60,
  },
  evidenceBoxFilled: {
    borderColor: '#D4AF37',
    backgroundColor: '#3D2617',
  },
  evidenceLabel: {
    color: '#8B7355',
    fontSize: 9,
    fontWeight: 'bold',
    letterSpacing: 1,
    marginBottom: 4,
  },
  evidenceValue: {
    color: '#F5E6D3',
    fontSize: 10,
  },
  suspectAlert: {
    backgroundColor: '#8B0000',
    padding: 8,
    alignItems: 'center',
  },
  suspectAlertText: {
    color: '#FFD700',
    fontSize: 11,
    fontWeight: 'bold',
    letterSpacing: 1,
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
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 14,
    color: '#E8DDD4',
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#4A3228',
  },
  sendButton: {
    backgroundColor: '#8B2323',
    paddingHorizontal: 20,
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
    fontSize: 14,
    letterSpacing: 1,
  },
});
