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

  const { currentCase, wasCorrect } = gameState;
  const actualMurderer = currentCase.characters.find(c => c.isGuilty);

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Result Header */}
        <View style={[styles.resultHeader, wasCorrect ? styles.successHeader : styles.failHeader]}>
          <Text style={styles.resultEmoji}>{wasCorrect ? '🎉' : '💀'}</Text>
          <Text style={styles.resultTitle}>
            {wasCorrect ? 'CASE CLOSED' : 'WRONG SUSPECT'}
          </Text>
          <Text style={styles.resultSubtitle}>
            {wasCorrect 
              ? 'Excellent detective work!'
              : 'The real killer escaped justice.'}
          </Text>
        </View>

        {/* The Killer */}
        {actualMurderer && (
          <View style={styles.killerSection}>
            <Text style={styles.sectionLabel}>
              {wasCorrect ? 'THE KILLER' : 'THE REAL KILLER WAS'}
            </Text>
            <View style={styles.killerCard}>
              <Image
                source={actualMurderer.suspect.image}
                style={styles.killerImage}
                resizeMode="cover"
              />
              <View style={styles.killerInfo}>
                <Text style={styles.killerName}>{actualMurderer.suspect.name}</Text>
                <Text style={styles.killerOccupation}>{actualMurderer.suspect.occupation}</Text>
              </View>
            </View>
          </View>
        )}

        {/* Case Details */}
        <View style={styles.detailsSection}>
          <Text style={styles.sectionLabel}>WHAT HAPPENED</Text>
          <View style={styles.detailsCard}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Time</Text>
              <Text style={styles.detailValue}>{currentCase.murderDetails.timeOfDeath}</Text>
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
        </View>

        {/* How to Solve */}
        {currentCase.murderDetails.keyEvidence && (
          <View style={styles.evidenceSection}>
            <Text style={styles.sectionLabel}>HOW TO CATCH THEM</Text>
            <Text style={styles.evidenceItem}>
              🔍 {currentCase.murderDetails.keyEvidence.alibiContradiction}
            </Text>
            <Text style={styles.evidenceItem}>
              👁️ {currentCase.murderDetails.keyEvidence.alibiWitness} could confirm the lie.
            </Text>
            <Text style={styles.evidenceItem}>
              🔪 The killer had the {currentCase.murderDetails.keyEvidence.murderWeapon}.
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Play Again */}
      <TouchableOpacity style={styles.playAgainButton} onPress={onPlayAgain}>
        <Text style={styles.playAgainButtonText}>PLAY AGAIN</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#2C1810',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  resultHeader: {
    alignItems: 'center',
    paddingVertical: 20,
    borderRadius: 10,
    marginBottom: 20,
  },
  successHeader: {
    backgroundColor: 'rgba(39, 100, 39, 0.3)',
  },
  failHeader: {
    backgroundColor: 'rgba(139, 35, 35, 0.3)',
  },
  resultEmoji: {
    fontSize: 40,
    marginBottom: 8,
  },
  resultTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#D4A574',
    letterSpacing: 3,
  },
  resultSubtitle: {
    fontSize: 12,
    color: '#E8DDD4',
    marginTop: 6,
  },
  killerSection: {
    marginBottom: 20,
  },
  sectionLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#8B7355',
    letterSpacing: 2,
    marginBottom: 10,
  },
  killerCard: {
    flexDirection: 'row',
    backgroundColor: '#3D2617',
    borderRadius: 10,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#8B2323',
  },
  killerImage: {
    width: 80,
    height: 80,
  },
  killerInfo: {
    flex: 1,
    padding: 12,
    justifyContent: 'center',
  },
  killerName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#D4A574',
  },
  killerOccupation: {
    fontSize: 11,
    color: '#8B7355',
    marginTop: 2,
  },
  detailsSection: {
    marginBottom: 20,
  },
  detailsCard: {
    backgroundColor: '#3D2617',
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
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
  },
  evidenceSection: {
    marginBottom: 20,
  },
  evidenceItem: {
    fontSize: 11,
    color: '#A89585',
    lineHeight: 18,
    marginBottom: 8,
  },
  playAgainButton: {
    backgroundColor: '#4A3228',
    paddingVertical: 14,
    margin: 20,
    marginTop: 0,
    borderRadius: 8,
    alignItems: 'center',
  },
  playAgainButtonText: {
    color: '#D4A574',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 1,
  },
});
