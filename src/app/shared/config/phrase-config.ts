import { InjectionToken } from '@angular/core';

export interface PhraseConfig {
  projectId: string;
  phraseEnabled: boolean;
  prefix: string;
  suffix: string;
  fullReparse: boolean;
}

export const PHRASE_CONFIG: PhraseConfig = {
  projectId: 'dec2efdab93d62d55da009cb683a438a',
  phraseEnabled: true,
  prefix: '[[__',
  suffix: '__]]',
  fullReparse: true,
};

export const PHRASE_CONFIG_TOKEN = new InjectionToken<PhraseConfig>(
  'phrase-config'
);
