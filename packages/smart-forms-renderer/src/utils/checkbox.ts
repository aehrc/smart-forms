export type AriaCheckedAttributes = 'true' | 'false' | 'mixed';

export const ariaCheckedMap: Map<string, AriaCheckedAttributes> = new Map([
  ['true', 'true'],
  ['false', 'false'],
  ['intermediate', 'mixed']
]);
