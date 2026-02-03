import { TopicVocabulary, VocabularyItem } from '@/types'

// Topic-specific vocabulary databases
export const topicVocabulary: TopicVocabulary[] = [
  {
    topicId: 'daily-routines',
    vocabulary: [
      // A1 Level
      { word: 'wake up', germanTranslation: 'aufwachen', difficultyLevel: 'A1', example: 'I wake up at 7 AM.' },
      { word: 'breakfast', germanTranslation: 'Frühstück', difficultyLevel: 'A1', example: 'I eat breakfast at 8 AM.' },
      { word: 'work', germanTranslation: 'Arbeit', difficultyLevel: 'A1', example: 'I go to work every day.' },
      { word: 'sleep', germanTranslation: 'schlafen', difficultyLevel: 'A1', example: 'I sleep at 10 PM.' },
      // A2 Level
      { word: 'routine', germanTranslation: 'Routine', difficultyLevel: 'A2', example: 'My morning routine is simple.' },
      { word: 'get dressed', germanTranslation: 'sich anziehen', difficultyLevel: 'A2', example: 'I get dressed after breakfast.' },
      { word: 'commute', germanTranslation: 'pendeln', difficultyLevel: 'A2', example: 'My commute takes 30 minutes.' },
      // B1 Level
      { word: 'hectic', germanTranslation: 'hektisch', difficultyLevel: 'B1', example: 'My mornings are usually hectic.' },
      { word: 'wind down', germanTranslation: 'sich entspannen', difficultyLevel: 'B1', example: 'I wind down by reading before bed.' },
      { word: 'productive', germanTranslation: 'produktiv', difficultyLevel: 'B1', example: 'I feel most productive in the morning.' },
      // B2 Level
      { word: 'juggle', germanTranslation: 'jonglieren (Aufgaben)', difficultyLevel: 'B2', example: 'I juggle work and personal life.' },
      { word: 'streamline', germanTranslation: 'rationalisieren', difficultyLevel: 'B2', example: 'I try to streamline my morning routine.' },
      // C1 Level
      { word: 'ingrained', germanTranslation: 'tief verwurzelt', difficultyLevel: 'C1', example: 'These habits are ingrained in my daily life.' },
      { word: 'meticulous', germanTranslation: 'akribisch', difficultyLevel: 'C1', example: 'I am meticulous about my schedule.' },
    ],
  },
  {
    topicId: 'hobbies',
    vocabulary: [
      // A1 Level
      { word: 'play', germanTranslation: 'spielen', difficultyLevel: 'A1', example: 'I play football.' },
      { word: 'read', germanTranslation: 'lesen', difficultyLevel: 'A1', example: 'I read books every day.' },
      { word: 'watch', germanTranslation: 'schauen', difficultyLevel: 'A1', example: 'I watch movies on weekends.' },
      { word: 'music', germanTranslation: 'Musik', difficultyLevel: 'A1', example: 'I listen to music.' },
      // A2 Level
      { word: 'hobby', germanTranslation: 'Hobby', difficultyLevel: 'A2', example: 'My favorite hobby is painting.' },
      { word: 'collect', germanTranslation: 'sammeln', difficultyLevel: 'A2', example: 'I collect stamps.' },
      { word: 'enjoy', germanTranslation: 'genießen', difficultyLevel: 'A2', example: 'I enjoy cooking in my free time.' },
      // B1 Level
      { word: 'passion', germanTranslation: 'Leidenschaft', difficultyLevel: 'B1', example: 'Photography is my passion.' },
      { word: 'unwind', germanTranslation: 'abschalten', difficultyLevel: 'B1', example: 'I unwind by playing guitar.' },
      { word: 'creative outlet', germanTranslation: 'kreatives Ventil', difficultyLevel: 'B1', example: 'Painting is my creative outlet.' },
      // B2 Level
      { word: 'avid', germanTranslation: 'begeistert', difficultyLevel: 'B2', example: 'I am an avid reader.' },
      { word: 'immerse', germanTranslation: 'eintauchen', difficultyLevel: 'B2', example: 'I immerse myself in my hobbies.' },
      // C1 Level
      { word: 'quintessential', germanTranslation: 'typisch', difficultyLevel: 'C1', example: 'Reading is the quintessential relaxation activity.' },
      { word: 'cultivate', germanTranslation: 'pflegen', difficultyLevel: 'C1', example: 'I cultivate various interests.' },
    ],
  },
  {
    topicId: 'travel',
    vocabulary: [
      // A1 Level
      { word: 'trip', germanTranslation: 'Reise', difficultyLevel: 'A1', example: 'I went on a trip to Italy.' },
      { word: 'vacation', germanTranslation: 'Urlaub', difficultyLevel: 'A1', example: 'I need a vacation.' },
      { word: 'beach', germanTranslation: 'Strand', difficultyLevel: 'A1', example: 'I love the beach.' },
      { word: 'hotel', germanTranslation: 'Hotel', difficultyLevel: 'A1', example: 'We stayed at a nice hotel.' },
      // A2 Level
      { word: 'destination', germanTranslation: 'Reiseziel', difficultyLevel: 'A2', example: 'Paris is my dream destination.' },
      { word: 'sightseeing', germanTranslation: 'Besichtigung', difficultyLevel: 'A2', example: 'We went sightseeing in Rome.' },
      { word: 'luggage', germanTranslation: 'Gepäck', difficultyLevel: 'A2', example: 'I packed my luggage.' },
      // B1 Level
      { word: 'itinerary', germanTranslation: 'Reiseroute', difficultyLevel: 'B1', example: 'We planned our itinerary carefully.' },
      { word: 'explore', germanTranslation: 'erkunden', difficultyLevel: 'B1', example: 'I love to explore new cities.' },
      { word: 'backpacking', germanTranslation: 'Rucksackreisen', difficultyLevel: 'B1', example: 'I enjoy backpacking through Europe.' },
      // B2 Level
      { word: 'wanderlust', germanTranslation: 'Fernweh', difficultyLevel: 'B2', example: 'I have a strong sense of wanderlust.' },
      { word: 'immerse yourself', germanTranslation: 'sich vertiefen', difficultyLevel: 'B2', example: 'I like to immerse myself in local culture.' },
      // C1 Level
      { word: 'off the beaten path', germanTranslation: 'abseits der Touristenpfade', difficultyLevel: 'C1', example: 'I prefer destinations off the beaten path.' },
      { word: 'cosmopolitan', germanTranslation: 'weltoffene Stadt', difficultyLevel: 'C1', example: 'London is a cosmopolitan city.' },
    ],
  },
  {
    topicId: 'food',
    vocabulary: [
      // A1 Level
      { word: 'eat', germanTranslation: 'essen', difficultyLevel: 'A1', example: 'I eat lunch at noon.' },
      { word: 'delicious', germanTranslation: 'lecker', difficultyLevel: 'A1', example: 'The food is delicious.' },
      { word: 'cook', germanTranslation: 'kochen', difficultyLevel: 'A1', example: 'I cook dinner every night.' },
      { word: 'restaurant', germanTranslation: 'Restaurant', difficultyLevel: 'A1', example: 'We ate at a restaurant.' },
      // A2 Level
      { word: 'recipe', germanTranslation: 'Rezept', difficultyLevel: 'A2', example: 'I tried a new recipe.' },
      { word: 'ingredients', germanTranslation: 'Zutaten', difficultyLevel: 'A2', example: 'I bought the ingredients at the market.' },
      { word: 'taste', germanTranslation: 'schmecken', difficultyLevel: 'A2', example: 'This tastes great!' },
      // B1 Level
      { word: 'cuisine', germanTranslation: 'Küche', difficultyLevel: 'B1', example: 'I love Italian cuisine.' },
      { word: 'savory', germanTranslation: 'herzhaft', difficultyLevel: 'B1', example: 'I prefer savory dishes over sweet ones.' },
      { word: 'nutritious', germanTranslation: 'nahrhaft', difficultyLevel: 'B1', example: 'I try to eat nutritious meals.' },
      // B2 Level
      { word: 'delicacy', germanTranslation: 'Delikatesse', difficultyLevel: 'B2', example: 'Sushi is considered a delicacy.' },
      { word: 'palate', germanTranslation: 'Gaumen', difficultyLevel: 'B2', example: 'You need a refined palate to appreciate this dish.' },
      // C1 Level
      { word: 'culinary', germanTranslation: 'kulinarisch', difficultyLevel: 'C1', example: 'I have a passion for culinary arts.' },
      { word: 'gastronomic', germanTranslation: 'gastronomisch', difficultyLevel: 'C1', example: 'It was a gastronomic experience.' },
    ],
  },
  {
    topicId: 'work',
    vocabulary: [
      // A1 Level
      { word: 'job', germanTranslation: 'Arbeit', difficultyLevel: 'A1', example: 'I have a new job.' },
      { word: 'office', germanTranslation: 'Büro', difficultyLevel: 'A1', example: 'I work in an office.' },
      { word: 'boss', germanTranslation: 'Chef', difficultyLevel: 'A1', example: 'My boss is nice.' },
      { word: 'meeting', germanTranslation: 'Besprechung', difficultyLevel: 'A1', example: 'I have a meeting at 2 PM.' },
      // A2 Level
      { word: 'colleague', germanTranslation: 'Kollege', difficultyLevel: 'A2', example: 'My colleagues are friendly.' },
      { word: 'deadline', germanTranslation: 'Frist', difficultyLevel: 'A2', example: 'I have a deadline tomorrow.' },
      { word: 'career', germanTranslation: 'Karriere', difficultyLevel: 'A2', example: 'I want to build a good career.' },
      // B1 Level
      { word: 'workload', germanTranslation: 'Arbeitspensum', difficultyLevel: 'B1', example: 'My workload is heavy this week.' },
      { word: 'promotion', germanTranslation: 'Beförderung', difficultyLevel: 'B1', example: 'I received a promotion.' },
      { word: 'collaborate', germanTranslation: 'zusammenarbeiten', difficultyLevel: 'B1', example: 'We collaborate on projects.' },
      // B2 Level
      { word: 'stakeholder', germanTranslation: 'Interessenvertreter', difficultyLevel: 'B2', example: 'We need to consult with stakeholders.' },
      { word: 'resilient', germanTranslation: 'belastbar', difficultyLevel: 'B2', example: 'You need to be resilient in this field.' },
      // C1 Level
      { word: 'leverage', germanTranslation: 'nutzen', difficultyLevel: 'C1', example: 'We can leverage our resources.' },
      { word: 'synergy', germanTranslation: 'Synergie', difficultyLevel: 'C1', example: 'There is good synergy between teams.' },
    ],
  },
  {
    topicId: 'family',
    vocabulary: [
      // A1 Level
      { word: 'family', germanTranslation: 'Familie', difficultyLevel: 'A1', example: 'I love my family.' },
      { word: 'mother', germanTranslation: 'Mutter', difficultyLevel: 'A1', example: 'My mother is kind.' },
      { word: 'father', germanTranslation: 'Vater', difficultyLevel: 'A1', example: 'My father works hard.' },
      { word: 'brother', germanTranslation: 'Bruder', difficultyLevel: 'A1', example: 'I have one brother.' },
      // A2 Level
      { word: 'relative', germanTranslation: 'Verwandter', difficultyLevel: 'A2', example: 'I visited my relatives.' },
      { word: 'relationship', germanTranslation: 'Beziehung', difficultyLevel: 'A2', example: 'We have a good relationship.' },
      { word: 'close-knit', germanTranslation: 'eng verbunden', difficultyLevel: 'A2', example: 'We are a close-knit family.' },
      // B1 Level
      { word: 'upbringing', germanTranslation: 'Erziehung', difficultyLevel: 'B1', example: 'I had a good upbringing.' },
      { word: 'bond', germanTranslation: 'Bindung', difficultyLevel: 'B1', example: 'We have a strong bond.' },
      { word: 'nurture', germanTranslation: 'pflegen', difficultyLevel: 'B1', example: 'Parents nurture their children.' },
      // B2 Level
      { word: 'kinship', germanTranslation: 'Verwandtschaft', difficultyLevel: 'B2', example: 'There is a sense of kinship among us.' },
      { word: 'estranged', germanTranslation: 'entfremdet', difficultyLevel: 'B2', example: 'We became estranged over the years.' },
      // C1 Level
      { word: 'patriarch', germanTranslation: 'Patriarch', difficultyLevel: 'C1', example: 'My grandfather is the patriarch of our family.' },
      { word: 'filial', germanTranslation: 'kindlich', difficultyLevel: 'C1', example: 'I have filial obligations.' },
    ],
  },
  {
    topicId: 'health',
    vocabulary: [
      // A1 Level
      { word: 'healthy', germanTranslation: 'gesund', difficultyLevel: 'A1', example: 'I try to stay healthy.' },
      { word: 'exercise', germanTranslation: 'trainieren', difficultyLevel: 'A1', example: 'I exercise every day.' },
      { word: 'gym', germanTranslation: 'Fitnessstudio', difficultyLevel: 'A1', example: 'I go to the gym.' },
      { word: 'run', germanTranslation: 'laufen', difficultyLevel: 'A1', example: 'I run in the morning.' },
      // A2 Level
      { word: 'fitness', germanTranslation: 'Fitness', difficultyLevel: 'A2', example: 'I care about my fitness.' },
      { word: 'diet', germanTranslation: 'Ernährung', difficultyLevel: 'A2', example: 'I follow a healthy diet.' },
      { word: 'strength', germanTranslation: 'Kraft', difficultyLevel: 'A2', example: 'I want to build strength.' },
      // B1 Level
      { word: 'well-being', germanTranslation: 'Wohlbefinden', difficultyLevel: 'B1', example: 'Exercise improves my well-being.' },
      { word: 'stamina', germanTranslation: 'Ausdauer', difficultyLevel: 'B1', example: 'I need to improve my stamina.' },
      { word: 'wellness', germanTranslation: 'Wellness', difficultyLevel: 'B1', example: 'I focus on wellness.' },
      // B2 Level
      { word: 'holistic', germanTranslation: 'ganzheitlich', difficultyLevel: 'B2', example: 'I take a holistic approach to health.' },
      { word: 'sedentary', germanTranslation: 'sitzend', difficultyLevel: 'B2', example: 'A sedentary lifestyle is unhealthy.' },
      // C1 Level
      { word: 'cardiovascular', germanTranslation: 'kardiovaskulär', difficultyLevel: 'C1', example: 'I do cardiovascular exercises.' },
      { word: 'metabolic', germanTranslation: 'Stoffwechsel-', difficultyLevel: 'C1', example: 'It boosts metabolic rate.' },
    ],
  },
  {
    topicId: 'entertainment',
    vocabulary: [
      // A1 Level
      { word: 'movie', germanTranslation: 'Film', difficultyLevel: 'A1', example: 'I watched a good movie.' },
      { word: 'song', germanTranslation: 'Lied', difficultyLevel: 'A1', example: 'I like this song.' },
      { word: 'book', germanTranslation: 'Buch', difficultyLevel: 'A1', example: 'I read a book.' },
      { word: 'fun', germanTranslation: 'Spaß', difficultyLevel: 'A1', example: 'It was fun.' },
      // A2 Level
      { word: 'genre', germanTranslation: 'Genre', difficultyLevel: 'A2', example: 'My favorite genre is comedy.' },
      { word: 'performance', germanTranslation: 'Aufführung', difficultyLevel: 'A2', example: 'The performance was amazing.' },
      { word: 'entertaining', germanTranslation: 'unterhaltsam', difficultyLevel: 'A2', example: 'The show was very entertaining.' },
      // B1 Level
      { word: 'plot', germanTranslation: 'Handlung', difficultyLevel: 'B1', example: 'The movie has an interesting plot.' },
      { word: 'captivating', germanTranslation: 'fesselnd', difficultyLevel: 'B1', example: 'The story was captivating.' },
      { word: 'soundtrack', germanTranslation: 'Soundtrack', difficultyLevel: 'B1', example: 'I loved the soundtrack.' },
      // B2 Level
      { word: 'compelling', germanTranslation: 'überzeugend', difficultyLevel: 'B2', example: 'The narrative is compelling.' },
      { word: 'binge-watch', germanTranslation: 'durchschauen', difficultyLevel: 'B2', example: 'I binge-watched the series.' },
      // C1 Level
      { word: 'cinematic', germanTranslation: 'filmisch', difficultyLevel: 'C1', example: 'It has cinematic quality.' },
      { word: 'nuanced', germanTranslation: 'nuanciert', difficultyLevel: 'C1', example: 'The character is nuanced.' },
    ],
  },
  {
    topicId: 'current-events',
    vocabulary: [
      // A1 Level
      { word: 'news', germanTranslation: 'Nachrichten', difficultyLevel: 'A1', example: 'I watch the news.' },
      { word: 'world', germanTranslation: 'Welt', difficultyLevel: 'A1', example: 'The world is changing.' },
      { word: 'important', germanTranslation: 'wichtig', difficultyLevel: 'A1', example: 'This is important.' },
      { word: 'happen', germanTranslation: 'passieren', difficultyLevel: 'A1', example: 'What happened?' },
      // A2 Level
      { word: 'event', germanTranslation: 'Ereignis', difficultyLevel: 'A2', example: 'It was a big event.' },
      { word: 'politics', germanTranslation: 'Politik', difficultyLevel: 'A2', example: 'I follow politics.' },
      { word: 'election', germanTranslation: 'Wahl', difficultyLevel: 'A2', example: 'The election is next month.' },
      // B1 Level
      { word: 'issue', germanTranslation: 'Thema', difficultyLevel: 'B1', example: 'Climate change is a major issue.' },
      { word: 'controversy', germanTranslation: 'Kontroverse', difficultyLevel: 'B1', example: 'There is controversy about this topic.' },
      { word: 'development', germanTranslation: 'Entwicklung', difficultyLevel: 'B1', example: 'This is a new development.' },
      // B2 Level
      { word: 'polarized', germanTranslation: 'polarisiert', difficultyLevel: 'B2', example: 'The debate is highly polarized.' },
      { word: 'ramification', germanTranslation: 'Auswirkung', difficultyLevel: 'B2', example: 'The ramifications are serious.' },
      // C1 Level
      { word: 'geopolitical', germanTranslation: 'geopolitisch', difficultyLevel: 'C1', example: 'It has geopolitical implications.' },
      { word: 'unprecedented', germanTranslation: 'beispiellos', difficultyLevel: 'C1', example: 'This is unprecedented.' },
    ],
  },
  {
    topicId: 'future-plans',
    vocabulary: [
      // A1 Level
      { word: 'plan', germanTranslation: 'Plan', difficultyLevel: 'A1', example: 'I have a plan.' },
      { word: 'future', germanTranslation: 'Zukunft', difficultyLevel: 'A1', example: 'I think about the future.' },
      { word: 'hope', germanTranslation: 'hoffen', difficultyLevel: 'A1', example: 'I hope to travel.' },
      { word: 'want', germanTranslation: 'wollen', difficultyLevel: 'A1', example: 'I want to learn more.' },
      // A2 Level
      { word: 'goal', germanTranslation: 'Ziel', difficultyLevel: 'A2', example: 'My goal is to finish this project.' },
      { word: 'dream', germanTranslation: 'Traum', difficultyLevel: 'A2', example: 'My dream is to own a house.' },
      { word: 'achieve', germanTranslation: 'erreichen', difficultyLevel: 'A2', example: 'I want to achieve success.' },
      // B1 Level
      { word: 'aspiration', germanTranslation: 'Streben', difficultyLevel: 'B1', example: 'I have high aspirations.' },
      { word: 'ambition', germanTranslation: 'Ehrgeiz', difficultyLevel: 'B1', example: 'She has great ambition.' },
      { word: 'envision', germanTranslation: 'sich vorstellen', difficultyLevel: 'B1', example: 'I envision a bright future.' },
      // B2 Level
      { word: 'endeavor', germanTranslation: 'Bestreben', difficultyLevel: 'B2', example: 'This is a worthwhile endeavor.' },
      { word: 'trajectory', germanTranslation: 'Verlauf', difficultyLevel: 'B2', example: 'My career trajectory looks promising.' },
      // C1 Level
      { word: 'blueprint', germanTranslation: 'Entwurf', difficultyLevel: 'C1', example: 'I have a blueprint for my future.' },
      { word: 'culminate', germanTranslation: 'gipfeln', difficultyLevel: 'C1', example: 'My efforts will culminate in success.' },
    ],
  },
]

// Helper function to get vocabulary for a specific topic and difficulty level
export function getVocabularyForTopic(
  topicId: string,
  difficultyLevel: string
): VocabularyItem[] {
  const topic = topicVocabulary.find((t) => t.topicId === topicId)
  if (!topic) return []

  // Return vocabulary up to and including the current difficulty level
  const levels = ['A1', 'A2', 'B1', 'B2', 'C1']
  const maxLevelIndex = levels.indexOf(difficultyLevel)
  if (maxLevelIndex === -1) return topic.vocabulary

  return topic.vocabulary.filter((item) => {
    const itemLevelIndex = levels.indexOf(item.difficultyLevel)
    return itemLevelIndex <= maxLevelIndex
  })
}

// Get a random sample of vocabulary items for introduction during conversation
export function getRandomVocabulary(
  topicId: string,
  difficultyLevel: string,
  count: number = 3
): VocabularyItem[] {
  const available = getVocabularyForTopic(topicId, difficultyLevel)
  const shuffled = [...available].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, count)
}
