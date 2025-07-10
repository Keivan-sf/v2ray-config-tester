import { is_config_ok_wo_q } from "./config-tester";
import "dotenv/config";
const config_queue: { resolve: (value: boolean) => void; config: string }[] =
  [];

const CONCURRENT_TESTS = process.env.CONCURRENT_TESTS
  ? +process.env.CONCURRENT_TESTS
  : 5;
let currently_testing = 0;

export function is_config_ok(config_uri: string): Promise<boolean> {
  return new Promise((resolve, reject) => {
    if (currently_testing < CONCURRENT_TESTS) {
      currently_testing++;
      is_config_ok_wo_q(config_uri).then((r) => {
        currently_testing--;
        resolve(r);
        tester_finished_cb();
      });
    } else {
      config_queue.push({ resolve, config: config_uri });
    }
  });
}

async function tester_finished_cb() {
  if (config_queue.length > 0) {
    currently_testing++;
    const job = config_queue.shift()!;
    is_config_ok_wo_q(job.config).then((r) => {
      currently_testing--;
      job.resolve(r);
      tester_finished_cb();
    });
  }
}
