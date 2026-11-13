import { RESULTS_MD } from './config';
import { writeReport } from './results';

export default async function globalTeardown(): Promise<void> {
  writeReport();
  console.log(`\nTest plan results written to ${RESULTS_MD}`);
}
