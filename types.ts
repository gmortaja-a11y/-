export type Theme = 'light' | 'dark';

export type TrainingMethod = 'instructions' | 'example' | 'bulk' | 'policy';

export interface TrainingExample {
  id: number; // For React keys
  before: string;
  after: string;
}

export interface TrainingData {
  method: TrainingMethod;
  instructions: string; // Used for 'instructions' and 'bulk'
  examples: TrainingExample[]; // Used for 'example'
  policyUrl: string; // Used for 'policy'
  policyText: string; // Used for 'policy' from file content or URL analysis
}
export interface Style {
  id: string;
  name: string;
  icon: string;
  scriptCount: number;
  trainingData: TrainingData;
}

export interface Scene {
  time: string;
  description: string;
  visuals: string;
}

export interface Source {
  name: string;
  url: string;
  reliability?: number;
}

export interface Script {
  title: string;
  style: string;
  duration: string;
  content: string;
  scenes: Scene[];
  sources: Source[];
}

export interface GroundingChunk {
  web: {
    uri: string;
    title: string;
  };
}

export interface FactCheckResult {
  accuracy: number;
  details: string; // Could be markdown
}

export type Section = 'dashboard' | 'newScript' | 'factCheck' | 'api' | 'training';

export interface NotificationMessage {
  id: number;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
}

export interface ApiConfigs {
  claudeApiKey: string;
  chatGptApiKey: string;
}

export type ApiName = 'claude' | 'chatGpt';

export type ConnectionStatus = 'connected' | 'disconnected' | 'pending';

export interface ApiStatuses {
  claude: ConnectionStatus;
  chatGpt: ConnectionStatus;
}