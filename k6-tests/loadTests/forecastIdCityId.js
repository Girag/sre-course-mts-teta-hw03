import http from "k6/http";
import { group, check, sleep } from "k6";
import { randomIntBetween, randomString } from 'https://jslib.k6.io/k6-utils/1.2.0/index.js';

const BASE_URL = "http://weather-api.spiva.today";
const SLEEP_DURATION = 0.1;

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

export default function () {
    let id = randomIntBetween(1, 5);
    let cityId = randomIntBetween(1, 5);

    group("/Forecast/{cityId}", () => {
        {
            let url = BASE_URL + `/Forecast/${cityId}`;
            let body = {"id": id, "cityId": cityId, "dateTime": `${new Date().getTime()}`, "temperature": randomIntBetween(-21, 35), "summary": randomString(8)};
            let params = {headers: {"Content-Type": "application/json", "Accept": "application/json"}};
            let request = http.post(url, JSON.stringify(body), params);

            check(request, {
                "Success": (r) => r.status === 200
            });
            globalThis.rid = JSON.parse(request.body).id;
        }
    });

    group("/Forecast/{id}", () => {
        {
            let url = BASE_URL + `/Forecast/${rid}`;
            let body = {"id": rid, "cityId": cityId, "dateTime": `${new Date().getTime()}`, "temperature": randomIntBetween(-21, 35), "summary": randomString(8)};
            let params = {headers: {"Content-Type": "application/json", "Accept": "application/json"}};
            let request = http.put(url, JSON.stringify(body), params);

            check(request, {
                "Success": (r) => r.status === 200
            });
        }

        {
            let url = BASE_URL + `/Forecast/${rid}`;
            let request = http.get(url);

            check(request, {
                "Success": (r) => r.status === 200
            });

            sleep(SLEEP_DURATION);
        }
    });
}

export function teardown(data) {
    console.log(`Test ended: ${new Date().toLocaleString( 'ru', { timeZoneName: 'short' } )}`);
}