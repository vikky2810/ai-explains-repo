/**
 * Component prop types
 */

import { RefObject } from 'react';

// Chat component types
export interface ChatState {
  repoUrl: string;
  loading: boolean;
  explanation: string;
  metadata: RepoMetadata | null;
  error: string;
}

// Section component types
export interface SectionProps {
  title: string;
  markdown: string;
}

export interface MarkdownSection {
  heading: string;
  content: string;
}

// DOM utility types
export interface ScrollRef {
  ref: RefObject<HTMLElement | null>;
}

// Import types from API types
import { RepoMetadata } from './api';
