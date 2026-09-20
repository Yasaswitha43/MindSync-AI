import React from 'react';
import { Animated3DBackground } from './Animated3DBackground';
import { AppPage } from '../types';

export const NeuralBackground3D: React.FC<{ page?: AppPage; className?: string }> = (props) => {
  return <Animated3DBackground {...props} />;
};
