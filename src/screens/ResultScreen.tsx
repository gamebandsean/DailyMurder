import React from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useGame } from '../context/GameContext';

interface Props {
  onPlayAgain: () => void;
}

export default function ResultScreen({ onPlayAgain }: Props) {
  const { gameState } = useGame();

  if (!gameState.currentCase) return null;

  const { currentCase, wasCorrect, accusedId } = gameState;
  const accusedCharacter = currentCase.characters.find(c => c.suspect.id === accusedId);
  const actualMurderer = currentCase.characters.find(c => c.isGuilty);

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* Left Panel - Result */}
      <View style={[styles.leftPanel, wasCorrect ? styles.successPanel : styles.failPanel]}>
        <Text style={styles.resultEmoji}>{wasCorrect ? '🎉' : '💀'}</Text>
        <Text style={styles.resultTitle}>
          {wasCorrect ? 'CASE CLOSED' : 'WRONG SUSPECT'}
        </Text>
        <Text style={styles.resultSubtitle}>
          {wasCorrect 
            ? 'Excellent detective work!'
            : 'The real killer escaped.'}
        </Text>

        {/* The Killer */}
        {actualMurderer && (
          <View style={styles.killerCard}>
            <Image
              source={actualMurderer.suspect.image}
              style={styles.killerImage}
              resizeMode="cover"
            />
            <View style={styles.killerInfo}>
              <Text style={styles.killerLabel}>
                {wasCorrect ? 'THE KILLER' : 'THE REAL KILLER'}
              </Text>
              <Text style={styles.killerName}>{actualMurderer.suspect.name}</Text>
            </View>
          </View>
        )}

        <TouchableOpacity style={styles.playAgainButton} onPress={onPlayAgain}>
          <Text style={styles.playAgainButtonText}>PLAY AGAIN</Text>
        </TouchableOpacity>
      </View>

      {/* Right Panel - Case Details */}
      <ScrollView style={styles.rightPanel} contentContainerStyle={styles.rightPanelContent}>
        <Text style={styles.sectionTitle}>WHAT HAPPENED</Text>
        
        <View style={styles.detailsCard}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Time</Text>
            <Text style={styles.detailValue}>{currentCase.murderDetails.timeOfDeath}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Location</Text>
            <Text style={styles.detailValue}>{currentCase.murderDetails.location}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Weapon</Text>
            <Text style={styles.detailValue}>{currentCase.murderDetails.weapon}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Motive</Text>
            <Text style={styles.detailValue}>{currentCase.murderDetails.motive}</Text>
          </View>
        </View>

        <Text style={styles.storyText}>{currentCase.murderDetails.howItHappened}</Text>

        {currentCase.murderDetails.keyEvidence && (
          <>
            <Text style={styles.sectionTitle}>HOW TO SOLVE IT</Text>
            
            <View style={styles.evidenceCard}>
              <Text style={styles.evidenceTitle}>🔍 Alibi Contradiction</Text>
              <Text style={styles.evidenceText}>
                {currentCase.murderDetails.keyEvidence.alibiContradiction}
              </Text>
            </View>

            <View style={styles.evidenceCard}>
              <Text style={styles.evidenceTitle}>👁️ Key Witness</Text>
              <Text style={styles.evidenceText}>
                {currentCase.murderDetails.keyEvidence.alibiWitness} saw the killer and could confirm the lie.
              </Text>
            </View>

            <View style={styles.evidenceCard}>
              <Text style={styles.evidenceTitle}>🔪 Murder Weapon</Text>
              <Text style={styles.evidenceText}>
                The killer had the {currentCase.murderDetails.keyEvidence.murderWeapon} on them.
              </Text>
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#2C1810',
  },
  // Left Panel
  leftPanel: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    alignItems: 'center',
    borderRightWidth: 1,
    borderRightColor: '#4A3228',
  },
  successPanel: {
    backgroundColor: 'rgba(39, 100, 39, 0.2)',
  },
  failPanel: {
    backgroundColor: 'rgba(139, 35, 35, 0.2)',
  },
  resultEmoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  resultTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#D4A574',
    letterSpacing: 3,
  },
  resultSubtitle: {
    fontSize: 13,
    color: '#E8DDD4',
    marginTop: 8,
    marginBottom: 24,
  },
  killerCard: {
    flexDirection: 'row',
    backgroundColor: '#3D2617',
    borderRadius: 10,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#8B2323',
    marginBottom: 24,
  },
  killerImage: {
    width: 80,
    height: 80,
  },
  killerInfo: {
    padding: 12,
    justifyContent: 'center',
  },
  killerLabel: {
    fontSize: 10,
    color: '#8B2323',
    letterSpacing: 1,
    fontWeight: '700',
  },
  killerName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#D4A574',
    marginTop: 4,
  },
  playAgainButton: {
    backgroundColor: '#4A3228',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  playAgainButtonText: {
    color: '#D4A574',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 1,
  },
  // Right Panel
  rightPanel: {
    width: '55%',
    backgroundColor: '#241510',
  },
  rightPanelContent: {
    padding: 24,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#8B7355',
    letterSpacing: 2,
    marginBottom: 12,
    marginTop: 8,
  },
  detailsCard: {
    backgroundColor: '#3D2617',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  detailLabel: {
    fontSize: 11,
    color: '#8B7355',
  },
  detailValue: {
    fontSize: 11,
    color: '#E8DDD4',
    fontWeight: '600',
    flex: 1,
    textAlign: 'right',
    marginLeft: 12,
  },
  storyText: {
    fontSize: 12,
    color: '#A89585',
    lineHeight: 18,
    marginBottom: 16,
  },
  evidenceCard: {
    backgroundColor: '#3D2617',
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
  },
  evidenceTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#D4A574',
    marginBottom: 4,
  },
  evidenceText: {
    fontSize: 11,
    color: '#A89585',
    lineHeight: 16,
  },
});
