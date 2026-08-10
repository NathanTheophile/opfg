import type { MusicTrack } from './AudioProvider';

export const AUDIO_TRACKS = {
  ambience: {
    tavern: '/audio/ambience/tavern.mp3',
  },
} as const;

export const MUSIC_PLAYLIST: readonly MusicTrack[] = [
  { id: 'sudden-winds', title: 'Sudden Winds', src: '/audio/music/Sudden Winds.mp3' },
  { id: 'east-blue-love', title: 'East Blue My Love', src: '/audio/music/East Blue My Love.mp3' },
  { id: 'lovely-bar', title: 'Lovely Bar', src: '/audio/music/Lovely Bar.mp3' }
  // Add music files under public/audio/music/, then register them here:
  // { id: 'quiet-seas', title: 'Quiet Seas', src: '/audio/music/quiet-seas.mp3' },
  // { id: 'adventure-01', title: 'Adventure', src: '/audio/music/adventure-01.mp3' },
];
