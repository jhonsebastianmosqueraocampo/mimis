import React from 'react';
import {
    Dimensions,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { Card, Divider, Title } from 'react-native-paper';
import { WebView } from 'react-native-webview';

export type Goal = {
  team: 'home' | 'away';
  scorer: string;
  minute: number;
  videoUrl?: string;
};

type GoalTimelineProps = {
  homeTeam: string;
  awayTeam: string;
  goals: Goal[];
};

export default function GoalTimeline({
  homeTeam,
  awayTeam,
  goals,
}: GoalTimelineProps) {
  const homeGoals = goals.filter((g) => g.team === 'home');
  const awayGoals = goals.filter((g) => g.team === 'away');
  const cardWidth = (Dimensions.get('window').width - 64) / 2;

  return (
    <ScrollView style={styles.container}>
      <Title style={styles.title}>⚽ Goles del partido</Title>
      <View style={styles.goalsRow}>
        {/* Goles del local */}
        <View style={[styles.column, { minWidth: cardWidth }]}>
          <Text style={styles.teamTitle}>{homeTeam}</Text>
          <Divider style={styles.divider} />
          {homeGoals.map((goal, i) => (
            <View key={i} style={styles.goalItem}>
              <Text style={styles.goalText}>
                {goal.minute}' - {goal.scorer}
              </Text>
              {goal.videoUrl && (
                <Card style={styles.videoCard}>
                  <WebView
                    source={{ uri: goal.videoUrl }}
                    style={styles.webview}
                    allowsFullscreenVideo
                    mediaPlaybackRequiresUserAction={false}
                  />
                </Card>
              )}
            </View>
          ))}
        </View>

        {/* Goles del visitante */}
        <View style={[styles.column, { minWidth: cardWidth }]}>
          <Text style={styles.teamTitle}>{awayTeam}</Text>
          <Divider style={styles.divider} />
          {awayGoals.map((goal, i) => (
            <View key={i} style={styles.goalItem}>
              <Text style={styles.goalText}>
                {goal.minute}' - {goal.scorer}
              </Text>
              {goal.videoUrl && (
                <Card style={styles.videoCard}>
                  <WebView
                    source={{ uri: goal.videoUrl }}
                    style={styles.webview}
                    allowsFullscreenVideo
                    mediaPlaybackRequiresUserAction={false}
                  />
                </Card>
              )}
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    margin: 16,
  },
  title: {
    marginBottom: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  goalsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 16,
  },
  column: {
    flex: 1,
  },
  teamTitle: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 4,
    color: '#1e1e1e',
  },
  divider: {
    marginBottom: 8,
  },
  goalItem: {
    marginBottom: 16,
  },
  goalText: {
    fontSize: 14,
    color: '#444',
  },
  videoCard: {
    marginTop: 8,
    height: 180,
    overflow: 'hidden',
    borderRadius: 8,
  },
  webview: {
    flex: 1,
  },
});