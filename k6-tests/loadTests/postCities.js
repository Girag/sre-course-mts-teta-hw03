import http from "k6/http";
import { group, check, sleep } from "k6";

const BASE_URL = "http://weather-api.spiva.today";
const SLEEP_DURATION = 0.1;

const CITIES = JSON.parse(open("../data/cities.json"));

export let options = {
    summaryTrendStats: ['avg', 'min', 'med', 'max', 'p(95)', 'p(99)', 'count'],
    thresholds: {
        http_req_failed: [{ threshold: 'rate <= 0.01', abortOnFail: true }],
        http_req_duration: [{ threshold: 'p(99) <= 1000', abortOnFail: true }],
      },
    stages: [
        { duration: "1m", target: 25 },
        { duration: "1m", target: 50 },
        { duration: "1m", target: 100 },
        { duration: "1m", target: 150 },
        { duration: "1m", target: 250 }, 
        { duration: "1m", target: 500 }, 
        { duration: "1m", target: 700 }, 
        { duration: "1m", target: 900 }, 
        { duration: "1m", target: 1000 }, 
        { duration: "1m", target: 0 },
      ],
  };

export function setup() {
    console.log(`Test started: ${new Date().toLocaleString( 'ru', { timeZoneName: 'short' } )}`);
}

export default function() {
    group("/Cities", () => {
        {
            let url = BASE_URL + `/Cities`;
            let params = {headers: {"Content-Type": "application/json", "Accept": "application/json"}};

            for (let i = 0; i < CITIES.length; i++) {
                let body = {
                    "id": i,
                    "name": CITIES[i]
                }

                let request = http.post(url, JSON.stringify(body), params);

                check(request, {
                    "Success": (r) => r.status === 200
                });

                sleep(SLEEP_DURATION);
            }
        }
    });
}

export function teardown(data) {
    console.log(`Test ended: ${new Date().toLocaleString( 'ru', { timeZoneName: 'short' } )}`);
}