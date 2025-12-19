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

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Text style={styles.backButtonText}>← BACK</Text>
        </TouchableOpacity>
        <Text style={styles.title}>MAKE AN ARREST</Text>
      </View>

      {/* Warning */}
      <View style={styles.warningBox}>
        <Text style={styles.warningText}>
          ⚠️ Choose carefully. Once you arrest someone, the case is closed.
        </Text>
      </View>

      {/* Suspects Grid */}
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
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
      </ScrollView>

      {/* Action Area */}
      <View style={styles.actionArea}>
        {selectedSuspect ? (
          confirmMode ? (
            <View style={styles.confirmContainer}>
              <Text style={styles.confirmText}>
                Arrest {selectedCharacter?.suspect.name}?
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
              <Text style={styles.arrestButtonText}>
                ARREST {selectedCharacter?.suspect.name.split(' ')[0].toUpperCase()}
              </Text>
            </TouchableOpacity>
          )
        ) : (
          <Text style={styles.hintText}>Select a suspect to arrest</Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#2C1810',
    padding: 20,
  },
  header: {
    marginBottom: 12,
  },
  backButton: {
    marginBottom: 8,
  },
  backButtonText: {
    color: '#D4A574',
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 1,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#D4A574',
    letterSpacing: 3,
  },
  warningBox: {
    backgroundColor: 'rgba(139, 35, 35, 0.3)',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#8B2323',
    marginBottom: 16,
  },
  warningText: {
    color: '#E8DDD4',
    fontSize: 12,
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 10,
  },
  suspectsGrid: {
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
    height: 110,
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
  selectedBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#8B2323',
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedBadgeText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '700',
  },
  actionArea: {
    paddingTop: 16,
  },
  arrestButton: {
    backgroundColor: '#8B2323',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  arrestButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 2,
  },
  hintText: {
    color: '#6B5344',
    fontSize: 13,
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: 14,
  },
  confirmContainer: {
    alignItems: 'center',
  },
  confirmText: {
    color: '#E8DDD4',
    fontSize: 14,
    marginBottom: 12,
  },
  confirmButtons: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#4A3228',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#D4A574',
    fontSize: 13,
    fontWeight: '600',
  },
  confirmButton: {
    flex: 1,
    backgroundColor: '#8B2323',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  confirmButtonText: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '700',
  },
});
