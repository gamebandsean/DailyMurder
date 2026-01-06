import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Scene3D from '../components/3d/Scene3D';
import InterrogationModal from '../components/InterrogationModal';
import { useGame } from '../context/GameContext';
import { CharacterState } from '../types';

interface Props {
  onNavigateToAccusation: () => void;
}

export default function GameScreen3D({ onNavigateToAccusation }: Props) {
  const { gameState } = useGame();
  const [selectedCharacter, setSelectedCharacter] = useState<CharacterState | null>(null);
  const [isInterrogating, setIsInterrogating] = useState(false);

  if (!gameState.currentCase) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading case...</Text>
      </View>
    );
  }

  const currentCase = gameState.currentCase;

  const handleCharacterClick = (character: CharacterState) => {
    setSelectedCharacter(character);
    setIsInterrogating(true);
  };

  const handleCloseInterrogation = () => {
    setIsInterrogating(false);
    setSelectedCharacter(null);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>DAILY MURDER</Text>
        <Text style={styles.caseNumber}>Case #{currentCase.caseNumber}</Text>
      </View>

      {/* Crime Report Overlay */}
      <View style={styles.crimeReport}>
        <Text style={styles.crimeReportTitle}>📋 CRIME REPORT</Text>
        <Text style={styles.crimeReportText}>
          <Text style={styles.crimeReportLabel}>Victim: </Text>
          {currentCase.victim.name}
        </Text>
        <Text style={styles.crimeReportText}>
          <Text style={styles.crimeReportLabel}>Cause of death: </Text>
          Stabbing
        </Text>
        <Text style={styles.crimeReportText}>
          <Text style={styles.crimeReportLabel}>Time: </Text>
          {currentCase.crimeDetails.timeOfDeath}
        </Text>
        <Text style={styles.crimeReportText}>
          <Text style={styles.crimeReportLabel}>Location: </Text>
          {currentCase.crimeDetails.location}
        </Text>
      </View>

      {/* 3D Scene */}
      <View style={styles.sceneContainer}>
        <Scene3D
          characters={currentCase.characters}
          selectedCharacterId={selectedCharacter?.suspect.id || null}
          onCharacterClick={handleCharacterClick}
          revealedItems={gameState.revealedItems}
        />
      </View>

      {/* Instructions */}
      <View style={styles.instructions}>
        <Text style={styles.instructionText}>
          🔍 Click on suspects to interrogate • Drag to rotate view
        </Text>
      </View>

      {/* Arrest Button */}
      <TouchableOpacity
        style={styles.arrestButton}
        onPress={onNavigateToAccusation}
      >
        <Text style={styles.arrestButtonText}>🔗 MAKE AN ARREST 🔗</Text>
      </TouchableOpacity>

      {/* Interrogation Modal */}
      {isInterrogating && selectedCharacter && (
        <InterrogationModal
          visible={isInterrogating}
          character={selectedCharacter}
          onClose={handleCloseInterrogation}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0505',
  },
  loadingText: {
    color: '#F5E6D3',
    fontSize: 18,
    textAlign: 'center',
    marginTop: 100,
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    paddingTop: 15,
    paddingHorizontal: 20,
    backgroundColor: 'rgba(10, 5, 5, 0.8)',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#D4AF37',
    textAlign: 'center',
    letterSpacing: 4,
    textShadowColor: '#000',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },
  caseNumber: {
    fontSize: 12,
    color: '#8B7355',
    textAlign: 'center',
    letterSpacing: 2,
    marginTop: 2,
  },
  crimeReport: {
    position: 'absolute',
    top: 70,
    left: 15,
    zIndex: 10,
    backgroundColor: 'rgba(44, 24, 16, 0.9)',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#8B7355',
    maxWidth: 220,
  },
  crimeReportTitle: {
    color: '#D4AF37',
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 6,
    letterSpacing: 1,
  },
  crimeReportText: {
    color: '#F5E6D3',
    fontSize: 11,
    marginBottom: 3,
  },
  crimeReportLabel: {
    color: '#B8860B',
    fontWeight: 'bold',
  },
  sceneContainer: {
    flex: 1,
  },
  instructions: {
    position: 'absolute',
    bottom: 70,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  instructionText: {
    color: '#8B7355',
    fontSize: 12,
    letterSpacing: 1,
    backgroundColor: 'rgba(10, 5, 5, 0.7)',
    paddingHorizontal: 15,
    paddingVertical: 5,
    borderRadius: 15,
  },
  arrestButton: {
    position: 'absolute',
    bottom: 15,
    left: 20,
    right: 20,
    backgroundColor: '#8B0000',
    paddingVertical: 14,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#D4AF37',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 6,
    elevation: 8,
  },
  arrestButtonText: {
    color: '#F5E6D3',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    letterSpacing: 2,
  },
});

