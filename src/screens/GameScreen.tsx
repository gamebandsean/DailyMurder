import React, { useState } from 'react';
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
import { CharacterState } from '../types';
import InterrogationModal from '../components/InterrogationModal';

// Import victim image
const victimImage = require('../../assets/characters/Body2.png');

interface Props {
  onNavigateToAccusation: () => void;
}

export default function GameScreen({ onNavigateToAccusation }: Props) {
  const { gameState } = useGame();
  const [selectedCharacter, setSelectedCharacter] = useState<CharacterState | null>(null);
  const [isInterrogating, setIsInterrogating] = useState(false);

  if (!gameState.currentCase) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading case...</Text>
        </View>
      </View>
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
    <View style={styles.container}>
      <StatusBar style="light" />
      
      {/* Left Panel - Crime Scene */}
      <View style={styles.leftPanel}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>DAILY MURDER</Text>
          <Text style={styles.subtitle}>Case #{currentCase.caseNumber}</Text>
        </View>

        {/* Victim Info */}
        <View style={styles.victimInfo}>
          <Text style={styles.victimLabel}>VICTIM</Text>
          <Text style={styles.victimName}>{currentCase.victimName}</Text>
          <Text style={styles.victimDescription}>{currentCase.victimDescription}</Text>
        </View>

        {/* Crime Scene Image */}
        <View style={styles.crimeScene}>
          <Image
            source={victimImage}
            style={styles.victimImage}
            resizeMode="contain"
          />
        </View>

        {/* Arrest Button */}
        <TouchableOpacity 
          style={styles.arrestButton}
          onPress={onNavigateToAccusation}
        >
          <Text style={styles.arrestButtonText}>MAKE AN ARREST</Text>
        </TouchableOpacity>
      </View>

      {/* Right Panel - Suspects */}
      <View style={styles.rightPanel}>
        <Text style={styles.suspectsTitle}>SUSPECTS</Text>
        <Text style={styles.suspectsHint}>Click to interrogate</Text>
        
        <View style={styles.suspectsGrid}>
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
              <View style={styles.suspectInfo}>
                <Text style={styles.suspectName}>{character.suspect.name}</Text>
                <Text style={styles.suspectOccupation}>{character.suspect.occupation}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Interrogation Modal */}
      <InterrogationModal
        visible={isInterrogating}
        character={selectedCharacter}
        onClose={handleCloseInterrogation}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
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
  // Left Panel
  leftPanel: {
    flex: 1,
    padding: 24,
    borderRightWidth: 1,
    borderRightColor: '#4A3228',
  },
  header: {
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#D4A574',
    letterSpacing: 4,
  },
  subtitle: {
    fontSize: 12,
    color: '#8B7355',
    marginTop: 4,
    letterSpacing: 2,
  },
  victimInfo: {
    marginBottom: 16,
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
  },
  victimDescription: {
    fontSize: 12,
    color: '#8B7355',
    fontStyle: 'italic',
    marginTop: 4,
  },
  crimeScene: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  victimImage: {
    width: '100%',
    height: '100%',
    maxHeight: 200,
  },
  arrestButton: {
    backgroundColor: '#8B2323',
    paddingVertical: 14,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#A52A2A',
    alignItems: 'center',
    marginTop: 16,
  },
  arrestButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 2,
  },
  // Right Panel
  rightPanel: {
    width: '55%',
    padding: 24,
    backgroundColor: '#241510',
  },
  suspectsTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#D4A574',
    letterSpacing: 3,
    marginBottom: 4,
  },
  suspectsHint: {
    fontSize: 11,
    color: '#6B5344',
    fontStyle: 'italic',
    marginBottom: 16,
  },
  suspectsGrid: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  suspectCard: {
    width: '48%',
    backgroundColor: '#3D2617',
    borderRadius: 10,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#4A3228',
  },
  suspectImage: {
    width: '100%',
    height: 120,
    backgroundColor: '#4A3228',
  },
  suspectInfo: {
    padding: 10,
  },
  suspectName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#D4A574',
  },
  suspectOccupation: {
    fontSize: 10,
    color: '#8B7355',
    marginTop: 2,
  },
});
