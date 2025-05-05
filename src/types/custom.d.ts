import type { StrandContent } from './strand';

declare module '*.json' {
  const value: StrandContent[];
  export default value;
}
