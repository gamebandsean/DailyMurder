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

  // Check if an item has been revealed for a character
  const isItemRevealed = (characterId: string) => {
    return gameState.revealedItems.includes(characterId);
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>DAILY MURDER</Text>
        <Text style={styles.subtitle}>Case #{currentCase.caseNumber}</Text>
      </View>

      {/* Crime Report */}
      <View style={styles.crimeReport}>
        <Text style={styles.victimLabel}>VICTIM: {currentCase.victim.name}</Text>
        <Text style={styles.crimeDetails}>
          Found stabbed in {currentCase.crimeDetails.location} at {currentCase.crimeDetails.timeOfDeath}
        </Text>
        <Text style={styles.weaponInfo}>
          Cause of death: Stabbing
        </Text>
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
          {currentCase.characters.map((character) => {
            const itemRevealed = isItemRevealed(character.suspect.id);
            
            return (
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
                {/* Item Slot */}
                <View style={[
                  styles.itemSlot,
                  itemRevealed && styles.itemSlotRevealed
                ]}>
                  {itemRevealed ? (
                    <>
                      <Text style={styles.itemEmoji}>{character.item.emoji}</Text>
                      <Text style={styles.itemName} numberOfLines={1}>
                        {character.item.name}
                      </Text>
                    </>
                  ) : (
                    <Text style={styles.itemUnknown}>?</Text>
                  )}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Arrest Button */}
      <TouchableOpacity 
        style={styles.arrestButton}
        onPress={onNavigateToAccusation}
      >
        <Text style={styles.arrestButtonText}>🔗 MAKE AN ARREST 🔗</Text>
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
    paddingHorizontal: 40,
    paddingTop: 25,
    paddingBottom: 0,
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
    marginBottom: 16,
  },
  title: {
    fontSize: 42,
    fontWeight: '800',
    color: '#D4A574',
    letterSpacing: 5,
  },
  subtitle: {
    fontSize: 16,
    color: '#8B7355',
    marginTop: 6,
    letterSpacing: 2,
  },
  crimeReport: {
    alignItems: 'center',
    marginBottom: 20,
    backgroundColor: '#1A0F0A',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#3D2617',
  },
  victimLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#E8DDD4',
    letterSpacing: 2,
  },
  crimeDetails: {
    fontSize: 14,
    color: '#D4A574',
    marginTop: 6,
    textAlign: 'center',
  },
  weaponInfo: {
    fontSize: 13,
    color: '#8B7355',
    fontStyle: 'italic',
    marginTop: 4,
  },
  crimeScene: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  victimImage: {
    width: '55%',
    height: 220,
  },
  suspectsSection: {
    marginTop: 20,
  },
  suspectsLabel: {
    fontSize: 14,
    color: '#8B7355',
    letterSpacing: 3,
    marginBottom: 16,
    textAlign: 'center',
    fontWeight: '600',
  },
  suspectsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  suspectCard: {
    flex: 1,
    backgroundColor: '#3D2617',
    borderRadius: 12,
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
    paddingVertical: 8,
    paddingHorizontal: 6,
    alignItems: 'center',
    backgroundColor: '#1A0F0A',
  },
  suspectName: {
    fontSize: 14,
    color: '#D4A574',
    fontWeight: '600',
  },
  itemSlot: {
    backgroundColor: '#251510',
    paddingVertical: 8,
    paddingHorizontal: 6,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#3D2617',
    minHeight: 50,
    justifyContent: 'center',
  },
  itemSlotRevealed: {
    backgroundColor: '#2D1A12',
  },
  itemUnknown: {
    fontSize: 28,
    color: '#5A4030',
    fontWeight: '700',
  },
  itemEmoji: {
    fontSize: 22,
    marginBottom: 2,
  },
  itemName: {
    fontSize: 10,
    color: '#8B7355',
    textAlign: 'center',
    fontWeight: '500',
  },
  arrestButton: {
    backgroundColor: '#8B2323',
    paddingVertical: 16,
    borderRadius: 10,
    borderWidth: 3,
    borderColor: '#A52A2A',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 0,
  },
  arrestButtonText: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: 3,
  },
});
