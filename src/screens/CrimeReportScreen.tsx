import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useGame } from '../context/GameContext';

interface Props {
  onDismiss: () => void;
}

export default function CrimeReportScreen({ onDismiss }: Props) {
  const { gameState } = useGame();
  
  if (!gameState.currentCase) {
    return null;
  }
  
  const { victim, crimeDetails, caseNumber, date } = gameState.currentCase;
  
  const getCauseOfDeathText = (cause: string): string => {
    switch (cause) {
      case 'stabbed': return 'STABBING';
      case 'poisoned': return 'POISONING';
      case 'strangled': return 'STRANGULATION';
      case 'shot': return 'GUNSHOT';
      default: return cause.toUpperCase();
    }
  };
  
  return (
    <View style={styles.overlay}>
      <View style={styles.reportContainer}>
        {/* Paper texture effect */}
        <View style={styles.paper}>
          {/* Close Button */}
          <TouchableOpacity style={styles.closeButton} onPress={onDismiss}>
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>

          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.confidential}>⚠️ CONFIDENTIAL ⚠️</Text>
            <Text style={styles.title}>HOMICIDE DIVISION</Text>
            <Text style={styles.subtitle}>CRIME REPORT</Text>
          </View>
          
          {/* Case Info */}
          <View style={styles.caseInfo}>
            <Text style={styles.caseNumber}>CASE #{caseNumber}</Text>
            <Text style={styles.date}>{date}</Text>
          </View>
          
          {/* Divider */}
          <View style={styles.divider} />
          
          {/* Victim Section */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>VICTIM:</Text>
            <Text style={styles.victimName}>{victim.name}</Text>
            <Text style={styles.victimOccupation}>{victim.occupation}</Text>
            <Text style={styles.victimBackground}>{victim.background}</Text>
          </View>
          
          {/* Crime Details */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>CAUSE OF DEATH:</Text>
            <Text style={styles.causeOfDeath}>{getCauseOfDeathText(crimeDetails.causeOfDeath)}</Text>
          </View>
          
          <View style={styles.detailsRow}>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>TIME:</Text>
              <Text style={styles.detailValue}>{crimeDetails.timeOfDeath}</Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>LOCATION:</Text>
              <Text style={styles.detailValue}>{crimeDetails.location.toUpperCase()}</Text>
            </View>
          </View>
          
          {/* Suspects */}
          <View style={styles.divider} />
          
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>SUSPECTS IN CUSTODY:</Text>
            <Text style={styles.suspectCount}>5 INDIVIDUALS</Text>
            <Text style={styles.instructions}>
              All suspects have been detained for questioning. 
              You have 24 hours to identify the killer before the case goes cold.
            </Text>
          </View>
          
          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              Interrogate suspects to uncover their MOTIVE, MEANS, and OPPORTUNITY.
              {'\n'}Only the killer will have all three.
            </Text>
          </View>
          
          {/* Stamp effect */}
          <View style={styles.stamp}>
            <Text style={styles.stampText}>ACTIVE</Text>
          </View>
        </View>
        
        {/* Begin Investigation Button */}
        <TouchableOpacity style={styles.beginButton} onPress={onDismiss}>
          <Text style={styles.beginButtonText}>BEGIN INVESTIGATION</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
    padding: 20,
  },
  reportContainer: {
    width: '100%',
    maxWidth: 450,
    alignItems: 'center',
  },
  paper: {
    backgroundColor: '#F5F0E6',
    borderRadius: 4,
    padding: 30,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 20,
    position: 'relative',
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  confidential: {
    color: '#8B0000',
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 3,
    marginBottom: 10,
  },
  title: {
    color: '#1A1A1A',
    fontSize: 24,
    fontWeight: 'bold',
    letterSpacing: 2,
  },
  subtitle: {
    color: '#444',
    fontSize: 16,
    letterSpacing: 4,
    marginTop: 5,
  },
  caseInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  caseNumber: {
    color: '#333',
    fontSize: 14,
    fontWeight: 'bold',
  },
  date: {
    color: '#666',
    fontSize: 12,
  },
  divider: {
    height: 2,
    backgroundColor: '#333',
    marginVertical: 15,
  },
  section: {
    marginBottom: 15,
  },
  sectionLabel: {
    color: '#666',
    fontSize: 11,
    fontWeight: 'bold',
    letterSpacing: 1,
    marginBottom: 4,
  },
  victimName: {
    color: '#1A1A1A',
    fontSize: 22,
    fontWeight: 'bold',
  },
  victimOccupation: {
    color: '#444',
    fontSize: 14,
    fontStyle: 'italic',
    marginTop: 2,
  },
  victimBackground: {
    color: '#555',
    fontSize: 13,
    marginTop: 8,
    lineHeight: 18,
  },
  causeOfDeath: {
    color: '#8B0000',
    fontSize: 20,
    fontWeight: 'bold',
    letterSpacing: 2,
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  detailItem: {
    flex: 1,
  },
  detailLabel: {
    color: '#666',
    fontSize: 11,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  detailValue: {
    color: '#1A1A1A',
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 2,
  },
  suspectCount: {
    color: '#1A1A1A',
    fontSize: 18,
    fontWeight: 'bold',
  },
  instructions: {
    color: '#555',
    fontSize: 13,
    marginTop: 10,
    lineHeight: 18,
  },
  footer: {
    marginTop: 10,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#CCC',
  },
  footerText: {
    color: '#666',
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
    fontStyle: 'italic',
  },
  stamp: {
    position: 'absolute',
    top: 60,
    right: 20,
    transform: [{ rotate: '-15deg' }],
    borderWidth: 3,
    borderColor: '#006400',
    borderRadius: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  stampText: {
    color: '#006400',
    fontSize: 14,
    fontWeight: 'bold',
    letterSpacing: 2,
  },
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  closeButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  beginButton: {
    backgroundColor: '#8B0000',
    paddingVertical: 16,
    paddingHorizontal: 40,
    borderRadius: 8,
    marginTop: 25,
    borderWidth: 2,
    borderColor: '#D4AF37',
  },
  beginButtonText: {
    color: '#F5E6D3',
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 2,
  },
});

