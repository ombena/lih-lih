/// <reference path="./types/redlock.d.ts" />
import Redlock from 'redlock';
import redis from './redisClient';

/**
 * Redlock Manager
 * Handles distributed locking to prevent race conditions across multiple API instances.
 */
const redlock = new Redlock(
  [redis],
  {
    // The expected clock drift; for more check http://redis.io/topics/distlock
    driftFactor: 0.01, // time in ms

    // The max number of times Redlock will attempt to lock a resource before erroring
    retryCount: 10,

    // the time in ms between attempts
    retryDelay: 200, // time in ms

    // the max time in ms randomly added to retries
    // to improve performance under high contention
    // see https://www.iana.org/assignments/rtp-parameters/rtp-parameters.xhtml#rtp-parameters-1
    retryJitter: 200, // time in ms

    // The minimum remaining time on a lock before an extension is allowed
    automaticExtensionThreshold: 500, // time in ms
  }
);

redlock.on('error', (error: any) => {
  // Ignore errors from the underlying redis instances as long as they eventually connect
  console.error('❌ Redlock Error:', error);
});

export default redlock;
