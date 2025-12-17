import React from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Dimensions,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useGame } from '../context/GameContext';

const { width } = Dimensions.get('window');

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
    <SafeAreaView style={styles.container}>
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
              ? 'Excellent detective work! You caught the killer.'
              : 'An innocent person is behind bars. The real killer escaped.'}
          </Text>
        </View>

        {/* Who you accused */}
        {!wasCorrect && accusedCharacter && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>YOU ARRESTED</Text>
            <View style={styles.characterCard}>
              <Image
                source={accusedCharacter.suspect.image}
                style={styles.characterImage}
                resizeMode="cover"
              />
              <View style={styles.characterInfo}>
                <Text style={styles.characterName}>{accusedCharacter.suspect.name}</Text>
                <Text style={styles.characterRole}>{accusedCharacter.suspect.occupation}</Text>
                <Text style={styles.innocentBadge}>INNOCENT</Text>
              </View>
            </View>
          </View>
        )}

        {/* The Real Killer */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {wasCorrect ? 'THE KILLER' : 'THE REAL KILLER'}
          </Text>
          {actualMurderer && (
            <View style={[styles.characterCard, styles.killerCard]}>
              <Image
                source={actualMurderer.suspect.image}
                style={styles.characterImage}
                resizeMode="cover"
              />
              <View style={styles.characterInfo}>
                <Text style={styles.characterName}>{actualMurderer.suspect.name}</Text>
                <Text style={styles.characterRole}>{actualMurderer.suspect.occupation}</Text>
                <Text style={styles.guiltyBadge}>GUILTY</Text>
              </View>
            </View>
          )}
        </View>

        {/* What Really Happened */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>WHAT REALLY HAPPENED</Text>
          <View style={styles.storyCard}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Time of Death</Text>
              <Text style={styles.detailValue}>{currentCase.murderDetails.timeOfDeath}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Location</Text>
              <Text style={styles.detailValue}>{currentCase.murderDetails.location}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Murder Weapon</Text>
              <Text style={styles.detailValue}>{currentCase.murderDetails.weapon}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Motive</Text>
              <Text style={styles.detailValue}>{currentCase.murderDetails.motive}</Text>
            </View>
            <View style={styles.divider} />
            <Text style={styles.storyText}>{currentCase.murderDetails.howItHappened}</Text>
          </View>
        </View>

        {/* Character Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>SUSPECT BREAKDOWN</Text>
          {currentCase.characters.map((character) => (
            <View key={character.suspect.id} style={styles.suspectSummary}>
              <View style={styles.suspectHeader}>
                <Image
                  source={character.suspect.image}
                  style={styles.smallImage}
                  resizeMode="cover"
                />
                <View style={styles.suspectHeaderInfo}>
                  <Text style={styles.suspectName}>{character.suspect.name}</Text>
                  {character.isGuilty && (
                    <View style={styles.killerBadge}>
                      <Text style={styles.killerBadgeText}>KILLER</Text>
                    </View>
                  )}
                </View>
              </View>
              <View style={styles.suspectDetails}>
                <Text style={styles.suspectDetail}>
                  <Text style={styles.detailBold}>Problem with victim: </Text>
                  {character.victimRelationship.problem}
                </Text>
                <Text style={styles.suspectDetail}>
                  <Text style={styles.detailBold}>Alibi: </Text>
                  {character.alibi.hasAlibi 
                    ? `${character.alibi.description}. ${character.alibi.witness}`
                    : `None - ${character.alibi.description}`}
                </Text>
                <Text style={styles.suspectDetail}>
                  <Text style={styles.detailBold}>Item: </Text>
                  {character.item.name}
                </Text>
              </View>
            </View>
          ))}
        </View>

        {/* Play Again */}
        <View style={styles.playAgainSection}>
          <Text style={styles.comeBackText}>
            Come back tomorrow for a new case!
          </Text>
          <TouchableOpacity style={styles.playAgainButton} onPress={onPlayAgain}>
            <Text style={styles.playAgainButtonText}>PLAY AGAIN (New Case)</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
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
    paddingBottom: 40,
  },
  resultHeader: {
    padding: 32,
    alignItems: 'center',
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
    fontSize: 28,
    fontWeight: '800',
    color: '#D4A574',
    letterSpacing: 4,
    marginBottom: 8,
  },
  resultSubtitle: {
    fontSize: 16,
    color: '#E8DDD4',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#8B7355',
    letterSpacing: 2,
    marginBottom: 12,
  },
  characterCard: {
    flexDirection: 'row',
    backgroundColor: '#3D2617',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#4A3228',
  },
  killerCard: {
    borderColor: '#8B2323',
  },
  characterImage: {
    width: 100,
    height: 100,
  },
  characterInfo: {
    flex: 1,
    padding: 16,
    justifyContent: 'center',
  },
  characterName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#D4A574',
  },
  characterRole: {
    fontSize: 14,
    color: '#8B7355',
    marginTop: 4,
  },
  innocentBadge: {
    marginTop: 8,
    color: '#4CAF50',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
  },
  guiltyBadge: {
    marginTop: 8,
    color: '#8B2323',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
  },
  storyCard: {
    backgroundColor: '#3D2617',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#4A3228',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 13,
    color: '#8B7355',
  },
  detailValue: {
    fontSize: 13,
    color: '#E8DDD4',
    fontWeight: '600',
    flex: 1,
    textAlign: 'right',
    marginLeft: 16,
  },
  divider: {
    height: 1,
    backgroundColor: '#4A3228',
    marginVertical: 16,
  },
  storyText: {
    fontSize: 15,
    color: '#E8DDD4',
    lineHeight: 24,
  },
  suspectSummary: {
    backgroundColor: '#3D2617',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#4A3228',
  },
  suspectHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  smallImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: '#D4A574',
  },
  suspectHeaderInfo: {
    flex: 1,
    marginLeft: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  suspectName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#D4A574',
  },
  killerBadge: {
    backgroundColor: '#8B2323',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  killerBadgeText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
  },
  suspectDetails: {
    paddingLeft: 60,
  },
  suspectDetail: {
    fontSize: 13,
    color: '#A89585',
    lineHeight: 20,
    marginBottom: 4,
  },
  detailBold: {
    color: '#D4A574',
    fontWeight: '600',
  },
  playAgainSection: {
    padding: 20,
    alignItems: 'center',
  },
  comeBackText: {
    color: '#8B7355',
    fontSize: 14,
    marginBottom: 16,
  },
  playAgainButton: {
    backgroundColor: '#4A3228',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#6B5344',
  },
  playAgainButtonText: {
    color: '#D4A574',
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 1,
  },
});

