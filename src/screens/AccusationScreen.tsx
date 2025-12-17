import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useGame } from '../context/GameContext';

const { width } = Dimensions.get('window');

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
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Text style={styles.backButtonText}>← BACK</Text>
        </TouchableOpacity>
        <Text style={styles.title}>MAKE AN ARREST</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Warning */}
      <View style={styles.warningBox}>
        <Text style={styles.warningIcon}>⚠️</Text>
        <Text style={styles.warningText}>
          Choose carefully, Detective. Once you make an arrest, the case will be closed.
          An innocent person behind bars means the real killer goes free.
        </Text>
      </View>

      {/* Suspect Grid */}
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
                <Text style={styles.selectedBadgeText}>SELECTED</Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </View>

      {/* Action Area */}
      <View style={styles.actionArea}>
        {selectedSuspect ? (
          <>
            {confirmMode ? (
              <View style={styles.confirmContainer}>
                <Text style={styles.confirmText}>
                  Arrest {selectedCharacter?.suspect.name} for the murder of{' '}
                  {gameState.currentCase.victimName}?
                </Text>
                <View style={styles.confirmButtons}>
                  <TouchableOpacity 
                    style={styles.cancelButton} 
                    onPress={() => setConfirmMode(false)}
                  >
                    <Text style={styles.cancelButtonText}>CANCEL</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.confirmButton} onPress={handleAccuse}>
                    <Text style={styles.confirmButtonText}>CONFIRM ARREST</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <TouchableOpacity style={styles.accuseButton} onPress={handleAccuse}>
                <Text style={styles.accuseButtonText}>
                  ARREST {selectedCharacter?.suspect.name.toUpperCase()}
                </Text>
              </TouchableOpacity>
            )}
          </>
        ) : (
          <Text style={styles.hintText}>Select a suspect to arrest</Text>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#2C1810',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    color: '#D4A574',
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: '#D4A574',
    letterSpacing: 2,
  },
  placeholder: {
    width: 60,
  },
  warningBox: {
    flexDirection: 'row',
    backgroundColor: 'rgba(139, 35, 35, 0.3)',
    marginHorizontal: 16,
    marginTop: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#8B2323',
    alignItems: 'flex-start',
  },
  warningIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  warningText: {
    flex: 1,
    color: '#E8DDD4',
    fontSize: 14,
    lineHeight: 20,
  },
  suspectsGrid: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
    justifyContent: 'space-between',
  },
  suspectCard: {
    width: (width - 48) / 2,
    backgroundColor: '#3D2617',
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#4A3228',
  },
  suspectCardSelected: {
    borderColor: '#8B2323',
    borderWidth: 3,
  },
  suspectImage: {
    width: '100%',
    height: 140,
    backgroundColor: '#4A3228',
  },
  suspectInfo: {
    padding: 12,
  },
  suspectName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#D4A574',
  },
  suspectOccupation: {
    fontSize: 12,
    color: '#8B7355',
    marginTop: 2,
  },
  selectedBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#8B2323',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  selectedBadgeText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
  },
  actionArea: {
    padding: 20,
    paddingBottom: 30,
    alignItems: 'center',
  },
  accuseButton: {
    backgroundColor: '#8B2323',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#A52A2A',
    width: '100%',
    alignItems: 'center',
  },
  accuseButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 2,
  },
  hintText: {
    color: '#6B5344',
    fontSize: 14,
    fontStyle: 'italic',
  },
  confirmContainer: {
    width: '100%',
    alignItems: 'center',
  },
  confirmText: {
    color: '#E8DDD4',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 24,
  },
  confirmButtons: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#4A3228',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#D4A574',
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 1,
  },
  confirmButton: {
    flex: 1,
    backgroundColor: '#8B2323',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  confirmButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 1,
  },
});

