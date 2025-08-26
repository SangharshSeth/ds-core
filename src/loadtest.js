// import http from "k6/http";
// import { check, sleep } from "k6";
// import { Rate, Trend } from "k6/metrics";

// // Custom metrics
// let errorRate = new Rate('errors');
// let responseTime = new Trend('response_time');

// export let options = {
//   stages: [
//     // Warm up
//     { duration: '30s', target: 10 },
    
//     // Load testing - find baseline
//     { duration: '2m', target: 50 },
//     { duration: '2m', target: 100 },
    
//     // Stress testing - push limits
//     { duration: '2m', target: 200 },
//     { duration: '2m', target: 300 },
//     { duration: '2m', target: 400 },
    
//     // Spike test
//     { duration: '30s', target: 1000 },
//     { duration: '30s', target: 100 },
    
//     // Cool down
//     { duration: '1m', target: 0 },
//   ],
  
//   thresholds: {
//     // Less than 1% errors
//     'errors': ['rate<0.01'],
//     // 95% of requests under 500ms
//     'http_req_duration': ['p(95)<500'],
//     // 99% of requests under 1s
//     'http_req_duration': ['p(99)<1000'],
//     // Average response time under 200ms
//     'http_req_duration': ['avg<200'],
//   },
// };

// export default function () {
//   // Test both endpoints
//   let dbResponse = http.get("http://localhost:3000/db");
//   let queueResponse = http.get("http://localhost:3000/queue");
  
//   // Check responses
//   let dbCheck = check(dbResponse, {
//     'DB endpoint status is 200': (r) => r.status === 200,
//     'DB response time < 100ms': (r) => r.timings.duration < 100,
//   });
  
//   let queueCheck = check(queueResponse, {
//     'Queue endpoint status is 200': (r) => r.status === 200,
//     'Queue response time < 100ms': (r) => r.timings.duration < 100,
//   });
  
//   // Record custom metrics
//   errorRate.add(!dbCheck || !queueCheck);
//   responseTime.add(dbResponse.timings.duration);
//   responseTime.add(queueResponse.timings.duration);
  
//   // Simulate user think time
//   sleep(0.1); // 100ms between requests
// }

// export function handleSummary(data) {
//   console.log('\n📊 Load Test Results:');
//   console.log(`Total Requests: ${data.metrics.http_reqs.values.count}`);
//   console.log(`Failed Requests: ${data.metrics.http_req_failed.values.rate * 100}%`);
//   console.log(`Average RPS: ${data.metrics.http_reqs.values.rate}`);
//   console.log(`Average Response Time: ${data.metrics.http_req_duration.values.avg}ms`);
//   console.log(`95th Percentile: ${data.metrics.http_req_duration.values['p(95)']}ms`);
//   console.log(`99th Percentile: ${data.metrics.http_req_duration.values['p(99)']}ms`);
  
//   return {};
// }
import http from "k6/http";
import { check } from "k6";

export let options = {
  stages: [
    { duration: "10s", target: 50 },   // ramp to 50 VUs
    { duration: "10s", target: 100 },  // then 100 VUs
    { duration: "10s", target: 200 },  // then 200 VUs
    { duration: "10s", target: 300 },  // then 300 VUs
    { duration: "10s", target: 400 },  // then 400 VUs
    { duration: "10s", target: 0 },    // ramp down
  ],
  thresholds: {
    http_req_failed: ["rate<0.01"], // stop counting if >1% requests fail
  },
};

// Track max VUs reached without errors
let maxSuccessfulVUs = 0;

export default function () {
  const res = http.get("http://localhost:3000/db");
  const success = check(res, { "status is 200": (r) => r.status === 200 });

  if (success && __VU > maxSuccessfulVUs) {
    maxSuccessfulVUs = __VU;
  }
}

export function handleSummary(data) {
  console.log(`\n✅ Max successful concurrent connections without dropping requests: ${maxSuccessfulVUs}\n`);
  return {};
}
