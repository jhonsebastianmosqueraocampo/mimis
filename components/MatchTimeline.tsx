import React from 'react';
import {
    FlatList,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { Avatar, Chip, Divider, Surface } from 'react-native-paper';

type EventType = 'goal' | 'yellow-card' | 'red-card' | 'substitution';

type MatchEvent = {
  minute: number;
  type: EventType;
  player: string;
  team: 'home' | 'away';
  description?: string;
};

const fakeEvents: MatchEvent[] = [
  { minute: 85, type: 'goal', player: 'Lewandowski', team: 'home' },
  {
    minute: 78,
    type: 'substitution',
    player: 'João Félix entra por Raphinha',
    team: 'home',
  },
  { minute: 70, type: 'yellow-card', player: 'Araujo', team: 'home' },
  { minute: 68, type: 'goal', player: 'Vinícius Jr.', team: 'away' },
  { minute: 55, type: 'red-card', player: 'Rüdiger', team: 'away' },
  { minute: 45, type: 'yellow-card', player: 'Tchouaméni', team: 'away' },
];

const getEventIconName = (type: EventType): string => {
  switch (type) {
    case 'goal':
      return 'sports-soccer';
    case 'yellow-card':
      return 'warning-amber';
    case 'red-card':
      return 'sentiment-very-dissatisfied';
    case 'substitution':
      return 'subdirectory-arrow-right';
    default:
      return 'info';
  }
};

const summarizeEvents = (events: MatchEvent[]) => {
  const summary = {
    home: { goal: 0, 'yellow-card': 0, 'red-card': 0, substitution: 0 },
    away: { goal: 0, 'yellow-card': 0, 'red-card': 0, substitution: 0 },
  };

  events.forEach((e) => {
    summary[e.team][e.type]++;
  });

  return summary;
};

export default function MatchTimeline() {
  const summary = summarizeEvents(fakeEvents);

  return (
    <Surface style={styles.container}>
      <ScrollView>
        {/* Summary Section */}
        <View style={styles.summaryContainer}>
          <Text style={styles.sectionTitle}>📊 Resumen del Partido</Text>

          <View style={styles.teamBlock}>
            <Text style={styles.teamTitle}>Real Madrid</Text>
            <SummaryChips data={summary.home} />
          </View>

          <View style={styles.teamBlock}>
            <Text style={styles.teamTitle}>Barcelona</Text>
            <SummaryChips data={summary.away} />
          </View>
        </View>

        {/* Timeline Section */}
        <FlatList
          data={fakeEvents}
          keyExtractor={(_, index) => index.toString()}
          ItemSeparatorComponent={() => <Divider style={styles.divider} />}
          renderItem={({ item }) => (
            <View
              style={[
                styles.eventItem,
                {
                  backgroundColor:
                    item.team === 'home' ? '#e0f7fa' : '#fce4ec',
                },
              ]}
            >
              <Avatar.Text
                label=""
                size={40}
                style={styles.avatar}
              />
              <View style={styles.eventText}>
                <Text style={styles.eventPrimary}>
                  {item.minute}' - {item.player}
                </Text>
                <Text style={styles.eventSecondary}>
                  {item.description || formatEventDescription(item)}
                </Text>
              </View>
            </View>
          )}
        />
      </ScrollView>
    </Surface>
  );
}

function formatEventDescription(event: MatchEvent): string {
  switch (event.type) {
    case 'goal':
      return '¡Gol!';
    case 'yellow-card':
      return 'Tarjeta amarilla';
    case 'red-card':
      return 'Tarjeta roja';
    case 'substitution':
      return 'Cambio realizado';
    default:
      return '';
  }
}

function SummaryChips({ data }: { data: Record<EventType, number> }) {
  return (
    <View style={styles.chipGroup}>
      <Chip icon="soccer" style={styles.chip}>
        Goles: {data.goal}
      </Chip>
      <Chip icon="alert" style={styles.chip}>
        Amarillas: {data['yellow-card']}
      </Chip>
      <Chip icon="close-circle" style={styles.chip}>
        Rojas: {data['red-card']}
      </Chip>
      <Chip icon="transfer" style={styles.chip}>
        Cambios: {data.substitution}
      </Chip>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 12,
    marginHorizontal: 16,
    padding: 16,
    borderRadius: 12,
    elevation: 2,
  },
  summaryContainer: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    color: '#333',
  },
  teamBlock: {
    marginBottom: 12,
  },
  teamTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 6,
    color: '#333',
  },
  chipGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  chip: {
    marginRight: 6,
    marginBottom: 6,
  },
  eventItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: 8,
  },
  avatar: {
    marginRight: 12,
    backgroundColor: '#fff',
  },
  eventText: {
    flex: 1,
  },
  eventPrimary: {
    fontWeight: '600',
    color: '#333',
  },
  eventSecondary: {
    fontSize: 12,
    color: '#666',
  },
  divider: {
    height: 1,
    marginVertical: 4,
  },
});