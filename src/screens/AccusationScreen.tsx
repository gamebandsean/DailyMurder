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

interface Props {
  onBack: () => void;
  onAccuse: (suspectId: string) => void;
}

export default function AccusationScreen({ onBack, onAccuse }: Props) {
  const { gameState } = useGame();
  const [selectedSuspect, setSelectedSuspect] = useState<string | null>(null);
  const [confirmMode, setConfirmMode] = useState(false);

  if (!gameState.currentCase) return null;

  const handleAccuse = () => {
    if (selectedSuspect) {
      if (confirmMode) {
        onAccuse(selectedSuspect);
      } else {
        setConfirmMode(true);
      }
    }
  };

  const selectedCharacter = gameState.currentCase.characters.find(
    c => c.suspect.id === selectedSuspect
  );

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* Left Panel - Instructions */}
      <View style={styles.leftPanel}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Text style={styles.backButtonText}>← BACK</Text>
        </TouchableOpacity>

        <Text style={styles.title}>MAKE AN ARREST</Text>
        
        <View style={styles.warningBox}>
          <Text style={styles.warningIcon}>⚠️</Text>
          <Text style={styles.warningText}>
            Choose carefully, Detective. Once you make an arrest, the case will be closed.
            An innocent person behind bars means the real killer goes free.
          </Text>
        </View>

        {selectedSuspect && (
          <View style={styles.selectedInfo}>
            <Text style={styles.selectedLabel}>SELECTED</Text>
            <Text style={styles.selectedName}>{selectedCharacter?.suspect.name}</Text>
            
            {confirmMode ? (
              <View style={styles.confirmContainer}>
                <Text style={styles.confirmText}>
                  Are you sure you want to arrest this suspect?
                </Text>
                <View style={styles.confirmButtons}>
                  <TouchableOpacity 
                    style={styles.cancelButton} 
                    onPress={() => setConfirmMode(false)}
                  >
                    <Text style={styles.cancelButtonText}>CANCEL</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.confirmButton} onPress={handleAccuse}>
                    <Text style={styles.confirmButtonText}>CONFIRM</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <TouchableOpacity style={styles.arrestButton} onPress={handleAccuse}>
                <Text style={styles.arrestButtonText}>ARREST</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>

      {/* Right Panel - Suspect Grid */}
      <View style={styles.rightPanel}>
        <Text style={styles.suspectsTitle}>SELECT A SUSPECT</Text>
        
        <View style={styles.suspectsGrid}>
          {gameState.currentCase.characters.map((character) => (
            <TouchableOpacity
              key={character.suspect.id}
              style={[
                styles.suspectCard,
                selectedSuspect === character.suspect.id && styles.suspectCardSelected,
              ]}
              onPress={() => {
                setSelectedSuspect(character.suspect.id);
                setConfirmMode(false);
              }}
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
              {selectedSuspect === character.suspect.id && (
                <View style={styles.selectedBadge}>
                  <Text style={styles.selectedBadgeText}>✓</Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>
      </View>
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
    borderRightWidth: 1,
    borderRightColor: '#4A3228',
  },
  backButton: {
    marginBottom: 16,
  },
  backButtonText: {
    color: '#D4A574',
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#D4A574',
    letterSpacing: 3,
    marginBottom: 20,
  },
  warningBox: {
    backgroundColor: 'rgba(139, 35, 35, 0.3)',
    padding: 16,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#8B2323',
  },
  warningIcon: {
    fontSize: 20,
    marginBottom: 8,
  },
  warningText: {
    color: '#E8DDD4',
    fontSize: 13,
    lineHeight: 20,
  },
  selectedInfo: {
    marginTop: 24,
    padding: 16,
    backgroundColor: '#3D2617',
    borderRadius: 10,
  },
  selectedLabel: {
    fontSize: 10,
    color: '#8B7355',
    letterSpacing: 2,
  },
  selectedName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#D4A574',
    marginTop: 4,
    marginBottom: 16,
  },
  arrestButton: {
    backgroundColor: '#8B2323',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  arrestButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 2,
  },
  confirmContainer: {},
  confirmText: {
    color: '#E8DDD4',
    fontSize: 13,
    marginBottom: 12,
  },
  confirmButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#4A3228',
    paddingVertical: 10,
    borderRadius: 6,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#D4A574',
    fontSize: 12,
    fontWeight: '600',
  },
  confirmButton: {
    flex: 1,
    backgroundColor: '#8B2323',
    paddingVertical: 10,
    borderRadius: 6,
    alignItems: 'center',
  },
  confirmButtonText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '700',
  },
  // Right Panel
  rightPanel: {
    width: '55%',
    padding: 24,
    backgroundColor: '#241510',
  },
  suspectsTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#8B7355',
    letterSpacing: 2,
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
  suspectCardSelected: {
    borderColor: '#8B2323',
    borderWidth: 3,
  },
  suspectImage: {
    width: '100%',
    height: 100,
    backgroundColor: '#4A3228',
  },
  suspectInfo: {
    padding: 10,
  },
  suspectName: {
    fontSize: 12,
    fontWeight: '700',
    color: '#D4A574',
  },
  suspectOccupation: {
    fontSize: 10,
    color: '#8B7355',
    marginTop: 2,
  },
  selectedBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#8B2323',
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedBadgeText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '700',
  },
});
