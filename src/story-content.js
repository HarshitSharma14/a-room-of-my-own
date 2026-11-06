// Harshit's personal story and crossword puzzle data.
export const storyContent = {
  eyebrow: 'HARSHIT’S ORIGIN STORY · 1ST GRADE TO GENAI',
  title: 'From 1st Grade to GenAI',
  lead: 'A story told across broken games, rooted phones, and late-night builds.',
  introduction: 'Every hacker starts somewhere curious. Solve the crossword below to uncover the milestones of how I got into tech—from my very first PC to generative AI.',
  
  crossword: {
    rows: 9,
    cols: 9,
    words: [
      { id: 'claude', number: 1, direction: 'down', row: 0, col: 6, answer: 'CLAUDE', clue: '“Now it’s just me, my bed, and my ____ against the world”' },
      { id: 'papa', number: 2, direction: 'across', row: 2, col: 5, answer: 'PAPA', clue: 'Bought me my first PC in 1st grade with internet access' },
      { id: 'root', number: 3, direction: 'down', row: 5, col: 1, answer: 'ROOT', clue: 'By 5th grade I figured out how to do this to my phone to modify system apps' },
      { id: 'games', number: 4, direction: 'across', row: 5, col: 3, answer: 'GAMES', clue: 'What I downloaded and exchanged on CDs across school' },
      { id: 'ads', number: 5, direction: 'down', row: 5, col: 4, answer: 'ADS', clue: 'By 3rd grade I could spot phishing sites and tell which download buttons were fake ____' },
      { id: 'coins', number: 6, direction: 'across', row: 7, col: 0, answer: 'COINS', clue: 'What I tried hacking games to get an unlimited supply of' },
    ]
  },

  sections: [
    {
      number: '01',
      title: 'The First Machine (1st Grade)',
      text: 'My papa bought me my first PC in 1st grade with internet access. I started downloading games and exchanging CDs in school like currency.'
    },
    {
      number: '02',
      title: 'The Phishing Radar (3rd Grade)',
      text: 'By 3rd grade, I had an instinct for the web. I knew which sites were phishing traps and exactly which flashing “DOWNLOAD” buttons were just ads.'
    },
    {
      number: '03',
      title: 'Rooting & App Modding (4th–5th Grade)',
      text: 'Got a mobile in 4th grade. I tried hacking games for unlimited coins, and by 5th grade I had rooted my phone, swapped camera app icons and names from YouTube tutorials, and flexed it.'
    },
    {
      number: '04',
      title: 'Full Circle to GenAI (7th Grade–College)',
      text: 'In 7th grade, I got a paid Udemy web dev course. School studies took over for a while, but in my 1st year of college, I finished it. That led me straight into GenAI. Now, it’s just me, my bed, and my Claude against the world.'
    }
  ],
  closing: 'Every project in this room carries a piece of that same tinkering spirit.',
  signature: 'Harshit',
};
