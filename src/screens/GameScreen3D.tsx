import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Scene3D from '../components/3d/Scene3D';
import InterrogationModal from '../components/InterrogationModal';
import CrimeReportScreen from './CrimeReportScreen';
import { useGame } from '../context/GameContext';
import { CharacterState } from '../types';

interface Props {
  onNavigateToAccusation: () => void;
}

export default function GameScreen3D({ onNavigateToAccusation }: Props) {
  const { gameState, dismissReport, getQuestionsRemaining, useLLM, setUseLLM } = useGame();
  const [selectedCharacter, setSelectedCharacter] = useState<CharacterState | null>(null);
  const [isInterrogating, setIsInterrogating] = useState(false);
  const [showReport, setShowReport] = useState(!gameState.hasSeenReport);

  if (!gameState.currentCase) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading case...</Text>
      </View>
    );
  }

  const currentCase = gameState.currentCase;
  const hoursRemaining = getQuestionsRemaining();
  const isTimeUp = hoursRemaining <= 0;

  const handleCharacterClick = (character: CharacterState) => {
    if (!isTimeUp) {
      setSelectedCharacter(character);
      setIsInterrogating(true);
    }
  };

  const handleCloseInterrogation = () => {
    setIsInterrogating(false);
    setSelectedCharacter(null);
  };

  const handleDismissReport = () => {
    setShowReport(false);
    if (!gameState.hasSeenReport) {
      dismissReport();
    }
  };

  const handleShowReport = () => {
    setShowReport(true);
  };

  const getCauseOfDeathText = (cause: string): string => {
    switch (cause) {
      case 'stabbed': return 'Stabbing';
      case 'poisoned': return 'Poisoning';
      case 'strangled': return 'Strangulation';
      case 'shot': return 'Gunshot';
      default: return cause;
    }
  };

  return (
    <View style={styles.container}>
      {/* Header Bar */}
      <View style={styles.headerBar}>
        {/* Case File Button */}
        <TouchableOpacity style={styles.caseFileButton} onPress={handleShowReport}>
          <Text style={styles.caseFileButtonText}>📋</Text>
        </TouchableOpacity>

        {/* Title */}
        <View style={styles.titleContainer}>
          <Text style={styles.title}>DAILY MURDER</Text>
          <Text style={styles.caseNumber}>Case #{currentCase.caseNumber}</Text>
        </View>

        {/* Hours Remaining */}
        <View style={styles.hoursContainer}>
          <Text style={styles.hoursValue}>{hoursRemaining}</Text>
          <Text style={[styles.hoursLabel, hoursRemaining <= 6 && styles.hoursLow]}>
            HRS
          </Text>
        </View>
      </View>

      {/* Crime Summary (compact) */}
      <View style={styles.crimeSummary}>
        <Text style={styles.crimeSummaryText}>
          <Text style={styles.crimeSummaryLabel}>Victim: </Text>
          {currentCase.victim.name}
          <Text style={styles.crimeSummaryLabel}>  •  Death: </Text>
          {getCauseOfDeathText(currentCase.crimeDetails.causeOfDeath)}
          <Text style={styles.crimeSummaryLabel}>  •  </Text>
          {currentCase.crimeDetails.timeOfDeath} in {currentCase.crimeDetails.location}
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
        <TouchableOpacity 
          style={styles.aiModeButton}
          onPress={() => setUseLLM(!useLLM)}
        >
          <Text style={[styles.aiModeText, useLLM && styles.aiModeActive]}>
            {useLLM ? '🤖 AI Mode' : '📝 Classic Mode'}
          </Text>
        </TouchableOpacity>
        <Text style={styles.instructionText}>
          🔍 Click suspects to interrogate • Drag to rotate
        </Text>
      </View>

      {/* Arrest Button */}
      <TouchableOpacity
        style={[styles.arrestButton, isTimeUp && styles.arrestButtonUrgent]}
        onPress={onNavigateToAccusation}
      >
        <Text style={styles.arrestButtonText}>🔗 MAKE AN ARREST 🔗</Text>
      </TouchableOpacity>

      {/* Crime Report Overlay */}
      {showReport && (
        <CrimeReportScreen onDismiss={handleDismissReport} />
      )}

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
    overflow: 'hidden',
  },
  loadingText: {
    color: '#F5E6D3',
    fontSize: 18,
    textAlign: 'center',
    marginTop: 100,
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: '#1A0F0A',
    borderBottomWidth: 1,
    borderBottomColor: '#4A3228',
    zIndex: 100,
  },
  caseFileButton: {
    backgroundColor: '#3D2617',
    width: 36,
    height: 36,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#8B7355',
    justifyContent: 'center',
    alignItems: 'center',
  },
  caseFileButtonText: {
    fontSize: 18,
  },
  titleContainer: {
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#D4AF37',
    letterSpacing: 3,
  },
  caseNumber: {
    fontSize: 10,
    color: '#8B7355',
    letterSpacing: 1,
  },
  hoursContainer: {
    backgroundColor: '#3D2617',
    flexDirection: 'row',
    alignItems: 'baseline',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#8B7355',
  },
  hoursValue: {
    color: '#D4AF37',
    fontSize: 20,
    fontWeight: 'bold',
  },
  hoursLabel: {
    color: '#8B7355',
    fontSize: 10,
    fontWeight: 'bold',
    marginLeft: 2,
  },
  hoursLow: {
    color: '#FF4444',
  },
  crimeSummary: {
    backgroundColor: 'rgba(44, 24, 16, 0.9)',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#4A3228',
  },
  crimeSummaryText: {
    color: '#F5E6D3',
    fontSize: 11,
    textAlign: 'center',
  },
  crimeSummaryLabel: {
    color: '#8B7355',
  },
  sceneContainer: {
    flex: 1,
  },
  instructions: {
    position: 'absolute',
    bottom: 60,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  instructionText: {
    color: '#8B7355',
    fontSize: 11,
    letterSpacing: 1,
    backgroundColor: 'rgba(10, 5, 5, 0.8)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  aiModeButton: {
    backgroundColor: 'rgba(10, 5, 5, 0.9)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: '#4A3228',
  },
  aiModeText: {
    color: '#8B7355',
    fontSize: 12,
    fontWeight: '600',
  },
  aiModeActive: {
    color: '#4ADE80',
  },
  arrestButton: {
    position: 'absolute',
    bottom: 12,
    left: 15,
    right: 15,
    backgroundColor: '#8B0000',
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#D4AF37',
  },
  arrestButtonUrgent: {
    backgroundColor: '#FF4444',
    borderColor: '#FFD700',
  },
  arrestButtonText: {
    color: '#F5E6D3',
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
    letterSpacing: 2,
  },
});
