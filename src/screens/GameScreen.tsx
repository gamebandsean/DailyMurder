import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
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
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>DAILY MURDER</Text>
        <Text style={styles.subtitle}>Case #{currentCase.caseNumber}</Text>
      </View>

      {/* Victim Info */}
      <View style={styles.victimInfo}>
        <Text style={styles.victimLabel}>VICTIM: {currentCase.victimName}</Text>
        <Text style={styles.victimDescription}>{currentCase.victimDescription}</Text>
      </View>

      {/* Crime Scene - Body */}
      <View style={styles.crimeScene}>
        <Image
          source={victimImage}
          style={styles.victimImage}
          resizeMode="contain"
        />
      </View>

      {/* Suspects */}
      <View style={styles.suspectsSection}>
        <Text style={styles.suspectsLabel}>SUSPECTS • TAP TO INTERROGATE</Text>
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
                <Text style={styles.suspectName} numberOfLines={1}>
                  {character.suspect.name.split(' ')[0]}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Arrest Button */}
      <TouchableOpacity 
        style={styles.arrestButton}
        onPress={onNavigateToAccusation}
      >
        <Text style={styles.arrestButtonText}>MAKE AN ARREST</Text>
      </TouchableOpacity>

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
    backgroundColor: '#2C1810',
    padding: 20,
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
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: '#D4A574',
    letterSpacing: 4,
  },
  subtitle: {
    fontSize: 11,
    color: '#8B7355',
    marginTop: 4,
    letterSpacing: 2,
  },
  victimInfo: {
    alignItems: 'center',
    marginBottom: 8,
  },
  victimLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#E8DDD4',
    letterSpacing: 1,
  },
  victimDescription: {
    fontSize: 11,
    color: '#8B7355',
    fontStyle: 'italic',
    marginTop: 2,
  },
  crimeScene: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 180,
  },
  victimImage: {
    width: '90%',
    height: '100%',
  },
  suspectsSection: {
    marginTop: 12,
  },
  suspectsLabel: {
    fontSize: 10,
    color: '#8B7355',
    letterSpacing: 2,
    marginBottom: 10,
    textAlign: 'center',
    fontWeight: '600',
  },
  suspectsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  suspectCard: {
    flex: 1,
    backgroundColor: '#3D2617',
    borderRadius: 10,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#4A3228',
  },
  suspectImage: {
    width: '100%',
    height: 90,
    backgroundColor: '#4A3228',
  },
  suspectInfo: {
    padding: 8,
    alignItems: 'center',
    backgroundColor: '#1A0F0A',
  },
  suspectName: {
    fontSize: 11,
    color: '#D4A574',
    fontWeight: '600',
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
});
