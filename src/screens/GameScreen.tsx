import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useGame } from '../context/GameContext';
import { CharacterState } from '../types';
import InterrogationModal from '../components/InterrogationModal';

const { width, height } = Dimensions.get('window');

// Import victim image
const victimImage = require('../../assets/characters/victim.png');

interface Props {
  onNavigateToAccusation: () => void;
}

export default function GameScreen({ onNavigateToAccusation }: Props) {
  const { gameState } = useGame();
  const [selectedCharacter, setSelectedCharacter] = useState<CharacterState | null>(null);
  const [isInterrogating, setIsInterrogating] = useState(false);

  if (!gameState.currentCase) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading case...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const { currentCase } = gameState;

  const handleSuspectPress = (character: CharacterState) => {
    setSelectedCharacter(character);
    setIsInterrogating(true);
  };

  const handleCloseInterrogation = () => {
    setIsInterrogating(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>DAILY MURDER</Text>
        <Text style={styles.subtitle}>
          Case #{currentCase.caseNumber} • {currentCase.date}
        </Text>
      </View>

      {/* Case Info */}
      <View style={styles.caseInfo}>
        <Text style={styles.victimLabel}>VICTIM</Text>
        <Text style={styles.victimName}>{currentCase.victimName}</Text>
        <Text style={styles.victimDescription}>{currentCase.victimDescription}</Text>
      </View>

      {/* Crime Scene - Victim */}
      <View style={styles.crimeScene}>
        <Image
          source={victimImage}
          style={styles.victimImage}
          resizeMode="contain"
        />
      </View>

      {/* Suspects Row */}
      <View style={styles.suspectsContainer}>
        <Text style={styles.suspectsLabel}>TAP TO INTERROGATE</Text>
        <View style={styles.suspectsRow}>
          {currentCase.characters.map((character) => (
            <TouchableOpacity
              key={character.suspect.id}
              style={styles.suspectCard}
              onPress={() => handleSuspectPress(character)}
              activeOpacity={0.8}
            >
              <Image
                source={character.suspect.image}
                style={styles.suspectImage}
                resizeMode="cover"
              />
              <View style={styles.suspectNameContainer}>
                <Text style={styles.suspectName} numberOfLines={1}>
                  {character.suspect.name.split(' ')[0]}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Accusation Button */}
      <View style={styles.actionArea}>
        <TouchableOpacity 
          style={styles.accuseButton}
          onPress={onNavigateToAccusation}
        >
          <Text style={styles.accuseButtonText}>MAKE AN ARREST</Text>
        </TouchableOpacity>
      </View>

      {/* Interrogation Modal */}
      <InterrogationModal
        visible={isInterrogating}
        character={selectedCharacter}
        onClose={handleCloseInterrogation}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#2C1810',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#D4A574',
    fontSize: 18,
  },
  header: {
    paddingTop: 16,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#D4A574',
    letterSpacing: 4,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },
  subtitle: {
    fontSize: 12,
    color: '#8B7355',
    marginTop: 6,
    letterSpacing: 2,
    fontWeight: '500',
  },
  caseInfo: {
    paddingHorizontal: 20,
    paddingTop: 16,
    alignItems: 'center',
  },
  victimLabel: {
    fontSize: 10,
    color: '#6B5344',
    letterSpacing: 2,
    marginBottom: 4,
  },
  victimName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#E8DDD4',
    marginBottom: 4,
  },
  victimDescription: {
    fontSize: 13,
    color: '#8B7355',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  crimeScene: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  victimImage: {
    width: width * 0.8,
    height: height * 0.28,
  },
  suspectsContainer: {
    paddingHorizontal: 12,
    paddingBottom: 12,
  },
  suspectsLabel: {
    fontSize: 10,
    color: '#8B7355',
    letterSpacing: 2,
    marginBottom: 10,
    textAlign: 'center',
    fontWeight: '600',
  },
  suspectsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  suspectCard: {
    flex: 1,
    aspectRatio: 0.8,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#3D2617',
    borderWidth: 2,
    borderColor: '#4A3228',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  suspectImage: {
    width: '100%',
    height: '78%',
    backgroundColor: '#4A3228',
  },
  suspectNameContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1A0F0A',
    paddingHorizontal: 4,
  },
  suspectName: {
    fontSize: 10,
    color: '#D4A574',
    fontWeight: '600',
    textAlign: 'center',
  },
  actionArea: {
    paddingHorizontal: 20,
    paddingBottom: 24,
    paddingTop: 8,
  },
  accuseButton: {
    backgroundColor: '#8B2323',
    paddingVertical: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#A52A2A',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 8,
    alignItems: 'center',
  },
  accuseButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 3,
  },
});
