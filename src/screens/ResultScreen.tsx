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
    padding: 40,
  },
  resultHeader: {
    alignItems: 'center',
    paddingVertical: 40,
    borderRadius: 16,
    marginBottom: 32,
  },
  successHeader: {
    backgroundColor: 'rgba(39, 100, 39, 0.3)',
  },
  failHeader: {
    backgroundColor: 'rgba(139, 35, 35, 0.3)',
  },
  resultEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  resultTitle: {
    fontSize: 40,
    fontWeight: '800',
    color: '#D4A574',
    letterSpacing: 5,
  },
  resultSubtitle: {
    fontSize: 18,
    color: '#E8DDD4',
    marginTop: 12,
  },
  killerSection: {
    marginBottom: 32,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#8B7355',
    letterSpacing: 3,
    marginBottom: 16,
  },
  killerCard: {
    flexDirection: 'row',
    backgroundColor: '#3D2617',
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 3,
    borderColor: '#8B2323',
  },
  killerImage: {
    width: 140,
    height: 140,
  },
  killerInfo: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  killerName: {
    fontSize: 26,
    fontWeight: '700',
    color: '#D4A574',
  },
  killerOccupation: {
    fontSize: 16,
    color: '#8B7355',
    marginTop: 4,
  },
  detailsSection: {
    marginBottom: 32,
  },
  detailsCard: {
    backgroundColor: '#3D2617',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  detailLabel: {
    fontSize: 16,
    color: '#8B7355',
  },
  detailValue: {
    fontSize: 16,
    color: '#E8DDD4',
    fontWeight: '600',
    flex: 1,
    textAlign: 'right',
    marginLeft: 16,
  },
  storyText: {
    fontSize: 16,
    color: '#A89585',
    lineHeight: 26,
  },
  evidenceSection: {
    marginBottom: 32,
  },
  evidenceItem: {
    fontSize: 16,
    color: '#A89585',
    lineHeight: 26,
    marginBottom: 12,
  },
  playAgainButton: {
    backgroundColor: '#4A3228',
    paddingVertical: 20,
    margin: 40,
    marginTop: 0,
    borderRadius: 10,
    alignItems: 'center',
  },
  playAgainButtonText: {
    color: '#D4A574',
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: 2,
  },
});
