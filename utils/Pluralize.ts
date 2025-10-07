export default function pluralize(count: number, word: string): string {
  const irregulars: Record<string, string> = {
    jugador: "jugadores",
    campeón: "campeones",
    gol: "goles",
  };

  if (count === 1) return word;

  if (irregulars[word]) return irregulars[word];

  // Si termina en vocal, agregamos 's', si no, 'es'
  return /[aeiouáéíóú]$/i.test(word) ? `${word}s` : `${word}es`;
}